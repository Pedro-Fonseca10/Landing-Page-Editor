import dataDefault from "./data"
import { Section, Container } from "../ui.jsx"
import LeadForm from "../../lps/LeadForm"

export default function PortfolioTemplate({ lp }) {
  const c = { ...dataDefault, ...(lp.content || {}) }
  return (
    <div className="bg-white min-h-screen">
      <Section id="hero" className="bg-gray-50">
        <Container>
          <h1 className="text-3xl font-semibold">{c.hero.title}</h1>
          <p className="text-gray-600">{c.hero.subtitle}</p>
        </Container>
      </Section>

      <Section id="services">
        <Container>
          <h2 className="text-2xl font-semibold mb-4">Serviços</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {c.services.map((s,i)=>(
              <div key={i} className="border rounded-xl p-4">
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-gray-600">{s.text}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="showcase" className="bg-gray-50">
        <Container>
          <h2 className="text-2xl font-semibold mb-4">Portfólio</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {c.showcase.map((w,i)=>(
              <div key={i} className="border rounded-xl p-4">
                <div className="font-medium">{w.name}</div>
                <div className="text-sm text-gray-600">{w.role}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="contato">
        <Container>
          <h2 className="text-2xl font-semibold mb-4">Fale com a gente</h2>
          <LeadForm lpId={lp.id} formId="portfolio" />
        </Container>
      </Section>

      <footer className="border-t">
        <Container><div className="h-16 flex items-center text-sm text-gray-600">{c.footer.note}</div></Container>
      </footer>
    </div>
  )
}
