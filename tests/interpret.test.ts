import { describe, expect, it } from "vitest";

import { interpretText } from "../server/interpret";

// These tests exercise the AI rewrite pipeline used by the Teclado and Gravar tabs.
// They rely on the built-in server LLM (no external key required).
describe("AI interpretation / rewrite", () => {
  it("returns empty string for empty input", async () => {
    const out = await interpretText("   ");
    expect(out).toBe("");
  });

  it("rewrites a messy input into a clean Portuguese sentence", async () => {
    const messy = "eu ta com mta sde qero agua plis";
    const out = await interpretText(messy);

    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
    // Should not just echo the broken input verbatim.
    expect(out).not.toBe(messy);
    // Should preserve core intent (water / thirst).
    expect(out.toLowerCase()).toMatch(/água|agua|sede/);
  }, 30000);
});
