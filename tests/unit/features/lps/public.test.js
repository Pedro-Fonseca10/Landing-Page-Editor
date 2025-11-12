import { describe, it, expect, beforeEach } from "vitest"
/*
  Testes unitários para helpers públicos de LPs.
  Garantem geração consistente de slugs e busca correta de landing pages salvas.
*/

import {
  findLpBySlug,
  makeSlug,
} from "../../../../src/features/lps/public.js"

describe("public LP helpers", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("makeSlug normaliza título e inclui prefixo do id", () => {
    const slug = makeSlug("Landing VIP 2025!", "abc123456")
    expect(slug).toBe("landing-vip-2025-abc123")
  })

  it("findLpBySlug busca LP persistida em storage", () => {
    localStorage.setItem(
      "plp:lps",
      JSON.stringify([
        { slug: "lp-1", title: "One" },
        { slug: "lp-2", title: "Two" },
      ])
    )
    expect(findLpBySlug("lp-2")).toMatchObject({ title: "Two" })
    expect(findLpBySlug("missing")).toBeNull()
  })
})
