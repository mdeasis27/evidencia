import { expect, it } from "vitest";
import { runExperience } from "./adapter";

it("reads accented question words whole", async () => {
  const run = await runExperience({ question: "¿Cuántos días tengo?", corpus: "Tienes 30 días para pagar.", strict: false }, new AbortController().signal, () => {});
  expect(run.result.status).toBe("answered");
});
