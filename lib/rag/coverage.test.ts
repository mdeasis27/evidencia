import { describe, expect, it } from "vitest";
import fixture from "./fixtures/coverage.json";
import { queryCoverage, queryTerms } from "./coverage";

describe("query coverage", () => {
  it("keeps accented words whole", () => {
    expect(queryTerms("¿Cuál es el máximo de crédito?")).toEqual(["cuál", "máximo", "crédito"]);
  });

  it("is the share of question terms found in the retrieved text", () => {
    expect(queryCoverage("límite de crédito mensual", ["El límite de crédito se revisa cada año."])).toBeCloseTo(2 / 3, 12);
    expect(queryCoverage("de la", ["nada"])).toBe(0);
  });

  it("matches the per-question coverage pinned for Python", () => {
    for (const q of fixture.questions) expect(queryCoverage(q.query, q.retrievedTexts)).toBe(q.coverage);
  });
});
