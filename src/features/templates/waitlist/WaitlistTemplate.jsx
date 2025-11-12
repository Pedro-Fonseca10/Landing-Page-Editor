import { useMemo } from 'react';
import dataDefault from './data';
import { Section, Container, Button } from '../ui.jsx';
import LeadForm from '../../lps/LeadForm';
import { logEvent } from '../../analytics/analytics';

const mergeDeep = (base, source) => {
  if (Array.isArray(base) || Array.isArray(source)) {
    if (Array.isArray(source) && source.length) return source;
    return Array.isArray(base) ? base : [];
  }
  if (
    (typeof base === 'object' && base !== null) ||
    (typeof source === 'object' && source !== null)
  ) {
    const result = { ...(base || {}) };
    Object.entries(source || {}).forEach(([key, value]) => {
      result[key] = mergeDeep(base?.[key], value);
    });
    return result;
  }
  return source !== undefined ? source : base;
};

const asArray = (value) => (Array.isArray(value) ? value : []);
const fallbackHeroImage =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80';

function Hero({ palette, hero = {}, lpId, onCta }) {
  const bullets = asArray(hero.bullets);
  const stats = asArray(hero.stats);
  const slots = hero.slots || {};
  return (
    <Section
      id="hero"
      className="bg-gradient-to-b from-white via-white to-transparent pb-16 pt-10"
    >
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div>
          {hero.eyebrow && (
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              style={{ background: `${palette.primary}10`, color: palette.primary }}
            >
              {hero.eyebrow}
            </span>
          )}
          <div className="mt-4 space-y-4">
            <h1 className="text-4xl font-semibold sm:text-5xl">
              {hero.title || 'Abra o acesso a quem quer testar primeiro'}
            </h1>
            <p className="text-lg text-slate-600">
              {hero.subtitle ||
                'Apresente o futuro do seu produto e convide pessoas estratégicas para a lista de espera.'}
            </p>
            {bullets.length > 0 && (
              <ul className="grid gap-3 text-sm md:grid-cols-2">
                {bullets.map((item, index) => (
                  <li key={item?.title || index} className="flex gap-3">
                    <span
                      className="mt-1 h-1.5 w-1.5 rounded-full"
                      style={{ background: palette.accent || palette.primary }}
                    />
                    <div>
                      <p className="font-medium text-slate-900">{item?.title || item}</p>
                      {item?.description && (
                        <p className="text-slate-500">{item.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {hero.cta?.label && (
              <Button
                href={hero.cta.href || '#waitlist'}
                onClick={() => onCta('hero_primary', hero.cta.href)}
                className="border-transparent text-white shadow-lg shadow-blue-200 hover:-translate-y-0.5"
                style={{
                  background: palette.primary,
                  borderColor: palette.primary,
                }}
              >
                {hero.cta.label}
              </Button>
            )}
            {hero.secondaryCta?.label && (
              <Button
                href={hero.secondaryCta.href || '#timeline'}
                onClick={() => onCta('hero_secondary', hero.secondaryCta.href)}
                className="bg-white/70 text-slate-700 hover:bg-white"
              >
                {hero.secondaryCta.label}
              </Button>
            )}
          </div>

          {stats.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {stats.map((stat, index) => (
                <div key={stat?.label || index}>
                  <div className="text-3xl font-semibold text-slate-900">
                    {stat?.value}
                  </div>
                  <p className="text-sm text-slate-500">{stat?.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white/90 p-6 shadow-2xl ring-1 ring-slate-100 backdrop-blur">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {hero.formTitle || 'Garanta seu convite'}
              </div>
              <p className="text-sm text-slate-500">
                {hero.formSubtitle ||
                  'Preencha os dados e receberá prioridade assim que liberarmos novas vagas.'}
              </p>
            </div>
            <div className="pt-5">
              <LeadForm
                lpId={lpId}
                formId="waitlist_hero"
                btnStyle={{
                  background: palette.primary,
                  borderColor: palette.primary,
                  color: '#ffffff',
                }}
              />
              {hero.note && (
                <p className="mt-3 text-xs text-slate-500">{hero.note}</p>
              )}
            </div>
          </div>

          {(slots?.label || slots?.value) && (
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {slots.label || 'Vagas disponíveis'}
              </p>
              <p className="text-3xl font-semibold text-slate-900">
                {slots.value || '150'}
              </p>
              {slots.caption && (
                <p className="text-sm text-slate-500">{slots.caption}</p>
              )}
            </div>
          )}

          {hero.image && (
            <img
              src={hero.image || fallbackHeroImage}
              alt={hero.imageAlt || 'Prévia do produto'}
              className="w-full rounded-3xl border border-slate-100 object-cover shadow-lg"
            />
          )}
        </div>
      </Container>
    </Section>
  );
}

function Highlights({ palette, items = [] }) {
  const list = asArray(items);
  if (!list.length) return null;
  return (
    <Section id="highlights" className="border-y border-slate-100 bg-white">
      <Container className="grid gap-5 md:grid-cols-3">
        {list.map((item, index) => (
          <div
            key={item?.title || index}
            className="rounded-2xl border border-slate-100 px-5 py-6 shadow-sm"
          >
            {item?.tag && (
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: palette.accent || palette.primary }}
              >
                {item.tag}
              </span>
            )}
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              {item?.title}
            </h3>
            <p className="mt-2 text-sm text-slate-500">{item?.text}</p>
          </div>
        ))}
      </Container>
    </Section>
  );
}

function Timeline({ palette, items = [] }) {
  const list = asArray(items);
  if (!list.length) return null;
  return (
    <Section id="timeline" className="bg-slate-50/70">
      <Container>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Calendário
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Como funciona o acesso em ondas
          </h2>
        </div>
        <div className="relative mt-10">
          <div className="absolute left-3 top-0 h-full w-px bg-slate-200" />
          <div className="space-y-8">
            {list.map((item, index) => (
              <div
                key={item?.title || index}
                className="relative flex gap-6 pl-8"
              >
                <span
                  className="absolute left-0 top-2 h-3 w-3 rounded-full ring-4 ring-white"
                  style={{ background: palette.primary }}
                />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {item?.label}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {item?.title}
                  </h3>
                  <p className="text-sm text-slate-500">{item?.description}</p>
                  {item?.date && (
                    <p className="mt-2 text-xs text-slate-400">{item.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function Perks({ items = [] }) {
  const list = asArray(items);
  if (!list.length) return null;
  return (
    <Section id="perks">
      <Container>
        <div className="grid gap-4 md:grid-cols-3">
          {list.map((item, index) => (
            <div
              key={item?.title || index}
              className="rounded-2xl border border-slate-100 bg-white px-5 py-6 shadow-sm"
            >
              <div className="text-2xl" aria-hidden>
                {item?.icon || '✨'}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                {item?.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">{item?.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function SocialProof({ data = {} }) {
  const logos = asArray(data.logos);
  const quotes = asArray(data.quotes);
  if (!logos.length && !quotes.length) return null;
  return (
    <Section id="social-proof" className="bg-white">
      <Container className="space-y-10">
        {data.label && (
          <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-500">
            {data.label}
          </p>
        )}
        {logos.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-500">
            {logos.map((logo, index) => {
              const label = typeof logo === 'string' ? logo : logo?.label;
              return (
                <span
                  key={label || index}
                  className="rounded-full border border-slate-100 px-4 py-2"
                >
                  {label || 'LOGO'}
                </span>
              );
            })}
          </div>
        )}
        {quotes.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {quotes.map((quote, index) => (
              <div
                key={quote?.author || index}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5"
              >
                <p className="text-slate-600">“{quote?.text}”</p>
                <p className="mt-3 text-sm font-medium text-slate-900">
                  {quote?.author}
                </p>
                {quote?.role && (
                  <p className="text-xs text-slate-500">{quote.role}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

function FinalCta({ palette, data = {}, lpId, onCta }) {
  if (!data?.title && !data?.cta?.label) return null;
  return (
    <Section id="waitlist" className="pb-16 pt-0">
      <Container>
        <div
          className="grid gap-8 rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 p-8 shadow-lg lg:grid-cols-2"
          style={{ borderColor: `${palette.primary}20` }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {data.eyebrow || 'Lista prioritária'}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">
              {data.title || 'Segure seu lugar na próxima leva'}
            </h2>
            {data.subtitle && (
              <p className="mt-2 text-slate-600">{data.subtitle}</p>
            )}
            {data.note && (
              <p className="mt-4 text-sm text-slate-500">{data.note}</p>
            )}
            {data.cta?.label && (
              <div className="mt-6">
                <Button
                  href={data.cta.href || '#waitlist'}
                  onClick={() => onCta('section_cta', data.cta.href)}
                  className="border-transparent text-white shadow-lg hover:-translate-y-0.5"
                  style={{
                    background: palette.primary,
                    borderColor: palette.primary,
                  }}
                >
                  {data.cta.label}
                </Button>
              </div>
            )}
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100">
            <LeadForm
              lpId={lpId}
              formId="waitlist_final"
              btnStyle={{
                background: palette.primary,
                borderColor: palette.primary,
                color: '#ffffff',
              }}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

function Faq({ items = [] }) {
  const list = asArray(items);
  if (!list.length) return null;
  return (
    <Section id="faq">
      <Container className="max-w-3xl">
        <h2 className="text-2xl font-semibold text-slate-900">
          Perguntas frequentes
        </h2>
        <div className="mt-6 space-y-4">
          {list.map((item, index) => (
            <div
              key={item?.q || index}
              className="rounded-2xl border border-slate-100 bg-white px-5 py-4"
            >
              <p className="font-medium text-slate-900">{item?.q}</p>
              <p className="text-sm text-slate-600">{item?.a}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function SiteFooter({ note }) {
  if (!note) return null;
  return (
    <footer className="border-t border-slate-100 bg-white">
      <Container>
        <div className="flex h-16 items-center text-sm text-slate-500">
          {note}
        </div>
      </Container>
    </footer>
  );
}

export default function WaitlistTemplate({ lp }) {
  const safeLP = useMemo(() => lp || {}, [lp]);
  const content = useMemo(
    () => mergeDeep(dataDefault, safeLP.content || {}),
    [safeLP.content],
  );
  const palette = {
    primary: content.theme?.primary || content.theme || '#2563eb',
    accent: content.theme?.accent || '#a855f7',
    surface: content.theme?.surface || '#f8fafc',
    text: content.theme?.text || '#0f172a',
  };

  const announcement = content.announcement || {
    label: content.hero?.eyebrow,
    text: content.hero?.availability,
  };

  const handleCta = (ctaId, href) =>
    logEvent('cta_click', {
      lp_id: safeLP.id,
      template: 'waitlist',
      cta_id: ctaId,
      target: href,
    });

  return (
    <div
      className="min-h-screen"
      style={{ background: palette.surface, color: palette.text }}
    >
      {(announcement?.label || announcement?.text) && (
        <div className="border-b border-white/60 bg-white/70 text-sm backdrop-blur">
          <Container className="flex flex-wrap items-center gap-3 py-3 text-slate-600">
            {announcement?.label && (
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900"
                style={{ background: `${palette.primary}15` }}
              >
                {announcement.label}
              </span>
            )}
            {announcement?.text && <span>{announcement.text}</span>}
          </Container>
        </div>
      )}

      <Hero palette={palette} hero={content.hero} lpId={safeLP.id} onCta={handleCta} />
      <Highlights palette={palette} items={content.highlights} />
      <Timeline palette={palette} items={content.milestones} />
      <Perks items={content.perks} />
      <SocialProof data={content.socialProof} />
      <FinalCta
        palette={palette}
        data={content.finalCta}
        lpId={safeLP.id}
        onCta={handleCta}
      />
      <Faq items={content.faq} />
      <SiteFooter note={content.footer?.note} />
    </div>
  );
}
