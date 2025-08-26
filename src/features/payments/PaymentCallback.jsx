import { useEffect, useMemo, useState } from "react"
import { useLocation, Link } from "react-router-dom"
import { updateOrderStatus, findOrder } from "../orders/orders"
import { logEvent } from "../analytics/analytics"

export default function PaymentCallback() {
  const { search } = useLocation()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const orderId = params.get("order")
  const status = params.get("status")
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (!orderId || !status) return
    const updated = updateOrderStatus(orderId, status === "success" ? "pago" : "falha")
    setOrder(updated)
    // registra conversão somente em sucesso
    if (status === "success" && updated) {
      logEvent("conversion", { lp_id: updated.lp_id, goal_id: "payment_success", valor: updated.valor_total })
    }
  }, [orderId, status])

  if (!orderId) return <div className="p-6">Parâmetros inválidos.</div>

  const current = order || findOrder(orderId)
  if (!current) return <div className="p-6">Pedido não encontrado.</div>

  const ok = current.status === "pago"
  return (
    <div className="min-h-screen p-6 grid place-items-center">
      <div className="w-full max-w-lg border rounded-xl p-6 grid gap-4">
        <h1 className="text-2xl">Pagamento {ok ? "aprovado" : "não concluído"}</h1>
        <div className="grid gap-1">
          <div><b>Pedido:</b> {current.id_pedido}</div>
          <div><b>Status:</b> {current.status}</div>
          <div><b>Valor:</b> R$ {Number(current.valor_total || 0).toFixed(2)}</div>
        </div>
        <div className="flex gap-2">
          <Link className="border rounded px-3 py-2" to="/metrics">Ir para Métricas</Link>
          <Link className="border rounded px-3 py-2" to="/lps">Voltar</Link>
        </div>
      </div>
    </div>
  )
}
