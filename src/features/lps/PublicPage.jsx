import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { findLpBySlug } from "./public"
import TemplateRenderer from "./TemplateRenderer"

export default function PublicPage() {
  const { slug } = useParams()
  const [lp, setLp] = useState(null)
  useEffect(()=>{ setLp(findLpBySlug(slug)) }, [slug])
  if (!lp) return <div className="p-6">Página não encontrada.</div>
  return <TemplateRenderer lp={lp} />
}