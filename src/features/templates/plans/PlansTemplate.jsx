import dataDefault from "./data"
import { Section, Container, Button } from "../ui.jsx"
import { logEvent } from "../../analytics/analytics"

export default function PlansTemplate({ lp }) {
  const c = { ...dataDefault, ...(lp.content || {}) }
  const theme = c.theme
  const onChoose = (name) => logEvent("cta_click", { lp_id: lp.id, cta_id: `choose_${name}`, target: "#choose" })

  return (
    <div className="bg-white min-h-screen">
      <Section id="hero" className="bg-gray-50">
        <Container>
          <h1 className="text-3xl font-semibold">{c.hero.title}</h1>
          <p className="text-gray-600">{c.hero.subtitle}</p>
        </Container>
      </Section>

      <Section id="plans">
        <Container>
          <div className="overflow-auto border rounded">
            <table className="min-w-[720px] w-full">
              <thead className="bg-gray-50">
                <tr>
                  <Th></Th>
                  {c.plans.map(p => <Th key={p.name}>{p.name}<div className="text-xs text-gray-500">{p.price}</div></Th>)}
                </tr>
              </thead>
              <tbody>
                {c.features.map((f, rowIdx)=>(
                  <tr key={rowIdx} className="border-t">
                    <Td className="font-medium">{f}</Td>
                    {c.plans.map(p => <Td key={p.name + rowIdx}>{p.values[rowIdx]}</Td>)}
                  </tr>
                ))}
                <tr className="border-t">
                  <Td></Td>
                  {c.plans.map(p => (
                    <Td key={p.name + "_cta"}>
                      <Button onClick={() => onChoose(p.name)} style={{ borderColor: theme, color: theme }}>
                        Escolher {p.name}
                      </Button>
                    </Td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      <footer className="border-t">
        <Container><div className="h-16 flex items-center text-sm text-gray-600">{c.footer.note}</div></Container>
      </footer>
    </div>
  )
}
function Th({ children }) { return <th className="text-left p-3 text-sm font-medium text-gray-700">{children}</th> }
function Td({ children, className="" }) { return <td className={"p-3 " + className}>{children}</td> }
