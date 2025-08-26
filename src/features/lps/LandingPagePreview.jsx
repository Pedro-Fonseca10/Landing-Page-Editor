import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { load } from "../../lib/storage"
import TemplateRenderer from "./TemplateRenderer"

export default function LandingPagePreview() {
  const { id } = useParams()
  const [lp, setLp] = useState(null)

  useEffect(() => {
    const lps = load("lps", [])
    setLp(lps.find(x => x.id === id) ?? null)
  }, [id])

  if (!lp) return <div className="p-6">Página não encontrada.</div>
  return (
    <>
      <div className="p-3 text-center border-b">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <span>Pré-visualização</span>
          <div className="flex gap-2">
            <Link className="border rounded px-3 py-1" to={`/lps/${id}/edit`}>Editar</Link>
            <Link className="border rounded px-3 py-1" to="/lps">Voltar</Link>
          </div>
        </div>
      </div>
      <TemplateRenderer lp={lp} />
    </>
  )
}
