import { describe, expect, it } from "vitest";

import {
  attributionRate,
  extractCitationIds,
  isGrounded,
  spanSupport,
  ungroundedCitations,
  verifyCitations,
} from "./citations";

describe("extractCitationIds", () => {
  it("parses [cXX] markers in order, de-duplicated", () => {
    expect(extractCitationIds("La tasa es 12% [c01] y el plazo [c02] y otra vez [c01]")).toEqual([
      "c01",
      "c02",
    ]);
  });
});

describe("grounding", () => {
  const citations = [
    { chunkId: "c01", claim: "La tasa de mora es 12 por ciento." },
    { chunkId: "c99", claim: "El cliente vive en Marte." },
  ];

  it("flags citations that reference chunks never retrieved", () => {
    const ungrounded = ungroundedCitations(citations, ["c01", "c02"]);
    expect(ungrounded).toHaveLength(1);
    expect(ungrounded[0].chunkId).toBe("c99");
  });

  it("computes attribution rate", () => {
    expect(attributionRate(citations, ["c01", "c02"])).toBe(0.5);
    expect(attributionRate(citations, ["c01", "c99"])).toBe(1);
    expect(attributionRate([], ["c01"])).toBe(1);
  });

  it("isGrounded checks membership", () => {
    expect(isGrounded(citations[0], ["c01"])).toBe(true);
    expect(isGrounded(citations[1], ["c01"])).toBe(false);
  });
});

describe("span support", () => {
  const source = "La tasa de interés de mora para créditos de consumo es del 12 por ciento anual.";

  it("is high for a claim drawn from the source", () => {
    expect(spanSupport("La tasa de mora es 12 por ciento.", source)).toBeGreaterThan(0.5);
  });

  it("is zero for a claim with no lexical overlap", () => {
    expect(spanSupport("El cliente vive en Marte.", source)).toBe(0);
  });
});

describe("verifyCitations", () => {
  const source = "La tasa de interés de mora para créditos de consumo es del 12 por ciento anual.";
  const citations = [
    { chunkId: "c01", claim: "La tasa de mora es 12 por ciento." },
    { chunkId: "c02", claim: "El cliente vive en Marte." },
  ];

  it("verifies grounding and lexical support separately", () => {
    const verdicts = verifyCitations(
      citations,
      ["c01"],
      (id) => (id === "c01" ? source : "El plazo máximo es de 60 meses."),
    );
    expect(verdicts[0]).toMatchObject({ grounded: true, supported: true });
    expect(verdicts[1]).toMatchObject({ grounded: false, supported: false });
  });
});
