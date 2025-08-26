import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { load, save } from "../../lib/storage"
import { defaultContent } from "./defaultContent"

export default function LandingPageEditor() {
  const { id } = useParams()
  const nav = useNavigate()
  const [lp, setLp] = useState(null)
  const [content, setContent] = useState(defaultContent)

  useEffect(() => {
    const lps = load("lps", [])
    const found = lps.find(x => x.id === id)
    if (!found) return nav("/lps")
    setLp(found)
    setContent({ ...defaultContent, ...(found.content ?? {}) })
  }, [id, nav])

  const onChange = (k, v) => setContent(prev => ({ ...prev, [k]: v }))
  const onSave = () => {
    const lps = load("lps", [])
    const next = lps.map(x => x.id === id ? { ...x, content } : x)
    save("lps", next)
    nav(`/preview/${id}`)
  }

  if (!lp) return null
  return (
    <div className="p-6 grid gap-4 max-w-3xl">
      <h1 className="text-2xl">Editar: {lp.titulo}</h1>

      <label className="grid gap-1">Cor do tema
        <input type="color" value={content.theme} onChange={(e)=>onChange("theme", e.target.value)} />
      </label>

      <input className="border p-2 rounded" placeholder="Headline"
             value={content.headline} onChange={(e)=>onChange("headline", e.target.value)} />

      <input className="border p-2 rounded" placeholder="Subhead"
             value={content.subhead} onChange={(e)=>onChange("subhead", e.target.value)} />

      <input className="border p-2 rounded" placeholder="URL da imagem (hero)"
             value={content.heroUrl} onChange={(e)=>onChange("heroUrl", e.target.value)} />

      <textarea className="border p-2 rounded" rows="5" placeholder="Corpo"
                value={content.body} onChange={(e)=>onChange("body", e.target.value)} />

      <div className="grid grid-cols-2 gap-2">
        <input className="border p-2 rounded" placeholder="Texto do CTA"
               value={content.ctaText} onChange={(e)=>onChange("ctaText", e.target.value)} />
        <input className="border p-2 rounded" placeholder='Link do CTA (use "#buy" para comprar)'
               value={content.ctaHref} onChange={(e)=>onChange("ctaHref", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input className="border p-2 rounded" type="number" step="0.01" min="0"
               placeholder="Preço (opcional)"
               value={content.price ?? 0}
               onChange={(e)=>onChange("price", Number(e.target.value || 0))} />
      </div>

      <div className="flex gap-2">
        <button className="border rounded px-3 py-2" onClick={onSave}>Salvar e visualizar</button>
        <button className="border rounded px-3 py-2" onClick={()=>nav(`/preview/${id}`)}>Visualizar</button>
      </div>
    </div>
  )
}
