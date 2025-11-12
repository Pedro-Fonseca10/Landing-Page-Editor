import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
/*
  Testes unitários para fluxo de pedidos.
  Avaliam criação com defaults, atualização de status/timestamp e busca por identificador.
*/

import {
  createOrder,
  updateOrderStatus,
  findOrder,
} from "../../../../src/features/orders/orders.js"

const ORDERS_KEY = "plp:orders"

describe("orders helpers", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-05-05T12:00:00Z"))
    vi.spyOn(Math, "random").mockReturnValue(0.222222222)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("createOrder persiste pedido com defaults e descrição da LP", () => {
    const order = createOrder({
      lp: { id: "lp-10", content: { headline: "Nova LP" } },
      amount: 199.5,
    })

    expect(order).toMatchObject({
      lp_id: "lp-10",
      descricao_oferta: "Nova LP",
      valor_total: 199.5,
      status: "pendente",
      criado_em: "2024-05-05T12:00:00.000Z",
      atualizado_em: "2024-05-05T12:00:00.000Z",
    })
    expect(order.id_pedido).toMatch(/[a-z0-9]+/)

    const stored = JSON.parse(localStorage.getItem(ORDERS_KEY))
    expect(stored).toHaveLength(1)
    expect(stored[0].id_pedido).toBe(order.id_pedido)
  })

  it("updateOrderStatus altera status e timestamp quando pedido existe", () => {
    const { id_pedido } = createOrder({
      lp: { id: "lp-1", content: { headline: "Teste" } },
      amount: 50,
    })

    vi.advanceTimersByTime(60 * 1000)
    const updated = updateOrderStatus(id_pedido, "pago")

    expect(updated.status).toBe("pago")
    expect(updated.atualizado_em).toBe("2024-05-05T12:01:00.000Z")
    const persisted = JSON.parse(localStorage.getItem(ORDERS_KEY))
    expect(persisted[0].status).toBe("pago")
  })

  it("findOrder retorna null quando id não existe", () => {
    expect(findOrder("inexistente")).toBeNull()
  })
})
