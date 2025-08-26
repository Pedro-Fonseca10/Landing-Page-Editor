import { useEffect, useMemo, useState } from "react"
import dataDefault from "./data"
import LeadForm from "../../lps/LeadForm"
import { logEvent } from "../../analytics/analytics"

function Section({ id, children }) {
  return <section id={id} className="py-12">{children}</section>
}

function Container({ children }) {
  return <div className="max-w-5xl mx-auto px-4">{children}</div>
}

function Navbar({ theme, data }) {
  return (
    <nav className="border-b">
      <Container>
        <div className="h-14 flex items-center justify-between">
          <div className="font-semibold">{data.logo}</div>
          <div className="hidden sm:flex items-center gap-6">
            {data.links.map((l) => <a key={l.href} href={l.href} className="text-sm hover:underline">{l.label}</a>)}
            <a href={data.cta.href} className="text-sm px-3 py-1 rounded border" style={{ borderColor: theme, color: theme }}>
              {data.cta.label}
            </a>
          </div>
        </div>
      </Container>
    </nav>
  )
}

function Hero({ theme, data, lp }) {
  const onClick = () => logEvent("cta_click", { lp_id: lp.id, cta_id: "hero", target: data.ctaHref })
  return (
    <Section id="hero">
      <Container>
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">{data.title}</h1>
            <p className="mt-2 text-gray-600">{data.subtitle}</p>
            <div className="mt-4 flex gap-2">
              <a href={data.ctaHref} onClick={onClick} className="px-4 py-2 rounded text-white"
                 style={{ background: theme }}>
                {data.ctaText}
              </a>
              <a href="#features" className="px-4 py-2 rounded border" style={{ borderColor: theme, color: theme }}>
                Ver recursos
              </a>
            </div>
          </div>
          {data.img ? <img src={data.img} alt="" className="w-full rounded-xl border" /> : <div className="border rounded-xl h-48 md:h-64 grid place-items-center text-gray-400">imagem</div>}
        </div>
      </Container>
    </Section>
  )
}

function Features({ data }) {
  return (
    <Section id="features">
      <Container>
        <h2 className="text-2xl font-semibold mb-6">Recursos</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {data.map((f, i) => (
            <div key={i} className="border rounded-xl p-4">
              <div className="font-medium">{f.title}</div>
              <p className="text-sm text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

function Pricing({ theme, data, lp }) {
  const onBuy = (plan) => {
    logEvent("cta_click", { lp_id: lp.id, cta_id: `buy_${plan.name}`, target: "#buy" })
    // RF-12: aqui depois criaremos o pedido "pendente" antes de redirecionar (RF-13).
  }
  return (
    <Section id="pricing">
      <Container>
        <h2 className="text-2xl font-semibold mb-2">Planos</h2>
        <p className="text-gray-600 mb-6">{data.subtitle}</p>
        <div className="grid gap-4 md:grid-cols-3">
          {data.plans.map((p) => (
            <div key={p.name} className={"rounded-xl border p-4 " + (p.featured ? "ring-1 ring-offset-2" : "")} style={p.featured ? { borderColor: theme, boxShadow: `0 0 0 1px ${theme}` } : {}}>
              <div className="font-medium">{p.name}</div>
              <div className="text-3xl my-2">{p.price}<span className="text-base text-gray-500">{p.period}</span></div>
              <ul className="text-sm text-gray-700 mb-4 list-disc pl-5">
                {p.features.map((it, i) => <li key={i}>{it}</li>)}
              </ul>
              <button className="w-full border rounded px-3 py-2" style={{ borderColor: theme, color: theme }} onClick={() => onBuy(p)}>
                Comprar
              </button>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

function Faq({ theme, items=[] }) {
  const [open, setOpen] = useState(null)
  return (
    <Section id="faq">
      <Container>
        <h2 className="text-2xl font-semibold mb-6">Perguntas Frequentes</h2>
        <div className="grid gap-2">
          {items.map((f, i) => (
            <div key={i} className="border rounded-xl">
              <button className="w-full text-left px-4 py-3 flex justify-between items-center"
                      onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-medium">{f.q}</span>
                <span style={{ color: theme }}>{open === i ? "–" : "+"}</span>
              </button>
              {open === i && <div className="px-4 pb-4 text-gray-700">{f.a}</div>}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

function Footer({ data }) {
  return (
    <footer className="border-t">
      <Container>
        <div className="h-16 flex items-center text-sm text-gray-600">{data.note}</div>
      </Container>
    </footer>
  )
}

export default function SaaSTemplate({ lp }) {
  // Merge: se a LP tiver conteúdo próprio, usa; senão cai no default centralizado
  const content = useMemo(() => {
    return {
      theme: lp?.content?.theme ?? dataDefault.theme,
      navbar: { ...dataDefault.navbar, ...(lp?.content?.navbar || {}) },
      hero: { ...dataDefault.hero, ...(lp?.content?.hero || {}) },
      features: lp?.content?.features ?? dataDefault.features,
      pricing: { ...dataDefault.pricing, ...(lp?.content?.pricing || {}) },
      faq: lp?.content?.faq ?? dataDefault.faq,
      footer: { ...dataDefault.footer, ...(lp?.content?.footer || {}) },
    }
  }, [lp])

  useEffect(() => {
    // page_view já é disparado no TemplateRenderer genérico; se preferir, pode disparar aqui.
  }, [lp?.id])

  return (
    <div className="min-h-screen bg-white">
      <Navbar theme={content.theme} data={content.navbar} />
      <Hero theme={content.theme} data={content.hero} lp={lp} />
      <Features data={content.features} />
      <Pricing theme={content.theme} data={content.pricing} lp={lp} />
      {/* Opcional: formulário de lead abaixo dos planos */}
      <Section id="cta"><Container><LeadForm lpId={lp.id} /></Container></Section>
      <Faq theme={content.theme} items={content.faq} />
      <Footer data={content.footer} />
    </div>
  )
}