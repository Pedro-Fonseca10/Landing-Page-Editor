import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { loadEventsInRange, computeMetrics } from "./metrics"
import { exportCSV, exportMetricsPDF } from "./export"

function pct(x) { return (x * 100).toFixed(1) + "%" }

export default function MetricsPage() {
  const navigate = useNavigate()
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")

  const events = useMemo(() => loadEventsInRange({ start, end }), [start, end])
  const m = useMemo(() => computeMetrics(events), [events])

  useEffect(() => {
    if (!start && !end) {
      const to = new Date()
      const from = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      setStart(from.toISOString().slice(0, 10))
      setEnd(to.toISOString().slice(0, 10))
    }
  }, [start, end])

  const period = start && end ? `${start} a ${end}` : ""

  const exportKpisCsv = () => {
    exportCSV(
      `metrics_${start}_${end}.csv`,
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
    exportCSV(
      `sources_${start}_${end}.csv`,
      m.sources,
      ["source", "visitors", "sessions", "page_views", "conversions", "conv_rate"]
    )
  }

  const exportPdf = () => {
    exportMetricsPDF(`relatorio_${start}_${end}.pdf`, m, m.sources, period)
  }

  return (
    <div className="p-6 grid gap-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl">Métricas</h1>
        <button className="border rounded px-3 py-1" onClick={() => navigate(-1)} type="button">Voltar</button>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <label className="grid gap-1">
          Início
          <input
            type="date"
            className="border p-2 rounded"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label className="grid gap-1">
          Fim
          <input
            type="date"
            className="border p-2 rounded"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>

        <div className="flex gap-2 ml-auto">
          <button className="border rounded px-3 py-2" onClick={exportKpisCsv}>
            Exportar CSV (KPIs)
          </button>
          <button className="border rounded px-3 py-2" onClick={exportSourcesCsv}>
            Exportar CSV (Canais)
          </button>
          <button className="border rounded px-3 py-2" onClick={exportPdf}>
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Visitantes únicos" value={m.visitors} />
        <Card title="Sessões" value={m.sessions} />
        <Card title="Page Views" value={m.pageViews} />
        <Card title="CTR (CTA/PageView)" value={pct(m.ctr)} />
        <Card title="Conversões" value={m.conversions} />
        <Card title="Conv/Sessão" value={pct(m.convRateSessions)} />
        <Card title="Conv/Visitante" value={pct(m.convRateVisitors)} />
        <Card title="Taxa de Rejeição" value={pct(m.bounceRate)} />
      </div>

      <div className="grid gap-2">
        <h2 className="text-lg">Canais (utm_source)</h2>
        <div className="overflow-auto border rounded">
          <table className="min-w-[720px] w-full">
            <thead className="bg-gray-50">
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
              {m.sources.map((s) => (
                <tr key={s.source} className="border-t">
                  <Td>{s.source}</Td>
                  <Td>{s.visitors}</Td>
                  <Td>{s.sessions}</Td>
                  <Td>{s.page_views}</Td>
                  <Td>{s.conversions}</Td>
                  <Td>{pct(s.conv_rate)}</Td>
                </tr>
              ))}
              {m.sources.length === 0 && (
                <tr>
                  <Td colSpan={6} className="text-center text-sm text-gray-500">
                    Sem dados no período.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Card({ title, value }) {
  return (
    <div className="border rounded-xl p-4">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

function Th({ children }) {
  return <th className="text-left p-3 text-sm font-medium text-gray-700">{children}</th>
}

function Td({ children, colSpan }) {
  return <td colSpan={colSpan} className="p-3">{children}</td>
}