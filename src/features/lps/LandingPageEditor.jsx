import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Repo } from "../../lib/repo"
import { defaultContent } from "./defaultContent"

export default function LandingPageEditor() {
  const { id } = useParams()
  const nav = useNavigate()
  const [lp, setLp] = useState(null)
  const [content, setContent] = useState(defaultContent)

  useEffect(() => {
    const found = Repo.get("lps", id)
    if (!found) return nav("/lps")
    setLp(found)
    setContent(found.content ?? defaultContent)
  }, [id, nav])

  const onChange = (k, v) => setContent(prev => ({ ...prev, [k]: v }))
  const onSave = () => {
    Repo.update("lps", id, { content })
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
      <button className="border rounded px-3 py-2" onClick={onSave}>Salvar e visualizar</button>
    </div>
  )
}
