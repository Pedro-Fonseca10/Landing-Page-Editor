import dataDefault from './data';
import { Section, Container, Button } from '../ui.jsx';
import LeadForm from '../../lps/LeadForm';
import { logEvent } from '../../analytics/analytics';

export default function EventoTemplate({ lp }) {
  const c = { ...dataDefault, ...(lp.content || {}) };
  const theme = c.theme;
  const onCta = () =>
    logEvent('cta_click', {
      lp_id: lp.id,
      cta_id: 'evento_inscrever',
      target: c.hero.ctaHref,
    });

  return (
    <div className="bg-white min-h-screen">
      <Section id="hero" className="bg-gray-50">
        <Container>
          <h1 className="text-3xl font-semibold">{c.hero.title}</h1>
          <p className="text-gray-600">{c.hero.subtitle}</p>
          <p className="mt-2 text-sm text-gray-700">
            {c.hero.date} · {c.hero.place}
          </p>
          <div className="mt-4">
            <Button
              href={c.hero.ctaHref}
              onClick={onCta}
              style={{ borderColor: theme, color: theme }}
            >
              {c.hero.ctaText}
            </Button>
          </div>
        </Container>
      </Section>

      <Section id="highlights">
        <Container>
          <h2 className="text-2xl font-semibold mb-4">
            O que você vai aprender
          </h2>
          <ul className="grid gap-3 list-disc pl-6">
            {c.highlights.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </Container>
      </Section>

      {c.speakers?.length > 0 && (
        <Section id="speakers" className="bg-gray-50">
          <Container>
            <h2 className="text-2xl font-semibold mb-4">Palestrantes</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {c.speakers.map((s, i) => (
                <div key={i} className="border rounded-xl p-4">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-gray-600">{s.role}</div>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section id="inscricao">
        <Container>
          <h2 className="text-2xl font-semibold mb-4">Inscreva-se</h2>
          <LeadForm lpId={lp.id} formId="evento" />
        </Container>
      </Section>

      <footer className="border-t">
        <Container>
          <div className="h-16 flex items-center text-sm text-gray-600">
            {c.footer.note}
          </div>
        </Container>
      </footer>
    </div>
  );
}
