import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Repo } from "../../lib/repo"
import { defaultContent } from "./defaultContent"
import saasDefault from "../templates/saas/data"
import AppFooter from "../../components/AppFooter"

export default function LandingPageEditor() {
  const { id } = useParams()
  const nav = useNavigate()
  const [lp, setLp] = useState(null)
  const [content, setContent] = useState(defaultContent)
  // Estado local para edição de texto livre (preserva espaços e quebras de linha)
  const [featuresTextByIndex, setFeaturesTextByIndex] = useState({})

  useEffect(() => {
    const found = Repo.get("lps", id)
    if (!found) return nav("/lps")
    setLp(found)
    if (found.id_template === "saas") {
      setContent(found.content ?? {})
      setFeaturesTextByIndex({})
    } else {
      setContent(found.content ?? defaultContent)
      setFeaturesTextByIndex({})
    }
  }, [id, nav])

  const onChange = (k, v) => setContent(prev => ({ ...prev, [k]: v }))

  // Atualização imutável por caminho (ex.: ["hero", "title"]) para templates com conteúdo aninhado
  const setIn = (obj, path, value) => {
    if (!Array.isArray(path) || !path.length) return obj
    const [head, ...rest] = path
    const clone = Array.isArray(obj) ? obj.slice() : { ...(obj || {}) }
    if (rest.length === 0) {
      clone[head] = value
      return clone
    }
    clone[head] = setIn(clone[head], rest, value)
    return clone
  }
  const onChangePath = (path, value) => setContent(prev => setIn(prev || {}, path, value))

  const isSaaS = lp?.id_template === "saas"

  // Helpers para UI do SaaS: ler valor com fallback do default, sem gravar no estado até editar
  const getSaaSValue = (path, fallback) => {
    const read = (o, p) => p.reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), o)
    const v = read(content, path)
    if (v !== undefined && v !== null) return v
    // fallback para arquivo de default do template
    const d = read(saasDefault, path)
    return d !== undefined ? d : fallback
  }
  const onSave = () => {
    Repo.update("lps", id, { content })
    nav(`/preview/${id}`)
  }

  if (!lp) return null

  if (isSaaS) {
    // Editor específico para SaaS
    const plansFromContent = Array.isArray(content?.pricing?.plans) ? content.pricing.plans : null
    const plansDefault = getSaaSValue(["pricing", "plans"], [])
    const plans = plansFromContent ?? plansDefault

    const updatePricingField = (field, value) => setContent(prev => {
      const pricing = { ...(prev?.pricing || {}) }
      pricing[field] = value
      return { ...(prev || {}), pricing }
    })

    const updatePlan = (index, field, value) => setContent(prev => {
      const pricing = { ...(prev?.pricing || {}) }
      const list = Array.isArray(pricing.plans) ? [...pricing.plans] : []
      while (list.length <= index) list.push({})
      const current = { ...(list[index] || {}) }
      current[field] = value
      list[index] = current
      pricing.plans = list
      return { ...(prev || {}), pricing }
    })

    const setPlanFeaturesText = (index, text) => {
      setFeaturesTextByIndex(prev => ({ ...prev, [index]: text }))
      // Atualiza a estrutura salva (array), mas preserva a experiência do textarea via estado local
      const lines = text.split(/\r?\n/)
      // Mantém linhas não-vazias; não remove espaços internos
      const cleaned = lines.filter(line => line.trim().length > 0)
      updatePlan(index, "features", cleaned)
    }

    const addPlan = () => setContent(prev => {
      const pricing = { ...(prev?.pricing || {}) }
      const list = Array.isArray(pricing.plans) ? [...pricing.plans] : []
      list.push({ name: "", price: "", period: "", featured: false, features: [] })
      pricing.plans = list
      return { ...(prev || {}), pricing }
    })

    const removePlan = (index) => {
      setContent(prev => {
        const pricing = { ...(prev?.pricing || {}) }
        const list = Array.isArray(pricing.plans) ? [...pricing.plans] : []
        list.splice(index, 1)
        pricing.plans = list
        return { ...(prev || {}), pricing }
      })
      // Reindexa o estado local de featuresText para acompanhar a remoção
      setFeaturesTextByIndex(prev => {
        const next = {}
        Object.keys(prev).forEach((k) => {
          const i = Number(k)
          if (Number.isNaN(i)) return
          if (i < index) next[i] = prev[i]
          else if (i > index) next[i - 1] = prev[i]
          // se i === index, descarta
        })
        return next
      })
    }

    // ===== Recursos (features)
    const featuresFromContent = Array.isArray(content?.features) ? content.features : null
    const featuresDefault = getSaaSValue(["features"], [])
    const features = featuresFromContent ?? featuresDefault
    const updateFeature = (index, field, value) => setContent(prev => {
      const list = Array.isArray(prev?.features) ? [...prev.features] : []
      while (list.length <= index) list.push({})
      const current = { ...(list[index] || {}) }
      current[field] = value
      list[index] = current
      return { ...(prev || {}), features: list }
    })
    const addFeature = () => setContent(prev => {
      const list = Array.isArray(prev?.features) ? [...prev.features] : []
      list.push({ title: "", text: "" })
      return { ...(prev || {}), features: list }
    })
    const removeFeature = (index) => setContent(prev => {
      const list = Array.isArray(prev?.features) ? [...prev.features] : []
      list.splice(index, 1)
      return { ...(prev || {}), features: list }
    })

    // ===== Como funciona (steps)
    const stepsFromContent = Array.isArray(content?.steps) ? content.steps : null
    const stepsDefault = getSaaSValue(["steps"], [])
    const steps = stepsFromContent ?? stepsDefault
    const updateStep = (index, field, value) => setContent(prev => {
      const list = Array.isArray(prev?.steps) ? [...prev.steps] : []
      while (list.length <= index) list.push({})
      const current = { ...(list[index] || {}) }
      current[field] = value
      list[index] = current
      return { ...(prev || {}), steps: list }
    })
    const addStep = () => setContent(prev => {
      const list = Array.isArray(prev?.steps) ? [...prev.steps] : []
      list.push({ title: "", text: "", icon: "" })
      return { ...(prev || {}), steps: list }
    })
    const removeStep = (index) => setContent(prev => {
      const list = Array.isArray(prev?.steps) ? [...prev.steps] : []
      list.splice(index, 1)
      return { ...(prev || {}), steps: list }
    })

    // ===== Depoimentos (testimonials)
    const testimonialsFromContent = Array.isArray(content?.testimonials) ? content.testimonials : null
    const testimonialsDefault = getSaaSValue(["testimonials"], [])
    const testimonials = testimonialsFromContent ?? testimonialsDefault
    const updateTestimonial = (index, field, value) => setContent(prev => {
      const list = Array.isArray(prev?.testimonials) ? [...prev.testimonials] : []
      while (list.length <= index) list.push({})
      const current = { ...(list[index] || {}) }
      current[field] = value
      list[index] = current
      return { ...(prev || {}), testimonials: list }
    })
    const addTestimonial = () => setContent(prev => {
      const list = Array.isArray(prev?.testimonials) ? [...prev.testimonials] : []
      list.push({ name: "", text: "" })
      return { ...(prev || {}), testimonials: list }
    })
    const removeTestimonial = (index) => setContent(prev => {
      const list = Array.isArray(prev?.testimonials) ? [...prev.testimonials] : []
      list.splice(index, 1)
      return { ...(prev || {}), testimonials: list }
    })

    // ===== FAQ
    const faqFromContent = Array.isArray(content?.faq) ? content.faq : null
    const faqDefault = getSaaSValue(["faq"], [])
    const faq = faqFromContent ?? faqDefault
    const updateFaq = (index, field, value) => setContent(prev => {
      const list = Array.isArray(prev?.faq) ? [...prev.faq] : []
      while (list.length <= index) list.push({})
      const current = { ...(list[index] || {}) }
      current[field] = value
      list[index] = current
      return { ...(prev || {}), faq: list }
    })
    const addFaq = () => setContent(prev => {
      const list = Array.isArray(prev?.faq) ? [...prev.faq] : []
      list.push({ q: "", a: "" })
      return { ...(prev || {}), faq: list }
    })
    const removeFaq = (index) => setContent(prev => {
      const list = Array.isArray(prev?.faq) ? [...prev.faq] : []
      list.splice(index, 1)
      return { ...(prev || {}), faq: list }
    })

    // ===== Estilo do botão Enviar (LeadForm)
    const leadFormTextWhite = !!content?.leadForm?.textWhite
    const setLeadFormTextWhite = (checked) => setContent(prev => ({
      ...(prev || {}),
      leadForm: { ...(prev?.leadForm || {}), textWhite: !!checked }
    }))
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Editar Landing Page</h1>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{lp.titulo} · Template: SaaS</p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                onClick={() => nav(-1)}
                type="button"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
            </div>
          </header>

          <div className="grid gap-6">
            {/* Configurações gerais */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Configurações gerais</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Cor do tema</label>
                  <input
                    type="color"
                    value={getSaaSValue(["theme"], "#0ea5e9")}
                    onChange={(e)=>onChangePath(["theme"], e.target.value)}
                    className="h-11 w-24 cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                  />
                </div>
              </div>
            </section>

            {/* Hero */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Hero</h2>
              <div className="mt-4 grid gap-4">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Título</label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    placeholder="Título"
                    value={getSaaSValue(["hero","title"], "")}
                    onChange={(e)=>onChangePath(["hero","title"], e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Subtítulo</label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    placeholder="Subtítulo"
                    value={getSaaSValue(["hero","subtitle"], "")}
                    onChange={(e)=>onChangePath(["hero","subtitle"], e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">URL da imagem</label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    placeholder="Ex.: /hero.png"
                    value={getSaaSValue(["hero","img"], "")}
                    onChange={(e)=>onChangePath(["hero","img"], e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Texto do CTA</label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      placeholder="Texto do CTA"
                      value={getSaaSValue(["hero","ctaText"], "")}
                      onChange={(e)=>onChangePath(["hero","ctaText"], e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Link do CTA</label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      placeholder="Ex.: #cta"
                      value={getSaaSValue(["hero","ctaHref"], "")}
                      onChange={(e)=>onChangePath(["hero","ctaHref"], e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Recursos */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Recursos</h2>
                <button type="button" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40" onClick={addFeature}>
                  Adicionar recurso
                </button>
              </div>
              <div className="mt-4 grid gap-4">
                {(features || []).map((f, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm text-slate-600 dark:text-slate-300">Recurso {i+1}</div>
                      <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40 dark:focus:ring-red-900/60" onClick={() => removeFeature(i)}>
                        Remover
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Título</label>
                        <input
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Título do recurso"
                          value={getSaaSValue(["features", i, "title"], f?.title || "")}
                          onChange={(e)=>updateFeature(i, "title", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Descrição</label>
                        <textarea
                          className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Descrição do recurso"
                          value={getSaaSValue(["features", i, "text"], f?.text || "")}
                          onChange={(e)=>updateFeature(i, "text", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Como funciona */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Como funciona</h2>
                <button type="button" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40" onClick={addStep}>
                  Adicionar passo
                </button>
              </div>
              <div className="mt-4 grid gap-4">
                {(steps || []).map((s, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm text-slate-600 dark:text-slate-300">Passo {i+1}</div>
                      <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40 dark:focus:ring-red-900/60" onClick={() => removeStep(i)}>
                        Remover
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="grid gap-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Ícone (emoji)</label>
                          <input
                            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="😀"
                            value={getSaaSValue(["steps", i, "icon"], s?.icon || "")}
                            onChange={(e)=>updateStep(i, "icon", e.target.value)}
                          />
                        </div>
                        <div className="col-span-2 grid gap-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Título</label>
                          <input
                            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Título do passo"
                            value={getSaaSValue(["steps", i, "title"], s?.title || "")}
                            onChange={(e)=>updateStep(i, "title", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Descrição</label>
                        <textarea
                          className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Descrição do passo"
                          value={getSaaSValue(["steps", i, "text"], s?.text || "")}
                          onChange={(e)=>updateStep(i, "text", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Depoimentos */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Depoimentos</h2>
                <button type="button" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40" onClick={addTestimonial}>
                  Adicionar depoimento
                </button>
              </div>
              <div className="mt-4 grid gap-4">
                {(testimonials || []).map((t, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm text-slate-600 dark:text-slate-300">Depoimento {i+1}</div>
                      <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40 dark:focus:ring-red-900/60" onClick={() => removeTestimonial(i)}>
                        Remover
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Nome</label>
                        <input
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Nome"
                          value={getSaaSValue(["testimonials", i, "name"], t?.name || "")}
                          onChange={(e)=>updateTestimonial(i, "name", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Texto</label>
                        <textarea
                          className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Depoimento"
                          value={getSaaSValue(["testimonials", i, "text"], t?.text || "")}
                          onChange={(e)=>updateTestimonial(i, "text", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">FAQ</h2>
                <button type="button" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40" onClick={addFaq}>
                  Adicionar pergunta
                </button>
              </div>
              <div className="mt-4 grid gap-4">
                {(faq || []).map((qa, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm text-slate-600 dark:text-slate-300">Pergunta {i+1}</div>
                      <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40 dark:focus:ring-red-900/60" onClick={() => removeFaq(i)}>
                        Remover
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Pergunta</label>
                        <input
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Pergunta"
                          value={getSaaSValue(["faq", i, "q"], qa?.q || "")}
                          onChange={(e)=>updateFaq(i, "q", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Resposta</label>
                        <textarea
                          className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Resposta"
                          value={getSaaSValue(["faq", i, "a"], qa?.a || "")}
                          onChange={(e)=>updateFaq(i, "a", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Botão do formulário */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Botão do formulário</h2>
              <div className="mt-4">
                <label className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <input type="checkbox" checked={leadFormTextWhite} onChange={(e)=>setLeadFormTextWhite(e.target.checked)} />
                  Texto do botão "Enviar" branco (fundo usa a cor do tema)
                </label>
              </div>
            </section>

            {/* Planos */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Planos</h2>
                <button type="button" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40" onClick={addPlan}>
                  Adicionar plano
                </button>
              </div>

              <div className="mt-4 grid gap-4">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Subtítulo da sessão</label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    placeholder="Subtítulo"
                    value={getSaaSValue(["pricing","subtitle"], "")}
                    onChange={(e)=>updatePricingField("subtitle", e.target.value)}
                  />
                </div>

                {(plans || []).map((p, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm text-slate-600 dark:text-slate-300">Plano {i+1}</div>
                      <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40 dark:focus:ring-red-900/60" onClick={() => removePlan(i)}>
                        Remover
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Nome</label>
                          <input
                            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Nome do plano"
                            value={getSaaSValue(["pricing","plans", i, "name"], p?.name || "")}
                            onChange={(e)=>updatePlan(i, "name", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Preço</label>
                          <input
                            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Ex.: R$ 49"
                            value={getSaaSValue(["pricing","plans", i, "price"], p?.price || "")}
                            onChange={(e)=>updatePlan(i, "price", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Período</label>
                          <input
                            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Ex.: /mês"
                            value={getSaaSValue(["pricing","plans", i, "period"], p?.period || "")}
                            onChange={(e)=>updatePlan(i, "period", e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
                            <input
                              type="checkbox"
                              checked={!!getSaaSValue(["pricing","plans", i, "featured"], p?.featured || false)}
                              onChange={(e)=>updatePlan(i, "featured", e.target.checked)}
                            />
                            Destaque
                          </label>
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Recursos (1 por linha)</label>
                        <textarea
                          className="min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder={"Ex.:\n- Ilimitado\n- Suporte prioritário"}
                          value={(featuresTextByIndex[i] ?? getSaaSValue(["pricing","plans", i, "features"], p?.features || []).join("\n"))}
                          onChange={(e)=>setPlanFeaturesText(i, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex justify-end">
              <button className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-sky-700/40" onClick={onSave}>
                Salvar e visualizar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  
  
  // Editor genérico (templates simples)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Editar Landing Page</h1>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{lp.titulo}</p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
              onClick={() => nav(-1)}
              type="button"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Cor do tema</label>
              <input
                type="color"
                value={content.theme}
                onChange={(e)=>onChange("theme", e.target.value)}
                className="h-11 w-24 cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Headline</label>
              <input
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                placeholder="Headline"
                value={content.headline}
                onChange={(e)=>onChange("headline", e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <button className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-sky-700/40" onClick={onSave}>
                Salvar e visualizar
              </button>
            </div>
          </div>
        </section>
      </div>
      <AppFooter />
    </div>
  )
}
