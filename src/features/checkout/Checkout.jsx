import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { Repo } from "../../lib/repo"
import { useAuth } from "../auth/useAuth"
import { createOrder } from "../orders/orders"

function Section({ title, children }) {
  return (
       <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
      <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  )
}

function currencyBRL(n) {
  const v = Number(n || 0)
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function parsePrice(txt) {
  if (typeof txt !== "string") return Number(txt || 0)
  const cleaned = txt.replace(/[^0-9,.]/g, "").replace(/\./g, "").replace(",", ".")
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

const COUPONS = {
  CUPOM10: { type: "percent", value: 10 },
  CUPOM20: { type: "percent", value: 20 },
  DESCONTO10: { type: "percent", value: 10 },
  PROMO20: { type: "percent", value: 20 },
  CUPOM50: { type: "percent", value: 50 },
}

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export default function Checkout() {
  const { id } = useParams()
  const q = useQuery()
  const planFromQ = q.get("plan") || ""
  const priceFromQ = Number(q.get("price") || 0)
  const { user, login, register } = useAuth()
  const nav = useNavigate()

  const lp = useMemo(() => Repo.get("lps", id), [id])
  const plans = useMemo(() => lp?.content?.pricing?.plans || [], [lp])
  const primary = useMemo(() => lp?.content?.theme || "#0ea5e9", [lp])

  // Aparência herdada do template (bg + texto)
  const isSaaS = lp?.id_template === "saas"
  const bgKey = useMemo(() => (isSaaS ? `plp:lp:${lp?.id ?? "unknown"}:saas:bg` : null), [isSaaS, lp?.id])
  const [bg, setBg] = useState(() => (isSaaS ? "#0f172a" : "#ffffff"))
  useEffect(() => {
    try {
      if (isSaaS && bgKey) {
        const sbg = localStorage.getItem(bgKey)
        if (sbg) setBg(sbg)
      } else {
        setBg("#ffffff")
      }
    } catch { /* ignore */ }
  }, [bgKey, isSaaS])
  useEffect(() => {
    function hexToRgb(hex) {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!m) return { r: 255, g: 255, b: 255 }
      return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    }
    function isDarkColor(hex) {
      const { r, g, b } = hexToRgb(hex || "#ffffff")
      const luminance = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255)
      return luminance < 0.5
    }
    const root = document.documentElement
    if (isDarkColor(bg)) root.classList.add("dark")
    else root.classList.remove("dark")
  }, [bg])

  

  // fallback de preço/plano se não vier query (ex.: Assine Já)
  const fallbackPlanPrice = useMemo(() => {
    const featured = plans.find(p => p?.featured)
    const pick = featured || plans[0]
    if (!pick) return { name: "", price: 0 }
    const price = parsePrice(pick.price)
    return { name: pick.name || "", price }
  }, [plans])

  const [mode, setMode] = useState("login") // 'login' | 'register' | 'form'
  useEffect(() => { if (user) setMode("form") }, [user])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authErr, setAuthErr] = useState("")

  const [planName, setPlanName] = useState(planFromQ || fallbackPlanPrice.name)
  const [basePrice, setBasePrice] = useState(priceFromQ || fallbackPlanPrice.price)
  useEffect(() => {
    // sempre que LP ou query mudar, recalibra estado inicial
    setPlanName(planFromQ || fallbackPlanPrice.name)
    setBasePrice(priceFromQ || fallbackPlanPrice.price)
  }, [planFromQ, priceFromQ, fallbackPlanPrice.name, fallbackPlanPrice.price])

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
  })
  const onChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  // Auto-busca de endereço pelo CEP (ViaCEP)
  const cepDebounceRef = useRef(null)
  const [cepInfo, setCepInfo] = useState({ status: "idle", message: "" })
  const onlyDigits = (s) => (s || "").replace(/\D/g, "")
  const fetchCep = async (cep) => {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    if (!resp.ok) throw new Error("Falha na consulta de CEP")
    const data = await resp.json()
    if (data?.erro) throw new Error("CEP não encontrado")
    return data
  }

  useEffect(() => {
    const raw = form.cep || ""
    const cep = onlyDigits(raw)
    if (cep.length !== 8) {
      setCepInfo({ status: "idle", message: "" })
      if (cepDebounceRef.current) clearTimeout(cepDebounceRef.current)
      return
    }
    setCepInfo({ status: "loading", message: "Consultando CEP..." })
    if (cepDebounceRef.current) clearTimeout(cepDebounceRef.current)
    cepDebounceRef.current = setTimeout(async () => {
      try {
        const data = await fetchCep(cep)
        setForm(prev => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          uf: data.uf || prev.uf,
        }))
        setCepInfo({ status: "ok", message: `${data.logradouro || ""} ${data.bairro ? "- " + data.bairro : ""} ${data.localidade || ""}/${data.uf || ""}`.trim() })
      } catch {
        setCepInfo({ status: "error", message: "CEP não encontrado" })
      }
    }, 400)
    return () => { if (cepDebounceRef.current) clearTimeout(cepDebounceRef.current) }
  }, [form.cep])

  const [coupon, setCoupon] = useState("")
  const [applied, setApplied] = useState(null) // { code, amount }
  const applyCoupon = () => {
    const code = (coupon || "").toUpperCase().trim()
    const c = COUPONS[code]
    if (!c) { setApplied({ code, amount: 0, invalid: true }); return }
    let discount = 0
    if (c.type === "percent") discount = basePrice * (c.value / 100)
    setApplied({ code, amount: Math.min(discount, basePrice), invalid: false })
  }
  useEffect(() => {
    // Recalcula desconto ao trocar plano/preço
    if (!applied || applied.invalid) return
    const c = COUPONS[applied.code]
    if (!c) return setApplied({ code: applied.code, amount: 0, invalid: true })
    let discount = 0
    if (c.type === "percent") discount = basePrice * (c.value / 100)
    setApplied({ code: applied.code, amount: Math.min(discount, basePrice), invalid: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePrice])

  const finalPrice = Math.max(0, basePrice - (applied?.amount || 0))

  const goPayment = () => {
    // Cria um pedido simples e redireciona para o gateway simulado já existente
    const order = createOrder({ lp, amount: finalPrice, descricao_oferta: `${lp?.titulo || "Oferta"}${planName ? ` · ${planName}` : ""}` })
    nav(`/pay/${order.id_pedido}`)
  }

  if (!lp) return <div className="p-6">Página não encontrada.</div>

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="mx-auto max-w-5xl px-6 py-10 lg:py-16">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Finalizar assinatura</h1>
          <p className="text-slate-600 dark:text-slate-300">{lp.titulo} · {planName ? `Plano: ${planName}` : ""}</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 grid gap-6">
            {/* Seleção/alteração de plano */}
            {plans.length > 0 && (
              <Section title="Plano">
                <div className="grid gap-1.5 sm:grid-cols-3">
                  <div className="grid gap-1.5 sm:col-span-2">
                    <label className="text-sm text-slate-700 dark:text-slate-200">Escolha o plano</label>
                    <select
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-800 px-3 text-slate-600 dark:text-slate-300 appearance-none !bg-opacity-100"
                      value={planName}
                      onChange={(e) => {
                        const name = e.target.value
                        setPlanName(name)
                        const found = plans.find(p => (p?.name || "") === name)
                        const price = found ? parsePrice(found.price) : 0
                        setBasePrice(price)
                      }}
                    >
                      {plans.map((p) => (
                        <option key={p?.name || "_"} value={p?.name || ""}>
                          {(p?.name || "Plano")} — R$ {parsePrice(p?.price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm text-slate-700 dark:text-slate-200">Preço</label>
                    <div className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 flex items-center text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                      R$ {basePrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Section>
            )}
            {mode !== "form" && (
              <Section title={mode === "register" ? "Criar conta" : "Entrar"}>
                {authErr && <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">{authErr}</div>}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm text-slate-700 dark:text-slate-200">E-mail/Usuário</label>
                    <input className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Seu e-mail" />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm text-slate-700 dark:text-slate-200">Senha</label>
                    <input type="password" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {mode === "register" ? (
                    <button type="button" onClick={()=>{ try { register(email, password); setAuthErr("") } catch(e){ setAuthErr(e.message) } }} className="rounded-lg px-4 py-2 text-white" style={{ background: primary }}>Criar conta</button>
                  ) : (
                    <button type="button" onClick={()=>{ try { login(email, password); setAuthErr("") } catch(e){ setAuthErr(e.message) } }} className="rounded-lg px-4 py-2 text-white" style={{ background: primary }}>Entrar</button>
                  )}
                  <button type="button" onClick={()=> setMode(mode === "register" ? "login" : "register")} className="text-sm underline opacity-80">
                    {mode === "register" ? "Já tenho conta" : "Quero me cadastrar"}
                  </button>
                </div>
              </Section>
            )}

            {mode === "form" && (
              <Section title="Seus dados">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm text-slate-700 dark:text-slate-200">Nome completo</label>
                    <input className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" value={form.nome} onChange={(e)=>onChange("nome", e.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm text-slate-700 dark:text-slate-200">CPF</label>
                    <input className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" value={form.cpf} onChange={(e)=>onChange("cpf", e.target.value)} placeholder="000.000.000-00" />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm text-slate-700 dark:text-slate-200">Telefone</label>
                    <input className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" value={form.telefone} onChange={(e)=>onChange("telefone", e.target.value)} placeholder="(00) 90000-0000" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-1.5 sm:col-span-2">
                    <label className="text-sm text-slate-700 dark:text-slate-200">Endereço</label>
                    <input className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" value={form.endereco} onChange={(e)=>onChange("endereco", e.target.value)} placeholder="Rua" />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm text-slate-700 dark:text-slate-200">Número</label>
                    <input className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" value={form.numero} onChange={(e)=>onChange("numero", e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="grid gap-1.5 sm:col-span-2">
                    <label className="text-sm text-slate-700 dark:text-slate-200">Complemento</label>
                    <input className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" value={form.complemento} onChange={(e)=>onChange("complemento", e.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm text-slate-700 dark:text-slate-200">Bairro</label>
                    <input className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" value={form.bairro} onChange={(e)=>onChange("bairro", e.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm text-slate-700 dark:text-slate-200">CEP</label>
                    <input className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" value={form.cep} onChange={(e)=>onChange("cep", e.target.value)} placeholder="00000-000" />
                    {cepInfo.status === "loading" && (
                      <div className="text-xs text-slate-500">Consultando CEP...</div>
                    )}
                    {cepInfo.status === "error" && (
                      <div className="text-xs text-red-600">{cepInfo.message}</div>
                    )}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm text-slate-700 dark:text-slate-200">Cidade</label>
                    <input className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" value={form.cidade} onChange={(e)=>onChange("cidade", e.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm text-slate-700 dark:text-slate-200">UF</label>
                    <input className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" value={form.uf} onChange={(e)=>onChange("uf", e.target.value)} placeholder="SP" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm">Cupom de desconto</label>
                  <div className="flex gap-2">
                    <input className="h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-slate-900 placeholder-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400" placeholder="Ex.: CUPOM10" value={coupon} onChange={(e)=>setCoupon(e.target.value)} />
                    <button type="button" className="rounded-lg border bg-white px-3 dark:bg-slate-900" style={{ borderColor: primary, color: primary }} onClick={applyCoupon}>Aplicar</button>
                  </div>
                  {applied && (
                    <div className={`text-sm ${applied.invalid ? "text-red-600" : "text-emerald-600"}`}>
                      {applied.invalid ? "Cupom inválido" : `Cupom aplicado: -${currencyBRL(applied.amount)}`}
                    </div>
                  )}
                </div>
              </Section>
            )} 
          </div>

          <aside className="md:col-span-1">
              <div className="sticky top-6">
              <Section title="Resumo">
                <div className="grid gap-1 text-sm">
                  <div className="flex justify-between"><span>Plano</span><span>{planName || "—"}</span></div>
                  <div className="flex justify-between"><span>Subtotal</span><span>{currencyBRL(basePrice)}</span></div>
                  <div className="flex justify-between"><span>Descontos</span><span>-{currencyBRL(applied?.amount || 0)}</span></div>
                  <div className="mt-2 flex justify-between font-medium"><span>Total</span><span>{currencyBRL(finalPrice)}</span></div>
                </div>
                <button
                  disabled={mode !== "form"}
                  onClick={goPayment}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-white shadow-sm transition disabled:opacity-50"
                  style={{ background: primary }}
                >
                  Continuar para pagamento
                </button>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Os dados de pagamento serão solicitados na próxima etapa.</p>
              </Section>
              </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
