/*
  Template de Evento inspirado na estrutura do template SaaS:
  - dados centralizados em data.js e mesclados com o conteúdo da LP
  - seleção de cores dinâmica (primária/acento) com persistência por LP
  - seções modulares focadas em eventos (agenda, ingressos, speakers etc.)
*/

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dataDefault from './data';
import LeadForm from '../../lps/LeadForm';
import { logEvent } from '../../analytics/analytics';

/* --------------------- helpers --------------------- */
function Section({ id, children, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cls = `py-12 transition-all duration-700 ease-out ${
    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
  } ${className}`;
  return (
    <section id={id} ref={ref} className={cls}>
      {children}
    </section>
  );
}

function Container({ children, className = '' }) {
  return (
    <div className={`mx-auto max-w-6xl px-4 ${className}`}>{children}</div>
  );
}

function hexToRgb(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!match) return { r: 255, g: 255, b: 255 };
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function usePersistentColor(key, fallback) {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      setColor(saved || fallback);
    } catch {
      setColor(fallback);
    }
  }, [key, fallback]);

  useEffect(() => {
    if (!color) return;
    try {
      localStorage.setItem(key, color);
    } catch {
      /* ignore */
    }
  }, [key, color]);

  return [color, setColor];
}

function ColorPicker({ color, onChange, label = 'Cor', palette }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const PALETTE = palette || [
    '#7c3aed',
    '#9333ea',
    '#f97316',
    '#ef4444',
    '#facc15',
    '#22d3ee',
    '#14b8a6',
    '#0ea5e9',
    '#3b82f6',
    '#f472b6',
    '#fb7185',
    '#1e293b',
  ];

  function isLight(hex) {
    const { r, g, b } = hexToRgb(hex);
    const luminance =
      0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
    return luminance > 0.85;
  }

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1 text-[13px] text-slate-600 hover:bg-slate-50"
      >
        <span
          aria-hidden
          className="h-4 w-4 rounded-full border"
          style={{
            background: color,
            borderColor: isLight(color) ? '#cbd5e1' : color,
          }}
        />
        {label}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
          <div className="grid grid-cols-6 gap-2">
            {PALETTE.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => {
                  onChange?.(c);
                  setOpen(false);
                }}
                className="h-6 w-6 rounded-full border border-transparent transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400"
                style={{
                  background: c,
                  borderColor: c === color ? '#0f172a' : 'transparent',
                }}
              />
            ))}
          </div>
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(color || '') ? color : '#ffffff'}
            onChange={(e) => {
              onChange?.(e.target.value);
              setOpen(false);
            }}
            className="mt-2 h-8 w-full cursor-pointer rounded border border-slate-200"
          />
        </div>
      )}
    </div>
  );
}

/* --------------------- sections --------------------- */
function Navbar({
  primaryColor,
  accentColor,
  data = {},
  onPickPrimary,
  onPickAccent,
}) {
  const links = Array.isArray(data.links) ? data.links : [];
  const cta = data.cta || { label: 'Inscrever-se', href: '#inscricao' };
  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="text-base font-semibold text-slate-900">
            {data.logo || 'Seu Evento'}
          </div>
          <div className="hidden items-center gap-6 text-sm text-slate-600 lg:flex">
            {links.map((link, index) => (
              <a
                key={link?.href || index}
                href={link?.href || '#'}
                className="hover:text-slate-900"
              >
                {link?.label || 'Seção'}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={cta.href}
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 sm:inline-flex"
              style={{ background: primaryColor }}
            >
              {cta.label}
            </a>
            <div className="hidden items-center gap-2 text-[12px] text-slate-500 sm:flex">
              <ColorPicker
                label="Primária"
                color={primaryColor}
                onChange={onPickPrimary}
              />
              <ColorPicker
                label="Secundária"
                color={accentColor}
                onChange={onPickAccent}
              />
            </div>
            <a
              href={cta.href}
              className="inline-flex rounded-full px-3 py-1 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 sm:hidden"
              style={{ background: primaryColor }}
            >
              {cta.label}
            </a>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 lg:hidden">
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            {links.map((link, index) => (
              <a
                key={link?.href || index}
                href={link?.href || '#'}
                className="hover:text-slate-900"
              >
                {link?.label || 'Seção'}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <ColorPicker
              label="Primária"
              color={primaryColor}
              onChange={onPickPrimary}
            />
            <ColorPicker
              label="Acento"
              color={accentColor}
              onChange={onPickAccent}
            />
          </div>
        </div>
      </Container>
    </nav>
  );
}

function Hero({ primaryColor, accentColor, data = {}, lp }) {
  const stats =
    Array.isArray(data.stats) && data.stats.length > 0
      ? data.stats
      : [
          { label: 'Horas ao vivo', value: '3h' },
          { label: 'Mentores', value: '5' },
          { label: 'Vagas', value: '100' },
        ];
  const gradient = `linear-gradient(120deg, ${primaryColor}, ${accentColor})`;
  const onPrimary = () =>
    logEvent('cta_click', {
      lp_id: lp?.id,
      cta_id: 'evento_primary',
      target: data?.ctaPrimary?.href,
    });
  const onSecondary = () =>
    logEvent('cta_click', {
      lp_id: lp?.id,
      cta_id: 'evento_secondary',
      target: data?.ctaSecondary?.href,
    });

  return (
    <Section id="hero" className="pt-6">
      <Container>
        <div
          className="overflow-hidden rounded-3xl px-6 pb-10 pt-12 text-white md:px-12"
          style={{
            background: gradient,
          }}
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              {data.badge && (
                <span className="inline-flex items-center rounded-full border border-white/40 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/90">
                  {data.badge}
                </span>
              )}
              <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
                {data.title || 'Título do evento'}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">
                {data.subtitle ||
                  'Descreva o valor do encontro, formato e para quem é.'}
              </p>
              <div className="mt-6 grid gap-3 text-sm text-white/90 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur">
                  <div className="text-xs uppercase tracking-wide text-white/70">
                    Quando
                  </div>
                  <div className="text-base font-medium">
                    {data.date || 'Data e horário'}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur">
                  <div className="text-xs uppercase tracking-wide text-white/70">
                    Onde
                  </div>
                  <div className="text-base font-medium">
                    {data.location || 'Local / formato'}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={data.ctaPrimary?.href || '#tickets'}
                  onClick={onPrimary}
                  className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
                  style={{ background: withAlpha('#000000', 0.2) }}
                >
                  {data.ctaPrimary?.label || 'Inscreva-se agora'}
                </a>
                <a
                  href={data.ctaSecondary?.href || '#agenda'}
                  onClick={onSecondary}
                  className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                  style={{
                    borderColor: 'rgba(255,255,255,0.4)',
                    borderWidth: 1,
                    color: '#fff',
                    background: 'transparent',
                  }}
                >
                  {data.ctaSecondary?.label || 'Ver agenda'}
                </a>
              </div>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/15 p-6 backdrop-blur">
              {data.cover ? (
                <img
                  src={data.cover}
                  alt=""
                  className="mb-4 w-full rounded-2xl border border-white/20 object-cover"
                />
              ) : (
                <div className="mb-4 grid h-44 place-items-center rounded-2xl border border-dashed border-white/30 text-white/70">
                  Imagem/teaser do evento
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 text-center text-white">
                {stats.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/20 bg-white/10 px-2 py-4"
                  >
                    <div className="text-2xl font-semibold">
                      {item.value ?? '—'}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-white/70">
                      {item.label ?? ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function Highlights({ accent, data = {} }) {
  const items = Array.isArray(data.items) ? data.items : [];
  if (!items.length) return null;
  return (
    <Section id="beneficios" className="bg-slate-50">
      <Container>
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {data.badge || 'Motivos'}
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            {data.title || 'Por que participar'}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-lg"
                style={{ background: withAlpha(accent, 0.15), color: accent }}
              >
                {item.icon || '★'}
              </div>
              <div className="text-lg font-semibold text-slate-900">
                {item.title}
              </div>
              <p className="mt-2 text-sm text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function Agenda({ theme, accent, data = {} }) {
  const days = Array.isArray(data.days) ? data.days : [];
  if (!days.length) return null;
  return (
    <Section id="agenda">
      <Container>
        <div className="mb-8 max-w-3xl">
          <p
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: withAlpha(theme, 0.9) }}
          >
            Agenda
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            {data.title || 'Programa ao vivo'}
          </h2>
          <p className="mt-2 text-slate-600">
            {data.description ||
              'Compartilhe horários, palestras e momentos importantes.'}
          </p>
        </div>
        <div className="space-y-6">
          {days.map((day, index) => (
            <div
              key={index}
              className="rounded-3xl border border-slate-200 p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="text-lg font-semibold text-slate-900">
                  {day.label}
                </div>
                <div className="text-sm text-slate-500">{day.date}</div>
              </div>
              <div className="mt-4 space-y-4">
                {(day.slots || []).map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className="grid gap-4 rounded-2xl border border-slate-100 p-4 sm:grid-cols-[130px_1fr]"
                  >
                    <div>
                      <div
                        className="text-sm font-semibold"
                        style={{ color: accent }}
                      >
                        {slot.time}
                      </div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        {slot.type}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {slot.title}
                      </div>
                      <div className="text-sm text-slate-600">
                        {slot.speaker}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function Speakers({ theme, data = {} }) {
  const people = Array.isArray(data.people) ? data.people : [];
  if (!people.length) return null;
  return (
    <Section id="speakers" className="bg-slate-50">
      <Container>
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {data.badge || 'Mentores'}
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            {data.title || 'Quem estará no palco'}
          </h2>
          {data.highlight && (
            <p className="mt-2 text-slate-600">{data.highlight}</p>
          )}
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {people.map((person, index) => (
            <div
              key={index}
              className="rounded-3xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center gap-4">
                {person.avatar ? (
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                ) : (
                  <div
                    className="grid h-14 w-14 place-items-center rounded-2xl text-xl font-semibold text-white"
                    style={{ background: theme }}
                  >
                    {(person.name || '?').slice(0, 1)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-slate-900">
                    {person.name}
                  </div>
                  <div className="text-sm text-slate-500">{person.role}</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600">{person.bio}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function Tickets({ theme, accent, data = {}, lp }) {
  const nav = useNavigate();
  const plans = Array.isArray(data.plans) ? data.plans : [];
  if (!plans.length) return null;
  const parsePrice = (txt) => {
    if (typeof txt !== 'string') return Number(txt || 0);
    const cleaned = txt
      .replace(/[^0-9,.]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  };
  const onBuy = (plan, index) => {
    logEvent('cta_click', {
      lp_id: lp?.id,
      cta_id: `evento_ingresso_${plan?.name || index}`,
      target: '#tickets',
    });
    if (lp?.id) {
      const price = parsePrice(plan?.price);
      nav(
        `/checkout/${lp.id}?plan=${encodeURIComponent(plan?.name || '')}&price=${price}`,
      );
    }
  };

  return (
    <Section id="tickets">
      <Container>
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Ingressos
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            {data.title || 'Garanta seu ingresso'}
          </h2>
          <p className="mt-2 text-slate-600">{data.subtitle}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={plan.name || index}
              className={`flex flex-col rounded-3xl border p-5 ${
                plan.featured
                  ? 'border-transparent shadow-lg shadow-indigo-100'
                  : 'border-slate-200'
              }`}
              style={
                plan.featured
                  ? { background: withAlpha(theme, 0.08), borderColor: theme }
                  : {}
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-slate-900">
                    {plan.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {plan.description}
                  </div>
                </div>
                {plan.badge && (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold uppercase text-white"
                    style={{ background: accent }}
                  >
                    {plan.badge}
                  </span>
                )}
              </div>
              <div className="mt-4 text-4xl font-semibold text-slate-900">
                {plan.price}
              </div>
              <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm text-slate-600">
                {(plan.features || []).map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: accent }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onBuy(plan, index)}
                className="mt-6 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{
                  background: theme,
                  color: '#fff',
                  boxShadow: plan.featured
                    ? `0 10px 30px ${withAlpha(theme, 0.4)}`
                    : undefined,
                }}
              >
                Garantir ingresso
              </button>
            </div>
          ))}
        </div>
        {data.disclaimer && (
          <p className="mt-6 text-sm text-slate-500">{data.disclaimer}</p>
        )}
      </Container>
    </Section>
  );
}

function Partners({ accent, data = {} }) {
  const logos = Array.isArray(data.logos) ? data.logos : [];
  if (!logos.length) return null;
  return (
    <Section id="partners" className="bg-white">
      <Container>
        <p className="text-center text-xs uppercase tracking-[0.3em] text-slate-400">
          {data.title || 'Apoio'}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-slate-500">
          {logos.map((logo, index) =>
            logo.logo ? (
              <img
                key={logo.name || index}
                src={logo.logo}
                alt={logo.name}
                className="h-8 w-auto opacity-80"
              />
            ) : (
              <span
                key={logo.name || index}
                className="font-semibold tracking-wide"
                style={{ color: accent }}
              >
                {logo.name || 'Parceiro'}
              </span>
            ),
          )}
        </div>
      </Container>
    </Section>
  );
}

function LeadCapture({ theme, accent, lead = {}, lp }) {
  if (!lp?.id) return null;
  const bg = `linear-gradient(135deg, ${theme}, ${accent})`;
  const btnStyle = {
    background: '#ffffff',
    color: theme,
    borderColor: '#ffffff',
  };
  const textOnDark = lead.textWhite !== false;
  return (
    <Section id="inscricao" className="py-0">
      <Container>
        <div
          className={`grid gap-8 rounded-3xl px-6 py-10 md:grid-cols-2 md:px-12 ${
            textOnDark ? 'text-white' : 'text-slate-900'
          }`}
          style={{ background: bg }}
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
              {lead.badge || 'Lista'}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              {lead.title || 'Garanta sua vaga'}
            </h2>
            <p className="mt-2 text-sm opacity-90">
              {lead.copy ||
                'Deixe seu melhor contato para receber novidades e materiais.'}
            </p>
          </div>
          <LeadForm lpId={lp.id} formId="evento" btnStyle={btnStyle} />
        </div>
      </Container>
    </Section>
  );
}

function Testimonials({ items = [], accent }) {
  if (!items.length) return null;
  return (
    <Section id="testimonials" className="bg-slate-50">
      <Container>
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Depoimentos
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            O que disseram as últimas turmas
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-slate-700">“{item.text}”</p>
              <div className="mt-3 text-sm text-slate-500">
                <span className="font-semibold" style={{ color: accent }}>
                  {item.name}
                </span>{' '}
                • {item.role}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function Venue({ theme, accent, data = {} }) {
  if (!data || (!data.description && !data.address)) return null;
  return (
    <Section id="venue">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Formato
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              {data.title || 'Onde acontece'}
            </h2>
            <p className="mt-4 text-slate-600">{data.description}</p>
            <div className="mt-6 rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-semibold" style={{ color: theme }}>
                Endereço / link
              </div>
              <div className="text-base text-slate-800">{data.address}</div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {(data.highlights || []).map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: accent }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {data.mapEmbed ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow">
              <iframe
                title="Localização do evento"
                src={data.mapEmbed}
                className="h-full min-h-[320px] w-full"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-slate-400">
              Espaço para mapa ou print da plataforma
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

function Faq({ theme, items = [] }) {
  const [open, setOpen] = useState(null);
  if (!items.length) return null;
  return (
    <Section id="faq" className="bg-slate-50">
      <Container>
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            FAQ
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            Perguntas frequentes
          </h2>
        </div>
        <div className="space-y-3">
          {items.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => setOpen(open === index ? null : index)}
              >
                <span className="font-medium text-slate-900">{faq.q}</span>
                <span
                  className="text-2xl leading-none"
                  style={{ color: theme }}
                >
                  {open === index ? '–' : '+'}
                </span>
              </button>
              {open === index && (
                <div className="border-t border-slate-100 px-4 py-4 text-sm text-slate-600">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function Footer({ data = {} }) {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <Container>
        <div className="text-sm text-slate-500">{data.note}</div>
      </Container>
    </footer>
  );
}

/* --------------------- template --------------------- */
export default function EventoTemplate({ lp }) {
  const safeLP = useMemo(() => lp || {}, [lp]);
  const base = dataDefault;
  const content = useMemo(() => {
    const c = safeLP.content || {};
    return {
      theme: c.theme ?? base.theme ?? '#7c3aed',
      accent: c.accent ?? base.accent ?? '#f97316',
      navbar: { ...(base.navbar || {}), ...(c.navbar || {}) },
      hero: { ...(base.hero || {}), ...(c.hero || {}) },
      highlights: { ...(base.highlights || {}), ...(c.highlights || {}) },
      agenda: { ...(base.agenda || {}), ...(c.agenda || {}) },
      speakers: { ...(base.speakers || {}), ...(c.speakers || {}) },
      tickets: { ...(base.tickets || {}), ...(c.tickets || {}) },
      testimonials: c.testimonials ?? base.testimonials ?? [],
      partners: { ...(base.partners || {}), ...(c.partners || {}) },
      venue: { ...(base.venue || {}), ...(c.venue || {}) },
      faq: c.faq ?? base.faq ?? [],
      leadForm: { ...(base.leadForm || {}), ...(c.leadForm || {}) },
      footer: { ...(base.footer || {}), ...(c.footer || {}) },
    };
  }, [safeLP, base]);

  const primaryKey = `plp:lp:${safeLP.id ?? 'unknown'}:evento:primary`;
  const accentKey = `plp:lp:${safeLP.id ?? 'unknown'}:evento:accent`;
  const [primaryColor, setPrimaryColor] = usePersistentColor(
    primaryKey,
    content.theme,
  );
  const [accentColor, setAccentColor] = usePersistentColor(
    accentKey,
    content.accent,
  );

  return (
    <div className="bg-white text-slate-900">
      <Navbar
        primaryColor={primaryColor}
        accentColor={accentColor}
        data={content.navbar}
        onPickPrimary={setPrimaryColor}
        onPickAccent={setAccentColor}
      />
      <main>
        <Hero
          primaryColor={primaryColor}
          accentColor={accentColor}
          data={content.hero}
          lp={safeLP}
        />
        <Highlights accent={accentColor} data={content.highlights} />
        <Agenda
          theme={primaryColor}
          accent={accentColor}
          data={content.agenda}
        />
        <Speakers
          theme={primaryColor}
          accent={accentColor}
          data={content.speakers}
        />
        <Tickets
          theme={primaryColor}
          accent={accentColor}
          data={content.tickets}
          lp={safeLP}
        />
        <Partners accent={accentColor} data={content.partners} />
        <LeadCapture
          theme={primaryColor}
          accent={accentColor}
          lead={content.leadForm}
          lp={safeLP}
        />
        <Testimonials accent={accentColor} items={content.testimonials} />
        <Venue theme={primaryColor} accent={accentColor} data={content.venue} />
        <Faq theme={primaryColor} items={content.faq} />
      </main>
      <Footer data={content.footer} />
    </div>
  );
}
