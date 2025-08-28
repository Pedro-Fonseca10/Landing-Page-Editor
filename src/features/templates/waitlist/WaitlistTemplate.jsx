import dataDefault from "./data"
import { Section, Container } from "../ui.jsx"
import LeadForm from "../../lps/LeadForm"

export default function WaitlistTemplate({ lp }) {
  const c = { ...dataDefault, ...(lp.content || {}) }
  return (
    <div className="bg-white min-h-screen">
      <Section id="hero" className="bg-gray-50">
        <Container>
          <h1 className="text-3xl font-semibold">{c.hero.title}</h1>
          <p className="text-gray-600">{c.hero.subtitle}</p>
        </Container>
      </Section>

      <Section id="benefits">
        <Container>
          <ul className="grid gap-3 list-disc pl-6">
            {c.bullets.map((b,i)=><li key={i}>{b}</li>)}
          </ul>
        </Container>
      </Section>

      <Section id="waitlist">
        <Container>
          <h2 className="text-2xl font-semibold mb-4">Entrar na lista</h2>
          <LeadForm lpId={lp.id} formId="waitlist" />
        </Container>
      </Section>

      <footer className="border-t">
        <Container><div className="h-16 flex items-center text-sm text-gray-600">{c.footer.note}</div></Container>
      </footer>
    </div>
  )
}
