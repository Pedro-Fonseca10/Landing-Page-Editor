import { useRef, useState } from "react"
import { logEvent } from "../analytics/analytics"

export default function LeadForm({ lpId, formId = "lead", btnStyle = {} }) {
  const [sent, setSent] = useState(false)
  const started = useRef(false)

  const onFocusFirst = () => {
    if (!started.current) {
      started.current = true
      logEvent("form_start", { lp_id: lpId, form_id: formId })
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const payload = Object.fromEntries(data.entries())
    logEvent("form_submit", { lp_id: lpId, form_id: formId, status: "success", payload })
    // opcional: se o envio representar uma conversão, registre:
    logEvent("conversion", { lp_id: lpId, goal_id: "lead_submit", valor: 0 })
    setSent(true)
    e.currentTarget.reset()
  }

  if (sent) return <p className="text-green-600">Obrigado! Entraremos em contato.</p>

  return (
    <form className="grid gap-3 max-w-md" onSubmit={onSubmit}>
      <input name="nome" className="border p-2 rounded" placeholder="Seu nome" onFocus={onFocusFirst} />
      <input name="email" className="border p-2 rounded" placeholder="Seu e-mail" type="email" />
      <button className="border rounded px-3 py-2" style={btnStyle}>Enviar</button>
    </form>
  )
}
