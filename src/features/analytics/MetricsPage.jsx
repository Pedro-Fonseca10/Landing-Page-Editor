import { useEffect, useMemo, useState, useRef, Fragment } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { loadEventsInRange, computeMetrics } from "./metrics"
import { exportCSV, exportMetricsPDF } from "./export"
import { Repo } from "../../lib/repo"
import AppFooter from "../../components/AppFooter"

function pct(x) { return (x * 100).toFixed(1) + "%" }
const fmt = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const parse = (s) => { const d = new Date(s); return isNaN(d) ? null : d }
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

export default function MetricsPage() {
  const navigate = useNavigate()
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [lps, setLps] = useState([])
  const [lpId, setLpId] = useState("")

  // Load events for range; then filter by LP
  const events = useMemo(() => loadEventsInRange({ start, end }), [start, end])
  const filtered = useMemo(() => events.filter(e => lpId ? String(e.lp_id) === String(lpId) : false), [events, lpId])
  const m = useMemo(() => computeMetrics(filtered), [filtered])

  // Defaults: start = ontem, end = hoje
  useEffect(() => {
    if (!start && !end) {
      const todayDate = new Date()
      const yday = addDays(todayDate, -1)
      setStart(fmt(yday))
      setEnd(fmt(todayDate))
    }
  }, [start, end])

  // Load LPs
  useEffect(() => { setLps(Repo.list("lps")) }, [])

  const period = start && end ? `${start} a ${end}` : ""

  // Regra D+1: end > start (pelo menos dia seguinte)
  const onChangeStart = (val) => {
    setStart(val)
    const sd = parse(val)
    const ed = parse(end)
    if (sd && ed && ed <= sd) setEnd(fmt(addDays(sd, 1)))
  }
  const onChangeEnd = (val) => {
    const sd = parse(start)
    const ed = parse(val)
    if (sd && ed && ed <= sd) {
      setEnd(fmt(addDays(sd, 1)))
    } else {
      setEnd(val)
    }
  }

  const exportKpisCsv = () => {
    if (!lpId) return
    exportCSV(
      `metrics_${start}_${end}_${lpId}.csv`,
      [
        { kpi: "Visitantes", val: m.visitors },
        { kpi: "Sessões", val: m.sessions },
        { kpi: "Page Views", val: m.pageViews },
        { kpi: "CTR", val: m.ctr },
        { kpi: "Conversões", val: m.conversions },
        { kpi: "Conv/Sessão", val: m.convRateSessions },
        { kpi: "Conv/Visitante", val: m.convRateVisitors },
        { kpi: "Rejeição", val: m.bounceRate },
      ],
      ["kpi", "val"]
    )
  }

  const exportSourcesCsv = () => {
    if (!lpId) return
    exportCSV(
      `sources_${start}_${end}_${lpId}.csv`,
      m.sources,
      ["source", "visitors", "sessions", "page_views", "conversions", "conv_rate"]
    )
  }

  const exportPdf = () => { if (lpId) exportMetricsPDF(`relatorio_${start}_${end}_${lpId}.pdf`, m, m.sources, period) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Métricas</h1>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                Período: {period || '—'} · {lpId ? `LP selecionada: ${lps.find(x=>String(x.id)===String(lpId))?.titulo ?? lpId}` : 'Selecione uma landing page'}.
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
              onClick={() => navigate(-1)}
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
          <div className="flex flex-wrap items-end gap-4">
            <div className="grid gap-1.5">
              <label htmlFor="lp" className="text-sm font-medium text-slate-700 dark:text-slate-200">Landing Page</label>
              <div className="relative inline-block">
                <select
                  id="lp"
                  className="h-11 w-72 appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-10 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                  value={lpId}
                  onChange={(e)=>setLpId(e.target.value)}
                >
                  <option value="">Selecione uma landing page…</option>
                  {lps.map(lp => (
                    <option key={lp.id} value={lp.id}>{lp.titulo}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" viewBox="0 0 20 20" fill="#0ea5e9" aria-hidden="true">
                    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/>
                </svg>
              </div>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="start" className="text-sm font-medium text-slate-700 dark:text-slate-200">Início</label>
              <DateInput id="start" value={start} onChange={onChangeStart} max={end ? fmt(addDays(parse(end), -1)) : undefined} />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="end" className="text-sm font-medium text-slate-700 dark:text-slate-200">Fim</label>
              <DateInput id="end" value={end} onChange={onChangeEnd} min={start ? fmt(addDays(parse(start), 1)) : undefined} />
            </div>

            <div className="ml-auto flex flex-wrap gap-2">
              <button className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40" onClick={exportKpisCsv} disabled={!lpId}>
                CSV KPIs
              </button>
              <button className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40" onClick={exportSourcesCsv} disabled={!lpId}>
                CSV Canais
              </button>
              <button className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-sky-700/40" onClick={exportPdf} disabled={!lpId}>
                Exportar PDF
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Visitantes únicos" value={lpId ? m.visitors : '—'} />
          <Card title="Sessões" value={lpId ? m.sessions : '—'} />
          <Card title="Page Views" value={lpId ? m.pageViews : '—'} />
          <Card title="CTR (CTA/PageView)" value={lpId ? pct(m.ctr) : '—'} />
          <Card title="Conversões" value={lpId ? m.conversions : '—'} />
          <Card title="Conv/Sessão" value={lpId ? pct(m.convRateSessions) : '—'} />
          <Card title="Conv/Visitante" value={lpId ? pct(m.convRateVisitors) : '—'} />
          <Card title="Taxa de Rejeição" value={lpId ? pct(m.bounceRate) : '—'} />
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Canais (utm_source)</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Total: {lpId ? m.sources.length : 0}</span>
          </div>
          <div className="overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="min-w-[720px] w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/40">
                <tr>
                  <Th>Canal</Th>
                  <Th>Visitantes</Th>
                  <Th>Sessões</Th>
                  <Th>Page Views</Th>
                  <Th>Conversões</Th>
                  <Th>Conv/PageView</Th>
                </tr>
              </thead>
              <tbody>
                {lpId && m.sources.map((s) => (
                  <tr key={s.source} className="border-t border-slate-200 dark:border-slate-800">
                    <Td>{s.source}</Td>
                    <Td>{s.visitors}</Td>
                    <Td>{s.sessions}</Td>
                    <Td>{s.page_views}</Td>
                    <Td>{s.conversions}</Td>
                    <Td>{pct(s.conv_rate)}</Td>
                  </tr>
                ))}
                {!lpId && (
                  <tr>
                    <Td colSpan={6} className="text-center text-sm text-slate-500 dark:text-slate-400">
                      Selecione uma landing page para visualizar os canais.
                    </Td>
                  </tr>
                )}
                {lpId && m.sources.length === 0 && (
                  <tr>
                    <Td colSpan={6} className="text-center text-sm text-slate-500 dark:text-slate-400">
                      Sem dados no período.
                    </Td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <AppFooter />
    </div>
  )
}

function Card({ title, value }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="text-sm text-slate-600 dark:text-slate-300">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  )
}

function Th({ children }) {
  return <th className="p-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">{children}</th>
}

function Td({ children, colSpan }) {
  return <td colSpan={colSpan} className="p-3 text-slate-900 dark:text-slate-100">{children}</td>
}

// Date input com calendário custom (maior + dark mode), com min/max
function DateInput({ id, value, onChange, min, max }) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const panelRef = useRef(null)
  const [month, setMonth] = useState(() => {
    const d = value ? parse(value) || new Date() : new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const monthNames = [
    'janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'
  ]

  // Close on outside click, but keep panel interactions
  useEffect(() => {
    const onDocDown = (e) => {
      const a = anchorRef.current
      const p = panelRef.current
      if (!a && !p) return setOpen(false)
      if (a && a.contains(e.target)) return
      if (p && p.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [])

  // Sync visible month with input value
  useEffect(() => {
    if (!value) return
    const d = parse(value)
    if (d) setMonth(new Date(d.getFullYear(), d.getMonth(), 1))
  }, [value])

  // Build calendar grid (Mon-first)
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const firstWeekday = (startOfMonth.getDay() + 6) % 7
  const daysInMonth = endOfMonth.getDate()
  const weeks = []
  let day = 1 - firstWeekday
  while (day <= daysInMonth) {
    const week = []
    for (let i = 0; i < 7; i++, day++) week.push(new Date(month.getFullYear(), month.getMonth(), day))
    weeks.push(week)
  }

  const minDate = min ? parse(min) : null
  const maxDate = max ? parse(max) : null
  const inBounds = (d) => {
    if (!d) return false
    const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if (minDate) {
      const md = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
      if (nd < md) return false
    }
    if (maxDate) {
      const xd = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
      if (nd > xd) return false
    }
    return true
  }

  // Position as portal-fixed popover
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const computePos = () => {
    if (!anchorRef.current) return
    const r = anchorRef.current.getBoundingClientRect()
    const panelW = 320
    const estH = 360
    let left = Math.min(Math.max(8, r.left), window.innerWidth - panelW - 8)
    let top = r.bottom + 6
    if (top + estH > window.innerHeight - 8) top = Math.max(8, r.top - estH - 6)
    setPos({ top, left })
  }
  useEffect(() => { if (open) computePos() }, [open])
  useEffect(() => {
    if (!open) return
    const handler = () => computePos()
    window.addEventListener('resize', handler)
    window.addEventListener('scroll', handler, true)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [open])

  const MIN_YEAR = 2025
  const setMonthSafe = (y, m) => {
    let d = new Date(y, m, 1)
    if (d.getFullYear() < MIN_YEAR) d = new Date(MIN_YEAR, 0, 1)
    if (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) d = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
    setMonth(d)
  }
  const onPrevMonth = () => setMonthSafe(month.getFullYear(), month.getMonth() - 1)
  const onNextMonth = () => setMonthSafe(month.getFullYear(), month.getMonth() + 1)
  const onMonthSelect = (e) => setMonthSafe(month.getFullYear(), parseInt(e.target.value, 10))
  const onYearSelect = (e) => setMonthSafe(parseInt(e.target.value, 10), month.getMonth())

  const currentYear = month.getFullYear()
  const baseYear = new Date().getFullYear()
  const minYear = Math.max(MIN_YEAR, minDate ? minDate.getFullYear() : MIN_YEAR)
  const maxYear = maxDate ? maxDate.getFullYear() : baseYear + 50
  const years = []
  for (let y = minYear; y <= maxYear; y++) years.push(y)

  return (
    <div ref={anchorRef} className="relative">
      <div className="flex items-center">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder="AAAA-MM-DD"
          className="h-11 w-40 rounded-l-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
          value={value}
          onChange={(e)=>onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={()=> setOpen(true)}
          className="h-11 rounded-r-lg border-y border-r border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
          aria-label="Abrir calendário"
          aria-expanded={open}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {open && createPortal(
        <div ref={panelRef} style={{ top: pos.top, left: pos.left }} className="fixed z-[999999] w-[320px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
              onClick={onPrevMonth}
              aria-label="Mês anterior"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <select
              className="appearance-none h-8 rounded-md border border-slate-300 bg-white px-2 text-sm capitalize 
                       dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={month.getMonth()}
              onChange={onMonthSelect}
            >
              {monthNames.map((name, idx) => (
                <option className="capitalize" key={idx} value={idx}>{name}</option>
              ))}
            </select>
            <select
               className="appearance-none h-8 rounded-md border border-slate-300 bg-white px-2 pr-8 text-sm 
                       dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  value={currentYear}
                onChange={onYearSelect}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
              onClick={onNextMonth}
              aria-label="Próximo mês"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 dark:text-slate-400">
            {['S','T','Q','Q','S','S','D'].map((d)=> <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {weeks.map((week, wi) => (
              <Fragment key={wi}>
                {week.map((d, di) => {
                  const inMon = d.getMonth() === month.getMonth()
                  const isToday = fmt(d) === fmt(new Date())
                  const isSelected = value && fmt(d) === value
                  const selectable = inMon && inBounds(d)
                  return (
                    <button
                      key={`${wi}-${di}`}
                      type="button"
                      disabled={!selectable}
                      onClick={()=>{ onChange(fmt(d)); setOpen(false) }}
                      className={[
                        "h-10 rounded-md text-sm",
                        selectable ? "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800" : "text-slate-400 opacity-50 dark:text-slate-600",
                        isSelected ? "bg-sky-600 text-white" : isToday ? "ring-1 ring-sky-400" : "",
                      ].join(' ')}
                    >{d.getDate()}</button>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
