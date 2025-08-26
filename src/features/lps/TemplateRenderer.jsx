import { useEffect } from "react"
import { logEvent } from "../analytics/analytics"

export default function TemplateRenderer({ lp }) {
  const c = lp.content

  useEffect(() => {
    logEvent("page_view", { lp_id: lp.id })
  }, [lp?.id])

  const onCtaClick = () => {
    logEvent("cta_click", { lp_id: lp.id, cta_id: "primary", target: c.ctaHref })
  }

  return (
    <div className="min-h-screen" style={{ background: "#fff" }}>
      <header className="p-6" style={{ background: c.theme }}>
        <div className="max-w-5xl mx-auto text-white">
          <h1 className="text-3xl font-semibold">{c.headline}</h1>
          <p className="opacity-90">{c.subhead}</p>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6 grid gap-6">
        {c.heroUrl && <img src={c.heroUrl} alt="" className="w-full rounded-xl border" />}
        <p className="text-lg">{c.body}</p>
        <a href={c.ctaHref} onClick={onCtaClick}
           className="inline-block px-4 py-3 rounded-lg border"
           style={{ borderColor: c.theme, color: c.theme }}>
          {c.ctaText}
        </a>
      </main>
      <footer className="max-w-5xl mx-auto p-6 text-sm text-gray-500">© {new Date().getFullYear()}</footer>
    </div>
  )
}

