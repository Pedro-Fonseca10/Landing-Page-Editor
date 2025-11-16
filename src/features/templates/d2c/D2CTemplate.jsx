import { useMemo } from 'react';
import dataDefault from './data';
import { Section, Container, Button } from '../ui.jsx';
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

const fallbackImage =
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80';

export default function D2CTemplate({ lp }) {
  const content = useMemo(
    () => mergeDeep(dataDefault, lp?.content || {}),
    [lp?.content],
  );

  const palette = {
    text: content?.theme?.text || content?.theme?.primary || '#0f172a',
    subtle: content?.theme?.subtle || '#475569',
    accent: content?.theme?.accent || '#f97316',
    background: content?.theme?.background || '#fff7ed',
    muted: content?.theme?.muted || '#fef3c7',
  };

  const hero = content.hero || {};
  const highlights = asArray(content.highlights);
  const lifestyle = content.lifestyle || {};
  const bundles = asArray(content.bundles);
  const testimonials = asArray(content.testimonials);
  const guarantee = content.guarantee || {};
  const faq = asArray(content.faq);
  const logos = asArray(content.socialProof?.logos);
  const heroBullets = asArray(hero.bullets);
  const heroStats = asArray(hero.stats);
  const lifestyleBullets = asArray(lifestyle.bullets);
  const guaranteeBullets = asArray(guarantee.bullets);

  const handleCta = (label, extra = {}) =>
    logEvent('cta_click', {
      lp_id: lp.id,
      template: 'd2c',
      label,
      ...extra,
    });

  return (
    <div
      className="min-h-screen"
      style={{ background: palette.background, color: palette.text }}
    >
      <div style={{ background: palette.background }}>
        <Section id="hero" className="pb-16 pt-12">
          <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div>
              {hero.label && (
                <span
                  className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                  style={{
                    border: `1px solid ${palette.accent}33`,
                    color: palette.subtle,
                  }}
                >
                  {hero.label}
                </span>
              )}
              <div className="mt-4 space-y-4">
                <h1 className="text-4xl font-semibold sm:text-5xl">
                  {hero.title || lp.titulo || 'Produto D2C'}
                </h1>
                <p className="text-lg" style={{ color: palette.subtle }}>
                  {hero.description}
                </p>
                {heroBullets.length > 0 && (
                  <ul className="grid gap-2 text-sm md:grid-cols-2">
                    {heroBullets.map((item, index) => (
                      <li
                        key={item || index}
                        className="flex items-start gap-2"
                      >
                        <span
                          className="mt-1 h-1.5 w-1.5 rounded-full"
                          style={{ background: palette.accent }}
                        />
                        <span style={{ color: palette.subtle }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="rounded-2xl border bg-white px-6 py-4 shadow-sm">
                  <div
                    className="text-xs uppercase tracking-wide"
                    style={{ color: palette.subtle }}
                  >
                    Lançamento exclusivo
                  </div>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-4xl font-bold">{hero.price}</span>
                    {hero.oldPrice && (
                      <span
                        className="text-sm line-through"
                        style={{ color: palette.subtle }}
                      >
                        {hero.oldPrice}
                      </span>
                    )}
                  </div>
                  {hero.shipping && (
                    <p className="text-xs" style={{ color: palette.subtle }}>
                      {hero.shipping}
                    </p>
                  )}
                </div>

                {hero.ctaPrimary?.label && (
                  <Button
                    href={hero.ctaPrimary.href || '#comprar'}
                    onClick={() => handleCta('hero_primary')}
                    className="border-transparent text-white shadow-lg shadow-orange-200 hover:-translate-y-0.5 hover:shadow-orange-300"
                    style={{
                      background: palette.accent,
                      borderColor: palette.accent,
                    }}
                  >
                    {hero.ctaPrimary.label}
                  </Button>
                )}
                {hero.ctaSecondary?.label && (
                  <Button
                    href={hero.ctaSecondary.href || '#detalhes'}
                    onClick={() => handleCta('hero_secondary')}
                    className="border-[#00000020] bg-white/80 hover:bg-white"
                    style={{ color: palette.text }}
                  >
                    {hero.ctaSecondary.label}
                  </Button>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                {hero.shipping && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1">
                    🚚 {hero.shipping}
                  </span>
                )}
                {hero.guarantee && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1">
                    ✅ {hero.guarantee}
                  </span>
                )}
                {hero.reviews && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1">
                    ⭐ {hero.reviews}
                  </span>
                )}
              </div>

              {heroStats.length > 0 && (
                <div className="mt-8 grid gap-4 border-t border-white/50 pt-6 sm:grid-cols-2">
                  {heroStats.map((stat, index) => (
                    <div key={stat?.label || index}>
                      <div className="text-2xl font-semibold">
                        {stat?.value}
                      </div>
                      <p style={{ color: palette.subtle }}>{stat?.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              {hero.badge && (
                <span
                  className="absolute right-6 top-6 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800 shadow"
                  style={{ border: `1px solid ${palette.accent}33` }}
                >
                  {hero.badge}
                </span>
              )}
              <div className="overflow-hidden rounded-3xl border border-white/60 bg-white shadow-xl">
                <img
                  src={hero.image || fallbackImage}
                  alt={hero.title || 'Produto'}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </Container>
        </Section>
      </div>

      {logos.length > 0 && (
        <Section id="press" className="border-y border-slate-100 bg-white">
          <Container className="flex flex-col items-center gap-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              {content.socialProof?.badge || 'Visto em'}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {logos.map((logo, index) => (
                <span key={logo || index} className="opacity-80">
                  {logo}
                </span>
              ))}
            </div>
            {content.socialProof?.text && (
              <p style={{ color: palette.subtle }}>
                {content.socialProof.text}
              </p>
            )}
          </Container>
        </Section>
      )}

      {highlights.length > 0 && (
        <Section id="beneficios">
          <Container>
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold">
                Por que consumidores amam a SmartBottle
              </h2>
              <p style={{ color: palette.subtle }}>
                Tecnologia discreta, design premium e insights que geram hábitos
                saudáveis.
              </p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {highlights.map((item, index) => (
                <div
                  key={item?.title || index}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  <div className="text-3xl">{item?.icon || '✨'}</div>
                  <h3 className="mt-4 text-lg font-semibold">{item?.title}</h3>
                  <p className="mt-2 text-sm" style={{ color: palette.subtle }}>
                    {item?.text}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {(lifestyle.title || lifestyle.image) && (
        <Section
          id="lifestyle"
          className="bg-slate-50/60"
          style={{ background: palette.muted }}
        >
          <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em]">
                Lifestyle
              </p>
              <h2 className="text-3xl font-semibold">{lifestyle.title}</h2>
              <p style={{ color: palette.subtle }}>{lifestyle.description}</p>
              {lifestyleBullets.length > 0 && (
                <ul className="mt-4 space-y-3 text-sm">
                  {lifestyleBullets.map((item, index) => (
                    <li key={item || index} className="flex gap-2">
                      <span style={{ color: palette.accent }}>•</span>
                      <span style={{ color: palette.subtle }}>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="overflow-hidden rounded-3xl border border-white shadow-lg">
              <img
                src={lifestyle.image || fallbackImage}
                alt={lifestyle.title || 'Lifestyle'}
                className="h-full w-full object-cover"
              />
            </div>
          </Container>
        </Section>
      )}

      {bundles.length > 0 && (
        <Section id="kits">
          <Container>
            <div className="space-y-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em]">
                Kits
              </p>
              <h2 className="text-3xl font-semibold">
                Escolha o combo ideal para você
              </h2>
              <p style={{ color: palette.subtle }}>
                Economia progressiva, suporte dedicado e frete grátis em todos
                os kits.
              </p>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {bundles.map((bundle, index) => (
                <div
                  key={bundle.id || index}
                  className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  {bundle.badge && (
                    <span
                      className="inline-flex w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold"
                      style={{ color: palette.accent }}
                    >
                      {bundle.badge}
                    </span>
                  )}
                  <h3 className="mt-3 text-xl font-semibold">{bundle.name}</h3>
                  <p style={{ color: palette.subtle }}>{bundle.description}</p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-3xl font-bold">{bundle.price}</span>
                    {bundle.oldPrice && (
                      <span
                        className="text-sm line-through"
                        style={{ color: palette.subtle }}
                      >
                        {bundle.oldPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: palette.subtle }}>
                    {bundle.delivery}
                  </p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm">
                    {asArray(bundle.benefits).map((benefit, idx) => (
                      <li key={benefit || idx} className="flex gap-2">
                        <span style={{ color: palette.accent }}>✓</span>
                        <span style={{ color: palette.subtle }}>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    href={bundle.href || hero.ctaPrimary?.href || '#comprar'}
                    onClick={() =>
                      handleCta('bundle', { bundle_id: bundle.id })
                    }
                    className="mt-6 border-transparent text-white shadow-lg"
                    style={{
                      background: palette.accent,
                      borderColor: palette.accent,
                    }}
                  >
                    Comprar kit
                  </Button>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {testimonials.length > 0 && (
        <Section
          id="reviews"
          className="bg-slate-50/80"
          style={{ background: palette.muted }}
        >
          <Container>
            <div className="space-y-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em]">
                Social proof
              </p>
              <h2 className="text-3xl font-semibold">
                Clientes reais, resultados reais
              </h2>
              <p style={{ color: palette.subtle }}>
                {hero.reviews || '+1.200 avaliações verificadas'}
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((dep, index) => (
                <div
                  key={dep?.name || index}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  <div
                    className="flex items-center gap-2"
                    style={{ color: palette.accent }}
                  >
                    {'★'.repeat(dep.rating || 5)}
                  </div>
                  <p className="mt-4 text-sm" style={{ color: palette.subtle }}>
                    “{dep.quote}”
                  </p>
                  <div className="mt-6 text-sm font-semibold">{dep.name}</div>
                  <p className="text-xs" style={{ color: palette.subtle }}>
                    {dep.location}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {(guarantee.title || faq.length > 0) && (
        <Section id="seguranca">
          <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div>
              {guarantee.title && (
                <h2 className="text-3xl font-semibold">{guarantee.title}</h2>
              )}
              <p className="mt-3" style={{ color: palette.subtle }}>
                {guarantee.description}
              </p>
              {guaranteeBullets.length > 0 && (
                <ul className="mt-6 space-y-3 text-sm">
                  {guaranteeBullets.map((item, index) => (
                    <li key={item || index} className="flex gap-2">
                      <span style={{ color: palette.accent }}>●</span>
                      <span style={{ color: palette.subtle }}>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {faq.length > 0 && (
                <div className="mt-8 space-y-4">
                  {faq.map((item, index) => (
                    <details
                      key={item?.question || index}
                      className="rounded-2xl border border-slate-100 bg-white p-4"
                    >
                      <summary className="cursor-pointer text-sm font-semibold">
                        {item?.question}
                      </summary>
                      <p
                        className="mt-2 text-sm"
                        style={{ color: palette.subtle }}
                      >
                        {item?.answer}
                      </p>
                    </details>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
              <img
                src={guarantee.image || fallbackImage}
                alt={guarantee.title || 'Garantia'}
                className="h-full w-full object-cover"
              />
            </div>
          </Container>
        </Section>
      )}

      <footer className="border-t border-slate-100 bg-white">
        <Container>
          <div
            className="py-8 text-center text-sm"
            style={{ color: palette.subtle }}
          >
            {content.footer?.note ||
              `© ${new Date().getFullYear()} - Produto D2C`}
          </div>
        </Container>
      </footer>
    </div>
  );
}
