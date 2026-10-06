import { describe, expect, it } from "vitest";
import { STORY } from "./story";
import { lintStory, storyStrings as strings } from "@/design-system/demo/copy-lint";

describe("Evidencia story copy", () => {
  it("has the same shape in English and Spanish", () => {
    const keys = (o: unknown): string[] => o && typeof o === "object" && !Array.isArray(o) ? Object.entries(o).filter(([k]) => k !== "before" && k !== "after").flatMap(([k, v]) => [k, ...keys(v).map(x => `${k}.${x}`)]) : [];
    expect(keys(STORY.es)).toEqual(keys(STORY.en));
    expect(STORY.es.analogy.dictionary).toHaveLength(STORY.en.analogy.dictionary.length);
  });

  it("has no empty strings except the owner-supplied why note", () => {
    for (const locale of ["en", "es"] as const) {
      const { why, ...rest } = STORY[locale];
      expect(why.title.trim()).not.toBe("");
      for (const s of strings(rest)) expect(s.trim(), `${locale}: empty string`).not.toBe("");
    }
  });

  it("avoids AI-sounding patterns and brand names", () => {
    for (const locale of ["en", "es"] as const) expect(lintStory(STORY[locale]), locale).toEqual([]);
  });

  it("states the comparison truthfully at zero, one, a tie and the reverse case", () => {
    expect(STORY.es.compare.sentence(1, 3)).toBe("Con tu exigencia, 1 respuesta salió con la página equivocada. Sin exigencia, 3, incluidas preguntas que el manual nunca cubre.");
    expect(STORY.en.compare.sentence(0, 3)).toContain("no answer came from the wrong page");
    expect(STORY.en.compare.sentence(0, 0)).toBe("Neither side answered from the wrong page.");
    expect(STORY.es.compare.sentence(1, 1)).toBe("Los dos lados dieron 1 respuesta con la página equivocada.");
    expect(STORY.en.compare.sentence(3, 1)).toContain("no bar did better");
  });

  it("asks the bet about the bar the visitor chose and states the graded quantity", () => {
    expect(STORY.en.tryIt.question(30)).toContain("requiring 30% of the question");
    expect(STORY.es.tryIt.question(35)).toContain("se cubra el 35% de la pregunta");
    expect([0, 1, 2].map(STORY.es.compare.verdict)).toEqual(["Todas las respuestas citaron una página que la tiene", "1 respuesta citó la página equivocada", "2 respuestas citaron la página equivocada"]);
  });
});
