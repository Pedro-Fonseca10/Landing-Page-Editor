/*
  Testes de integração do PaymentCallback.
  Garantem tratamento de parâmetros inválidos, atualização de status de pedidos e registro de conversões no sucesso.
*/

import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import PaymentCallback from "../../../src/features/payments/PaymentCallback"
import { logEvent } from "../../../src/features/analytics/analytics"

vi.mock("../../../src/features/analytics/analytics", () => ({
  logEvent: vi.fn(),
}))

const ORDERS_KEY = "plp:orders"

const renderCallback = (search = "") =>
  render(
    <MemoryRouter initialEntries={[`/payment/callback${search}`]}>
      <Routes>
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/metrics" element={<div>Painel de métricas</div>} />
        <Route path="/lps" element={<div>Lista de LPs</div>} />
      </Routes>
    </MemoryRouter>
  )

describe("PaymentCallback (integration)", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it("informa parâmetros inválidos quando query está incompleta", () => {
    renderCallback()
    expect(screen.getByText("Parâmetros inválidos.")).toBeInTheDocument()
  })

  it("exibe mensagem de pedido não encontrado quando id é inválido", async () => {
    renderCallback("?order=abc&status=success")
    expect(
      await screen.findByText("Pedido não encontrado.")
    ).toBeInTheDocument()
  })

  it("atualiza pedido, registra conversão e mostra aprovação em sucesso", async () => {
    localStorage.setItem(
      ORDERS_KEY,
      JSON.stringify([
        {
          id_pedido: "order-1",
          lp_id: "lp-xyz",
          valor_total: 500,
          descricao_oferta: "Plano premium",
          status: "pendente",
        },
      ])
    )

    renderCallback("?order=order-1&status=success")

    expect(
      await screen.findByText("Pagamento aprovado")
    ).toBeInTheDocument()
    const stored = JSON.parse(localStorage.getItem(ORDERS_KEY))
    expect(stored[0].status).toBe("pago")
    expect(logEvent).toHaveBeenCalledWith(
      "conversion",
      expect.objectContaining({
        lp_id: "lp-xyz",
        valor: 500,
      })
    )
  })

  it("não registra conversão quando pagamento falha", async () => {
    localStorage.setItem(
      ORDERS_KEY,
      JSON.stringify([
        {
          id_pedido: "order-2",
          lp_id: "lp-xyz",
          valor_total: 200,
          descricao_oferta: "Plano básico",
          status: "pendente",
        },
      ])
    )

    renderCallback("?order=order-2&status=failure")

    expect(
      await screen.findByText("Pagamento não concluído")
    ).toBeInTheDocument()
    expect(logEvent).not.toHaveBeenCalled()
  })
})
