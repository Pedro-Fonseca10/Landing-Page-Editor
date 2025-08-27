// import { useEffect } from "react"
// import { logEvent } from "../analytics/analytics"
// import { createOrder } from "../orders/orders"

// export default function TemplateRenderer({ lp }) {
//   const c = lp.content

//   useEffect(() => {
//     logEvent("page_view", { lp_id: lp.id })
//   }, [lp?.id])

//   const onCtaClick = (e) => {
//     logEvent("cta_click", { lp_id: lp.id, cta_id: "primary", target: c.ctaHref })
//     // fluxo de compra quando ctaHref === "#buy"
//     if (c.ctaHref === "#buy") {
//       e.preventDefault()
//       const order = createOrder({
//         lp,
//         amount: Number(c.price || 0),
//         descricao_oferta: c.headline || lp.titulo || "Oferta"
//       })
//       // redireciona ao "gateway externo" simulado
//       window.location.href = `/pay/${order.id_pedido}`
//     }
//   }

//   return (
//     <div className="min-h-screen" style={{ background: "#fff" }}>
//       <header className="p-6" style={{ background: c.theme }}>
//         <div className="max-w-5xl mx-auto text-white">
//           <h1 className="text-3xl font-semibold">{c.headline}</h1>
//           <p className="opacity-90">{c.subhead}</p>
//         </div>
//       </header>
//       <main className="max-w-5xl mx-auto p-6 grid gap-6">
//         {c.heroUrl && <img src={c.heroUrl} alt="" className="w-full rounded-xl border" />}
//         <p className="text-lg">{c.body}</p>

//         <a
//           href={c.ctaHref}
//           onClick={onCtaClick}
//           className="inline-block px-4 py-3 rounded-lg border"
//           style={{ borderColor: c.theme, color: c.theme }}
//         >
//           {c.ctaText}
//         </a>
//       </main>
//       <footer className="max-w-5xl mx-auto p-6 text-sm text-gray-500">© {new Date().getFullYear()}</footer>
//     </div>
//   )
// }

import { useEffect } from "react"
import { logEvent } from "../analytics/analytics"
import SaaSTemplate from "../templates/saas/SaaSTemplate"

export default function TemplateRenderer({ lp }) {
  useEffect(() => {
    if (lp?.id) logEvent("page_view", { lp_id: lp.id })
  }, [lp?.id])

  if (!lp) return null

  // Selecione a renderização pelo id_template
  switch (lp.id_template) {
    case "saas":
    case "saas b2b":
      return <SaaSTemplate lp={lp} />
    default: {
      // Fallback simples (o que já existia previamente):
      const c = lp.content || {}
      return (
        <div className="min-h-screen bg-white">
          <header className="p-6" style={{ background: c.theme || "#0ea5e9" }}>
            <div className="max-w-5xl mx-auto text-white">
              <h1 className="text-3xl font-semibold">{c.headline || "Título"}</h1>
              <p className="opacity-90">{c.subhead || ""}</p>
            </div>
          </header>
          <main className="max-w-5xl mx-auto p-6 grid gap-6">
            {c.heroUrl && <img src={c.heroUrl} alt="" className="w-full rounded-xl border" />}
            <p className="text-lg">{c.body}</p>
            <a href={c.ctaHref} className="inline-block px-4 py-3 rounded-lg border"
               style={{ borderColor: c.theme || "#0ea5e9", color: c.theme || "#0ea5e9" }}>
              {c.ctaText || "Saiba mais"}
            </a>
          </main>
          <footer className="max-w-5xl mx-auto p-6 text-sm text-gray-500">© {new Date().getFullYear()}</footer>
        </div>
      )
    }
  }
}