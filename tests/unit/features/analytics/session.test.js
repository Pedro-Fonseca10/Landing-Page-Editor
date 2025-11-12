import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
/*
  Testes unitários para utilidades de sessão analítica.
  Valida persistência do visitor_id e renovação automática do session_id conforme TTL.
*/

import {
  getVisitorId,
  getSessionId,
} from "../../../../src/features/analytics/session.js"

const SESSION_KEY = "plp:session_id"

describe("analytics session helpers", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"))
    vi.spyOn(Math, "random").mockReturnValue(0.333333333)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("getVisitorId persiste o valor gerado", () => {
    const first = getVisitorId()
    expect(first).toBe(getVisitorId())
  })

  it("getSessionId renova timestamp mas mantém id enquanto TTL não expira", () => {
    const first = getSessionId()
    expect(first).toBeTruthy()

    vi.advanceTimersByTime(10 * 60 * 1000)
    const second = getSessionId()
    expect(second).toBe(first)

    const stored = JSON.parse(localStorage.getItem(SESSION_KEY))
    expect(stored.ts).toBe(Date.now())

    vi.advanceTimersByTime(40 * 60 * 1000)
    const third = getSessionId()
    expect(third).not.toBe(first)
  })
})
