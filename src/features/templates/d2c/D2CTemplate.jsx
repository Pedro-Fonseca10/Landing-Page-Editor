import dataDefault from "./data"
import { Section, Container, Button } from "../ui.jsx"
import { logEvent } from "../../analytics/analytics"

export default function D2CTemplate({ lp }) {
  const c = { ...dataDefault, ...(lp.content || {}) }
  const t = c.product
  const theme = c.theme
  const onBuy = () => logEvent("cta_click", { lp_id: lp.id, cta_id: "buy_now", target: t.ctaHref })

  return (
    <div className="bg-white min-h-screen">
      <Section id="hero" className="bg-gray-50">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <h1 className="text-3xl font-semibold">{t.name}</h1>
              <p className="text-gray-600">{t.tagline}</p>
              <ul className="text-sm mt-2 list-disc pl-5">{t.bullets.map((b,i)=><li key={i}>{b}</li>)}</ul>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-2xl font-semibold">{t.price}</span>
                <Button href={t.ctaHref} onClick={onBuy} style={{ borderColor: theme, color: theme }}>
                  {t.ctaText}
                </Button>
              </div>
            </div>
            {t.img ? <img className="w-full rounded-xl border" src={t.img} alt="" /> : <div className="h-56 border rounded-xl grid place-items-center text-gray-400">imagem</div>}
          </div>
        </Container>
      </Section>

      <footer className="border-t">
        <Container><div className="h-16 flex items-center text-sm text-gray-600">{c.footer.note}</div></Container>
      </footer>
    </div>
  )
}
