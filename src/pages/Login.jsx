import { useState, useEffect } from "react"
import AppFooter from "../components/AppFooter"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../features/auth/useAuth"


export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const nav = useNavigate()
  const { login, logout } = useAuth()

  // Ao montar, sempre faz logout para forçar autenticação
  useEffect(() => {
    logout()
    // eslint-disable-next-line
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    try {
      login(email, password)
      nav("/dashboard")
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-2xl border bg-white/60 p-8 shadow-sm backdrop-blur dark:bg-slate-900/60">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/20"></div>
              <div className="absolute -bottom-8 -left-8 h-44 w-44 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-500/20"></div>
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Plataforma segura
                </span>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Bem-vindo de volta
                </h2>
                <p className="mt-3 max-w-md text-slate-600 dark:text-slate-300">
                  Landing Page Editor - Acesse seu painel para gerenciar seus projetos e acompanhar métricas em tempo real.
                </p>
                <ul className="mt-6 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414l2.793 2.793 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    Edição rápida e simples
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414l2.793 2.793 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    Design limpo e responsivo
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414l2.793 2.793 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    Padrões modernos de interface
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <main className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Entrar</h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Use seu e-mail institucional para acessar.</p>
              </div>

              {err && (
                <div role="alert" className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.5a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
                  <span>{err}</span>
                </div>
              )}

              <form className="grid gap-4" onSubmit={onSubmit}>
                <div className="grid gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">Usuário ou e-mail</label>
                  <input
                    id="email"
                    type="text"
                    inputMode="text"
                    autoComplete="username"
                    required
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    placeholder="Usuário ou e-mail"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                  />
                </div>

                <div className="grid gap-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-200">Senha</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e)=>setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      aria-pressed={showPassword}
                      onClick={()=>setShowPassword((v)=>!v)}
                      className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus:ring-sky-700/40"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 3l18 18" />
                          <path d="M10.58 10.58a2 2 0 102.83 2.83" />
                          <path d="M16.88 16.88A10.94 10.94 0 0112 19c-5 0-9.27-3.11-11-7 1.15-2.64 3.21-4.85 5.74-6.17m4.37-.7A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7a11.18 11.18 0 01-2.16 3.19" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-sky-600 px-4 font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-sky-700/40">
                  Entrar
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                Ao continuar, você concorda com nossos termos e política de privacidade.
              </p>
            </div>
          </main>
        </div>
      </div>
      <AppFooter />
    </div>
  )
}
