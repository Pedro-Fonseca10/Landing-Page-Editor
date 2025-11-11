/*
  Funções para carregar eventos e calcular métricas analíticas.
  Inclui filtragem de eventos por intervalo de datas e agregação de métricas como visitantes, sessões, taxa de conversão, etc.
*/

import { getEvents } from './analytics';

const inRange = (ts, start, end) => {
  const t = new Date(ts).getTime();
  return (
    (!start || t >= new Date(start).getTime()) &&
    (!end || t <= new Date(end).getTime())
  );
};

export function loadEventsInRange({ start = null, end = null } = {}) {
  return getEvents().filter((ev) => inRange(ev.timestamp, start, end));
}

export function computeMetrics(events) {
  const byVisitor = new Map(),
    bySession = new Map(),
    bySource = new Map();
  let pageViews = 0,
    clicks = 0,
    submits = 0,
    conversions = 0;

  for (const ev of events) {
    byVisitor.set(ev.visitor_id, true);
    if (!bySession.has(ev.session_id)) bySession.set(ev.session_id, []);
    bySession.get(ev.session_id).push(ev);

    const src = ev.utm_source || '(direct)';
    bySource.set(src, (bySource.get(src) || []).concat(ev));

    if (ev.type === 'page_view') pageViews++;
    if (ev.type === 'cta_click') clicks++;
    if (ev.type === 'form_submit') submits++;
    if (ev.type === 'conversion') conversions++;
  }

  // bounce: sessão com apenas 1 page_view e sem interação (click/start/submit/conversion)
  let bounces = 0;
  for (const sessEvents of bySession.values()) {
    const pv = sessEvents.filter((e) => e.type === 'page_view').length;
    const interacted = sessEvents.some(
      (e) =>
        e.type === 'cta_click' ||
        e.type === 'form_start' ||
        e.type === 'form_submit' ||
        e.type === 'conversion',
    );
    if (pv === 1 && !interacted) bounces++;
  }

  const visitors = byVisitor.size;
  const sessions = bySession.size;
  const ctr = pageViews ? clicks / pageViews : 0;
  const convRateSessions = sessions ? conversions / sessions : 0;
  const convRateVisitors = visitors ? conversions / visitors : 0;
  const bounceRate = sessions ? bounces / sessions : 0;

  // breakdown por utm_source
  const sources = [];
  for (const [src, list] of bySource.entries()) {
    const pv = list.filter((e) => e.type === 'page_view').length;
    const cv = list.filter((e) => e.type === 'conversion').length;
    sources.push({
      source: src,
      page_views: pv,
      conversions: cv,
      conv_rate: pv ? cv / pv : 0,
      sessions: new Set(list.map((e) => e.session_id)).size,
      visitors: new Set(list.map((e) => e.visitor_id)).size,
    });
  }
  sources.sort(
    (a, b) => b.conversions - a.conversions || b.page_views - a.page_views,
  );

  return {
    visitors,
    sessions,
    pageViews,
    clicks,
    submits,
    conversions,
    ctr,
    convRateSessions,
    convRateVisitors,
    bounceRate,
    sources,
  };
}
