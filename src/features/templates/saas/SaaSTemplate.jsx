/*
  Template SaaS para landing pages
  - por padrão, usa dados de 'dataDefault' (import estático)
  - quando recebe 'lp' com 'content', faz merge com os dados default
  - permite personalização de cores (fundo e texto) via localStorage
*/

import { useMemo, useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import dataDefault from "./data"
import LeadForm from "../../lps/LeadForm"
import { logEvent } from "../../analytics/analytics"


/* utilitários de layout */
function Section({ id, children }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const cls = `py-12 transition-all duration-700 ease-out ${
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
  } motion-reduce:transition-none motion-reduce:transform-none`

  return (
    <section id={id} ref={ref} className={cls}>
      {children}
    </section>
  )
}
function Container({ children }) {
  return <div className="mx-auto max-w-5xl px-4">{children}</div>
}

/* seletor de cor principal */
function ColorPicker({ color, onChange, label = "Cor", palette }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const PALETTE = [
    "#0f172a", // Azul escuro padrão (slate-900)
    "#000000", // Preto
    "#ffffff", // Branco
    "#f8fafc", // Cinza muito claro (slate-50)
    "#e2e8f0", // Cinza claro (slate-200)
    "#94a3b8", // Cinza médio (slate-400)
    // cores adicionais caso queira variar
    "#0ea5e9", // Sky 500
    "#1d4ed8", // Blue 700
    "#0f766e", // Teal 700
    "#16a34a", // Green 600
    "#ca8a04", // Yellow 600
    "#ea580c", // Orange 600
    "#dc2626", // Red 600
    "#7c3aed", // Violet 600
    "#9333ea", // Purple 600
    "#db2777", // Pink 600
  ]

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!m) return { r: 255, g: 255, b: 255 }
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
  }
  function isLight(hex) {
    const { r, g, b } = hexToRgb(hex)
    const luminance = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255)
    return luminance > 0.85
  }

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Escolher cor do tema"
        className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <span
          aria-hidden
          className="inline-block h-4 w-4 rounded-full border"
          style={{ background: color, borderColor: isLight(color) ? "#cbd5e1" : color }}
        />
        {label}
      </button>
      {open && (
        <div className="absolute right-0 z-[9999] mt-2 w-48 rounded-md border border-slate-200 bg-white p-2 shadow-md dark:border-slate-700 dark:bg-slate-900">
          <div className="grid grid-cols-6 gap-2">
            {(palette || PALETTE).map((c) => {
              const light = isLight(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    onChange?.(c)
                    setOpen(false)
                  }}
                  aria-label={`Usar cor ${c}`}
                  className={`h-6 w-6 rounded-full ring-offset-2 focus:outline-none focus:ring-2 ${light ? "border border-slate-300" : ""}`}
                  style={{ background: c, boxShadow: c === color ? `0 0 0 2px ${c}` : undefined }}
                  title={c}
                />
              )
            })}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(color || "") ? color : "#0f172a"}
              onChange={(e) => {
                onChange?.(e.target.value)
                setOpen(false)
              }}
              className="h-6 w-10 cursor-pointer rounded border border-slate-300 bg-white p-0"
              aria-label="Escolher uma cor personalizada"
            />
            <span className="text-xs text-slate-600 dark:text-slate-300">Escolher</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* navbar */
function Navbar({ theme, data = {}, onPickBgColor, bgColor, onPickTextColor, textColor }) {
  const links = Array.isArray(data.links) ? data.links : []
  const cta = data.cta || { href: "#", label: "Começar" }
  return (
    <nav className="relative z-50 border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
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
            <ColorPicker color={bgColor} onChange={onPickBgColor} label="Fundo" />
            <ColorPicker
              color={textColor}
              onChange={onPickTextColor}
              label="Texto"
              palette={["#000000", "#ffffff", "#111827", "#6b7280", "#9ca3af", "#d1d5db"]}
            />
          </div>
          <div className="sm:hidden">
            <div className="inline-flex items-center gap-2">
              <ColorPicker color={bgColor} onChange={onPickBgColor} label="Fundo" />
              <ColorPicker
                color={textColor}
                onChange={onPickTextColor}
                label="Texto"
                palette={["#000000", "#ffffff", "#111827", "#6b7280", "#9ca3af", "#d1d5db"]}
              />
            </div>
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
function PromoBanner({ theme, data = {}, lp }) {
  const btnText = data.btnText ?? "Assine Já"
  const btnHref = data.btnHref ?? "#pricing"
  const onClick = () => logEvent("cta_click", { lp_id: lp?.id, cta_id: "banner", target: btnHref })
  const nav = useNavigate()

  const hasImg = !!data.img
  const heightPx = Math.max(120, Number.parseInt(data.height, 10) || 288) // altura editável; default 288px
  return (
    <Section id="banner">
      <div className="relative w-full">
        {hasImg ? (
          <img src={data.img} alt="banner" className="w-full object-cover" style={{ height: heightPx }} />
        ) : (
          <div className="grid w-full place-items-center border-y border-dashed border-slate-300 text-slate-400 dark:border-slate-700" style={{ height: heightPx }}>
            Imagem do banner (ex.: 1600x400)
          </div>
        )}
        <div className="pointer-events-none absolute inset-0">
          <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 transform">
            <a
              href={btnHref}
              onClick={(e)=>{ e.preventDefault(); onClick(); if (lp?.id) nav(`/checkout/${lp.id}`) }}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-md transition hover:-translate-y-0.5"
              style={{ background: theme }}
            >
              {btnText}
              <span aria-hidden className="text-lg">→</span>
            </a>
          </div>
        </div>
      </div>
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
  const nav = useNavigate()
  const parsePrice = (txt) => {
    if (typeof txt !== "string") return Number(txt || 0)
    const cleaned = txt.replace(/[^0-9,.]/g, "").replace(/\./g, "").replace(",", ".")
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : 0
  }
  const onBuy = (plan) => {
    logEvent("cta_click", { lp_id: lp?.id, cta_id: `buy_${plan?.name}`, target: "#buy" })
    const price = parsePrice(plan?.price)
    if (lp?.id) nav(`/checkout/${lp.id}?plan=${encodeURIComponent(plan?.name || "")}&price=${price}`)
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
  const safeLP = useMemo(() => lp || {}, [lp])
  // 'dataDefault' é um import estático; não precisa de useMemo
  const base = dataDefault
  
  // Merge: usa conteúdo da LP quando existir; senão, cai no default
  const content = useMemo(() => {
    const c = safeLP.content || {}
    return {
      theme: c.theme ?? base.theme ?? "#0ea5e9",
      navbar: { ...(base.navbar || {}), ...(c.navbar || {}) },
      hero: { ...(base.hero || {}), ...(c.hero || {}) },
      features: c.features ?? base.features ?? [],
      pricing: { ...(base.pricing || {}), ...(c.pricing || {}) },
      banner: { ...(base.banner || {}), ...(c.banner || {}) },
      steps: c.steps ?? base.steps ?? [],
      screenshots: c.screenshots ?? base.screenshots ?? [],
      testimonials: c.testimonials ?? base.testimonials ?? [],
      faq: c.faq ?? base.faq ?? [],
      leadForm: { ...(base.leadForm || {}), ...(c.leadForm || {}) },
      footer: { ...(base.footer || {}), ...(c.footer || {}) },
    }
  }, [safeLP, base])

  // Cor de fundo da página (persistência por LP)
  const bgKey = `plp:lp:${safeLP.id ?? "unknown"}:saas:bg`
  const defaultBg = "#0f172a" // antigo dark bg (slate-900) como azul escuro
  const [bg, setBg] = useState(() => {
    try {
      const saved = localStorage.getItem(bgKey)
      return saved || defaultBg
    } catch {
      return defaultBg
    }
  })

  useEffect(() => {
    try { localStorage.setItem(bgKey, bg) } catch {/* ignore */}
  }, [bg, bgKey])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(bgKey)
      setBg(saved || defaultBg)
    } catch {
      setBg(defaultBg)
    }
  }, [bgKey])

  // Aplica automaticamente classe 'dark' baseado na luminosidade do fundo
  useEffect(() => {
    function hexToRgb(hex) {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!m) return { r: 255, g: 255, b: 255 }
      return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    }
    function isDarkColor(hex) {
      const { r, g, b } = hexToRgb(hex || "#ffffff")
      // luminância relativa simples
      const luminance = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255)
      return luminance < 0.5
    }
    const root = document.documentElement
    if (isDarkColor(bg)) root.classList.add("dark")
    else root.classList.remove("dark")
  }, [bg])

  // Cor do texto (persistência por LP)
  const fgKey = `plp:lp:${safeLP.id ?? "unknown"}:saas:fg`
  const [fg, setFg] = useState(() => {
    try {
      const saved = localStorage.getItem(fgKey)
      if (saved) return saved
    } catch { /* ignore read errors */ }
    // sem salvo: define com base no bg atual salvo ou padrão
    try {
      const savedBg = localStorage.getItem(bgKey) || defaultBg
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(savedBg)
      const r = m ? parseInt(m[1], 16) : 0
      const g = m ? parseInt(m[2], 16) : 0
      const b = m ? parseInt(m[3], 16) : 0
      const lum = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255)
      return lum < 0.5 ? "#ffffff" : "#111827"
    } catch {
      return "#ffffff"
    }
  })

  useEffect(() => {
    try { localStorage.setItem(fgKey, fg) } catch {/* ignore */}
  }, [fg, fgKey])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(fgKey)
      if (saved) setFg(saved)
      else {
        // recalcula default a partir do bg atual
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bg)
        const r = m ? parseInt(m[1], 16) : 0
        const g = m ? parseInt(m[2], 16) : 0
        const b = m ? parseInt(m[3], 16) : 0
        const lum = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255)
        setFg(lum < 0.5 ? "#ffffff" : "#111827")
      }
    } catch { /* ignore read errors */ }
  }, [fgKey, bg])

  return (
    <div className="min-h-screen" style={{ background: bg }} data-plp-text-root="1">
      {/* Força a cor do texto em todo o subtree */}
      {fg ? (
        <style>{`[data-plp-text-root="1"], [data-plp-text-root="1"] * { color: ${fg} !important; }`}</style>
      ) : null}
      <Navbar theme={content.theme} data={content.navbar} onPickBgColor={setBg} bgColor={bg} onPickTextColor={setFg} textColor={fg} />
      <Hero theme={content.theme} data={content.hero} lp={safeLP} />
      <PromoBanner theme={content.theme} data={content.banner} lp={safeLP} />
      <Features data={content.features} />
      <HowItWorks steps={content.steps} />
      {Array.isArray(content.screenshots) && content.screenshots.length > 0 && (
        <Screenshots shots={content.screenshots} />
      )}
      <Pricing theme={content.theme} data={content.pricing} lp={safeLP} />

      {/* CTA/Lead form (opcional) */}
      {safeLP?.id && (
        <Section id="cta">
          <Container>
            {(() => {
              const useWhite = !!content?.leadForm?.textWhite
              const btnStyle = useWhite
                ? { background: content.theme, color: "#ffffff", borderColor: content.theme }
                : {}
              return <LeadForm lpId={safeLP.id} btnStyle={btnStyle} />
            })()}
          </Container>
        </Section>
      )}

      <Testimonials items={content.testimonials} />
      <Faq theme={content.theme} items={content.faq} />
      <Footer data={content.footer} />
    </div>
  )
}
