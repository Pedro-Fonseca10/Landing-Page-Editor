import { useEffect, useState } from "react"
import { useLocation, useParams, Link } from "react-router-dom"
import { load } from "../../lib/storage"
import TemplateRenderer from "./TemplateRenderer"

export default function LandingPagePreview() {
  const { id } = useParams()
  const { state } = useLocation()
  const [lp, setLp] = useState(null)

  useEffect(() => {
    const lps = load("lps", [])
    const wanted = String(state?.lpId ?? id)
    const found = lps.find(x => String(x.id) === wanted) || null
    setLp(found)
  }, [id, state?.lpId])

  if (!lp) return <div className="p-6">Página não encontrada.</div>

  return (
    <>
      <div className="p-3 text-center border-b">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <span>Pré-visualização</span>
          <div className="flex gap-2">
            <Link className="border rounded px-3 py-1" to={`/lps/${lp.id}/edit`}>Editar</Link>
            <Link className="border rounded px-3 py-1" to="/lps">Voltar</Link>
          </div>
        </div>
      </div>
      <TemplateRenderer lp={lp} />
    </>
  )
}