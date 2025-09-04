import { useMemo, useState, useEffect } from "react"
import dataDefault from "./data"
import LeadForm from "../../lps/LeadForm"
import { logEvent } from "../../analytics/analytics"

/* utilitários de layout */
function Section({ id, children }) {
  return <section id={id} className="py-12">{children}</section>
}
function Container({ children }) {
  return <div className="mx-auto max-w-5xl px-4">{children}</div>
}

/* alternância de tema */
function ThemeToggle({ dark, setDark }) {
  return (
    <button
      type="button"
      onClick={() => setDark(v => !v)}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {dark ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.64 5.64L4.22 4.22M19.78 19.78l-1.42-1.42M18.36 5.64l1.42-1.42M4.22 19.78l1.42-1.42" />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  )
}

/* navbar */
function Navbar({ theme, data = {}, dark, setDark }) {
  const links = Array.isArray(data.links) ? data.links : []
  const cta = data.cta || { href: "#", label: "Começar" }
  return (
    <nav className="border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <div className="font-semibold text-slate-900 dark:text-white">{data.logo ?? "LOGO"}</div>
          <div className="hidden items-center gap-3 sm:flex">
            {links.map((l, i) => (
              <a key={l?.href || i} href={l?.href || "#"} className="text-sm text-slate-700 hover:underline dark:text-slate-300">
                {l?.label ?? "Link"}
              </a>
            ))}
            <a href={cta.href} className="rounded border px-3 py-1 text-sm" style={{ borderColor: theme, color: theme }}>
              {cta.label}
            </a>
            <ThemeToggle dark={dark} setDark={setDark} />
          </div>
          <div className="sm:hidden">
            <ThemeToggle dark={dark} setDark={setDark} />
          </div>
        </div>
      </Container>
    </nav>
  )
}

/* hero */
function Hero({ theme, data = {}, lp }) {
  const onClick = () =>
    logEvent("cta_click", { lp_id: lp?.id, cta_id: "hero", target: data.ctaHref })

  return (
    <Section id="hero">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/20" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-500/20" />
        <Container>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="[&>*]:transition-all">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                {data.title ?? "Título do seu produto"}
              </h1>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                {data.subtitle ?? "Subtítulo persuasivo que explica seu valor."}
              </p>
              <div className="mt-5 flex gap-3">
                <a
                  href={data.ctaHref ?? "#"}
                  onClick={onClick}
                  className="rounded-lg px-4 py-2 text-white shadow-sm hover:-translate-y-0.5"
                  style={{ background: theme }}
                >
                  {data.ctaText ?? "Começar agora"}
                </a>
                <a
                  href="#features"
                  className="rounded-lg border px-4 py-2 hover:-translate-y-0.5"
                  style={{ borderColor: theme, color: theme }}
                >
                  Ver recursos
                </a>
              </div>
            </div>

            {data.img ? (
              <img
                src={data.img}
                alt=""
                className="w-full rounded-xl border border-slate-200 shadow-sm dark:border-slate-800"
              />
            ) : (
              <div className="grid h-56 place-items-center rounded-xl border border-dashed border-slate-300 text-slate-400 dark:border-slate-700 md:h-72">
                Imagem destaque
              </div>
            )}
          </div>
        </Container>
      </div>
    </Section>
  )
}

/* logos */
function Logos({ items = [] }) {
  const list = items.length ? items : ["LOGO", "LOGO", "LOGO", "LOGO", "LOGO"]
  return (
    <Section id="logos">
      <Container>
        <div className="grid grid-cols-2 items-center justify-items-center gap-6 opacity-80 sm:grid-cols-3 md:grid-cols-5">
          {list.map((t, i) => (
            <div
              key={i}
              className="h-10 w-28 rounded border border-slate-200 bg-white/70 text-center text-xs leading-10 text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"
            >
              {t}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

/* features */
function Features({ data = [] }) {
  return (
    <Section id="features">
      <Container>
        <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">Recursos</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {data.map((f, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800">
              <div className="font-medium text-slate-900 dark:text-slate-100">{f.title}</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{f.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

/* steps */
function HowItWorks({ steps = [] }) {
  const list = steps.length
    ? steps
    : [
        { title: "Crie sua conta", text: "Leva menos de 2 minutos.", icon: "👋" },
        { title: "Escolha um template", text: "Selecione o que combina com seu negócio.", icon: "🎨" },
        { title: "Publique e acompanhe", text: "Meça conversões em tempo real.", icon: "📈" },
      ]
  return (
    <Section id="como-funciona">
      <Container>
        <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">Como funciona</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {list.map((s, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800">
              <div className="mb-2 text-2xl">{s.icon}</div>
              <div className="font-medium text-slate-900 dark:text-slate-100">{s.title}</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{s.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

/* pricing */
function Pricing({ theme, data = {}, lp }) {
  const plans = Array.isArray(data.plans) ? data.plans : []
  const onBuy = (plan) => {
    logEvent("cta_click", { lp_id: lp?.id, cta_id: `buy_${plan?.name}`, target: "#buy" })
  }
  return (
    <Section id="pricing">
      <Container>
        <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">Planos</h2>
        <p className="mb-6 text-slate-600 dark:text-slate-300">{data.subtitle ?? "Escolha o plano ideal."}</p>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={"rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md " + (p.featured ? "ring-1 ring-offset-1" : "")}
              style={p.featured ? { borderColor: theme, boxShadow: `0 0 0 1px ${theme}` } : {}}
            >
              <div className="font-medium text-slate-900 dark:text-slate-100">{p.name}</div>
              <div className="my-2 text-3xl text-slate-900 dark:text-white">
                {p.price}
                <span className="text-base text-slate-500 dark:text-slate-400">{p.period}</span>
              </div>
              <ul className="mb-4 list-disc pl-5 text-sm text-slate-700 dark:text-slate-300">
                {(p.features || []).map((it, i) => <li key={i}>{it}</li>)}
              </ul>
              <button className="w-full rounded border px-3 py-2" style={{ borderColor: theme, color: theme }} onClick={() => onBuy(p)}>
                Comprar
              </button>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

/* screenshots */
function Screenshots({ shots = [] }) {
  const list = shots.length ? shots : [null, null, null]
  return (
    <Section id="screenshots">
      <Container>
        <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">Screenshots</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {list.map((src, i) =>
            src ? (
              <img key={i} src={src} alt="screenshot" className="h-40 w-auto rounded-lg border border-slate-200 shadow-sm dark:border-slate-800" />
            ) : (
              <div key={i} className="grid h-40 w-64 flex-shrink-0 place-items-center rounded-lg border border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
                Imagem {i + 1}
              </div>
            ),
          )}
        </div>
      </Container>
    </Section>
  )
}

/* depoimentos */
function Testimonials({ items = [] }) {
  const list = items.length
    ? items
    : [
        { name: "Ana", text: "Aumentamos 30% nas conversões em 2 semanas." },
        { name: "Bruno", text: "Fácil de usar e resultados rápidos." },
      ]
  return (
    <Section id="depoimentos">
      <Container>
        <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">Depoimentos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((t, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-800">
              <p className="text-slate-700 dark:text-slate-300">“{t.text}”</p>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">— {t.name}</div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

/* FAQ */
function Faq({ theme, items = [] }) {
  const [open, setOpen] = useState(null)
  const list = items
  return (
    <Section id="faq">
      <Container>
        <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">Perguntas Frequentes</h2>
        <div className="grid gap-2">
          {list.map((f, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-medium text-slate-900 dark:text-slate-100">{f.q}</span>
                <span style={{ color: theme }}>{open === i ? "–" : "+"}</span>
              </button>
              {open === i && <div className="px-4 pb-4 text-slate-700 dark:text-slate-300">{f.a}</div>}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

/* rodapé */
function Footer({ data = {} }) {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <Container>
        <div className="flex h-16 items-center text-sm text-slate-600 dark:text-slate-400">{data.note ?? "© Sua empresa"}</div>
      </Container>
    </footer>
  )
}

/* ---- TEMPLATE PRINCIPAL ---- */
export default function SaaSTemplate({ lp }) {
  const safeLP = lp || {}
  const base = dataDefault || {}

  // Merge: usa conteúdo da LP quando existir; senão, cai no default
  const content = useMemo(() => {
    const c = safeLP.content || {}
    return {
      theme: c.theme ?? base.theme ?? "#0ea5e9",
      navbar: { ...(base.navbar || {}), ...(c.navbar || {}) },
      hero: { ...(base.hero || {}), ...(c.hero || {}) },
      features: c.features ?? base.features ?? [],
      pricing: { ...(base.pricing || {}), ...(c.pricing || {}) },
      logos: c.logos ?? base.logos ?? [],
      steps: c.steps ?? base.steps ?? [],
      screenshots: c.screenshots ?? base.screenshots ?? [],
      testimonials: c.testimonials ?? base.testimonials ?? [],
      faq: c.faq ?? base.faq ?? [],
      footer: { ...(base.footer || {}), ...(c.footer || {}) },
    }
  }, [safeLP, base])

  // Dark mode local por LP (persistência simples)
  const storageKey = `plp:lp:${safeLP.id ?? "unknown"}:saas:dark`
  const [dark, setDark] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "false") } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(dark)) } catch {
      // Ignore
    }
  }, [dark, storageKey])

  // aplica/remove classe no <html>
  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add("dark")
    else root.classList.remove("dark")
    return () => {
      // opcional: ao desmontar, remover para não vazar p/ outras páginas
      root.classList.remove("dark")
    }
  }, [dark])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar theme={content.theme} data={content.navbar} dark={dark} setDark={setDark} />
      <Hero theme={content.theme} data={content.hero} lp={safeLP} />
      <Logos items={content.logos} />
      <Features data={content.features} />
      <HowItWorks steps={content.steps} />
      <Screenshots shots={content.screenshots} />
      <Pricing theme={content.theme} data={content.pricing} lp={safeLP} />

      {/* CTA/Lead form (opcional) */}
      {safeLP?.id && (
        <Section id="cta">
          <Container>
            <LeadForm lpId={safeLP.id} />
          </Container>
        </Section>
      )}

      <Testimonials items={content.testimonials} />
      <Faq theme={content.theme} items={content.faq} />
      <Footer data={content.footer} />
    </div>
  )
}

