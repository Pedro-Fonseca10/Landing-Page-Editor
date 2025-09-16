/*
  Componente de Cadastro de potenciais Leads
*/

import { useMemo, useRef, useState } from "react"
import { Repo } from "../../lib/repo"
import { uid } from "../../lib/uid"
import { logEvent } from "../analytics/analytics"

export default function SignupButton({ lpId, lpSlug }) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const formRef = useRef(null)

  // Abre o pop-up de cadastro
  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) logEvent("signup_open", { lp_id: lpId, lp_slug: lpSlug })
  }
  // Salva o nome e o email 
  const onSubmit = (e) => {
    e.preventDefault()
    setError("")

    const fd = new FormData(e.currentTarget)
    const nome = String(fd.get("nome") || "").trim()
    const email = String(fd.get("email") || "").trim()

    if (!nome || !email) {
      setError("Preencha nome e e-mail")
      logEvent("signup_submit", { lp_id: lpId, lp_slug: lpSlug, status: "error", reason: "missing_fields" })
      return
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("E-mail inválido")
      logEvent("signup_submit", { lp_id: lpId, lp_slug: lpSlug, status: "error", reason: "invalid_email" })
      return
    }

    // Checa se já está cadastrado
    const all = Repo.list("cadastros")
    const emailLower = email.toLowerCase()
    const nomeLower = nome.toLowerCase()
    const exact = all.find(
      (x) => String(x.email || "").toLowerCase() === emailLower && String(x.nome || "").trim().toLowerCase() === nomeLower
    )
    if (exact) {
      setError("Você já está cadastrado com este nome e e-mail")
      logEvent("signup_submit", { lp_id: lpId, lp_slug: lpSlug, status: "error", reason: "duplicate_exact" })
      return
    }
    const emailOnly = all.find((x) => String(x.email || "").toLowerCase() === emailLower)
    if (emailOnly) {
      setError("Este e-mail já está cadastrado")
      logEvent("signup_submit", { lp_id: lpId, lp_slug: lpSlug, status: "error", reason: "duplicate_email" })
      return
    }

    const record = {
      id: uid(),
      nome,
      email,
      lp_id: lpId,
      lp_slug: lpSlug,
      createdAt: new Date().toISOString(),
      source: "signup_button",
    }

    try {
      Repo.add("cadastros", record)
      setSent(true)
      logEvent("signup_submit", { lp_id: lpId, lp_slug: lpSlug, status: "success" })
      formRef.current?.reset()
      setTimeout(() => { setOpen(false); setSent(false) }, 1800)
    } catch (err) {
      console.error("Erro ao salvar cadastro", err)
      setError("Não foi possível salvar. Tente novamente.")
      logEvent("signup_submit", { lp_id: lpId, lp_slug: lpSlug, status: "error", reason: "save_failed" })
    }
  }

  const disabled = useMemo(() => !lpId, [lpId])
  if (disabled) return null

  // Render
  return (
    <>
      <button
        onClick={toggle}
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-sky-700 shadow-md transition hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-sky-800 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Cadastre-se
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-end p-5">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-50 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Cadastrar interesse</h3>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Fechar">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            </div>

            {sent ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                Obrigado! Cadastro recebido.
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} className="grid gap-3">
                <div className="grid gap-1.5">
                  <label htmlFor="nome" className="text-sm text-slate-700 dark:text-slate-300">Nome</label>
                  <input id="nome" name="nome" className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40" placeholder="Seu nome" />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="email" className="text-sm text-slate-700 dark:text-slate-300">E-mail</label>
                  <input id="email" name="email" type="email" className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40" placeholder="voce@exemplo.com" />
                </div>
                {error && (
                  <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">{error}</div>
                )}
                <button type="submit" className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg border border-sky-300 bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus:ring-sky-700/40">
                  Enviar
                </button>
              </form>
            )}

            <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
              Ao enviar, você concorda com nossa política de privacidade.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
