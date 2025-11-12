/*
  Testes de unidade para utilidades de geração de IDs.
  Verifica formato do UID completo, UID simplificado, validação de unicidade e reação a colisões.
*/

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  uid,
  simpleUid,
  isUniqueId,
  generateUniqueId,
} from "../../../src/lib/uid"

const TS = 1700000000000

describe("uid helpers", () => {
  let dateSpy

  beforeEach(() => {
    dateSpy = vi.spyOn(Date, "now").mockReturnValue(TS)
  })

  afterEach(() => {
    dateSpy.mockRestore()
    vi.restoreAllMocks()
  })

  it("uid combina timestamp e random em formato estável", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.456789123)

    const value = uid()
    const timestamp = TS.toString(36)
    const random = (0.456789123).toString(36).slice(2, 10)

    expect(value).toBe(`${timestamp}-${random}`)
  })

  it("simpleUid usa prefixo legível e timestamp absoluto", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.456789123)
    const value = simpleUid()
    expect(value.startsWith(`id-${TS}-`)).toBe(true)
    expect(value.split("-").at(-1)).toHaveLength(6)
  })

  it("isUniqueId responde corretamente com base em listas existentes", () => {
    expect(isUniqueId("a", ["b", "c"])).toBe(true)
    expect(isUniqueId("a", ["a", "c"])).toBe(false)
  })

  it("generateUniqueId reprocessa quando há colisão", () => {
    const mathRandom = vi.spyOn(Math, "random")
    mathRandom
      .mockReturnValueOnce(0.111111111)
      .mockReturnValueOnce(0.987654321)

    const collision =
      `${TS.toString(36)}-${(0.111111111).toString(36).slice(2, 10)}`
    const next = generateUniqueId([collision])
    expect(next).not.toBe(collision)
    expect(mathRandom).toHaveBeenCalledTimes(2)
  })
})
