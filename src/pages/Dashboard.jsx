import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAuth } from "../features/auth/useAuth"
import { Repo } from "../lib/repo"

export default function Dashboard() {
  const { user } = useAuth()
  const displayName = user?.email || "Usuário"
  const [counts, setCounts] = useState({ clientes: 0, lps: 0 })

  const reload = () => {
    const clientes = Repo.list("clientes")
    const lps = Repo.list("lps")
    setCounts({ clientes: clientes.length, lps: lps.length })
  }

  useEffect(() => { reload() }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Voltar para Login
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-slate-600 dark:text-slate-300">
              Olá, <span className="font-medium text-slate-900 dark:text-white">{displayName}</span>
              {user?.role ? <span className="ml-2 rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">{user.role}</span> : null}
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Sistema operacional
            </span>
          </div>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Selecione uma seção para começar.</p>
        </header>

        <section aria-label="Resumo rápido" className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-200/40 blur-2xl dark:bg-sky-500/20" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Clientes</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{counts.clientes}</p>
              </div>
              <div className="rounded-lg bg-sky-100 p-2 text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:ring-sky-800">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Atualizado agora</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-200/40 blur-2xl dark:bg-violet-500/20" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Landing Pages</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{counts.lps}</p>
              </div>
              <div className="rounded-lg bg-violet-100 p-2 text-violet-700 ring-1 ring-inset ring-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:ring-violet-800">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="14" rx="2" />
                  <path d="M3 7h18" />
                  <path d="M7 21h10" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Atualizado agora</p>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/clients"
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm ring-0 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:shadow-slate-900/40 dark:focus:ring-sky-700/40"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-200/40 blur-2xl dark:bg-sky-500/20" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:ring-sky-800">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Clientes</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Gerencie contas, acessos e permissões.</p>
              </div>
              <svg className="mt-1 h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>

          <Link
            to="/lps"
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm ring-0 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:shadow-slate-900/40 dark:focus:ring-sky-700/40"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-200/40 blur-2xl dark:bg-violet-500/20" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:ring-violet-800">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="14" rx="2" />
                  <path d="M3 7h18" />
                  <path d="M7 21h10" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Landing Pages</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Crie e edite páginas rapidamente.</p>
              </div>
              <svg className="mt-1 h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>

          <Link
            to="/metrics"
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm ring-0 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:shadow-slate-900/40 dark:focus:ring-sky-700/40"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-200/40 blur-2xl dark:bg-emerald-500/20" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-800">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 3v18h18" />
                  <path d="M7 15l4-4 3 3 4-6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Métricas</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Acompanhe desempenho e conversões.</p>
              </div>
              <svg className="mt-1 h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>
        </section>
      </div>
    </div>
  )
}
