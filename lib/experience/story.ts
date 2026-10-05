import type { ExperienceInput } from "./types";
import { experienceDefaults } from "./defaults";
export function evidenceScenariosFor(lang: "en" | "es"): Record<"supported" | "missing", ExperienceInput> {
  const supported = experienceDefaults[lang];
  return { supported, missing: { ...supported, question: lang === "es" ? "¿Política de reembolso?" : "Refund policy?" } };
}
export const evidenceScenarios: Record<"supported" | "missing", ExperienceInput> = { supported: { question: "Support center?", corpus: "Support is available in the help center. Billing changes need approval.", strict: true }, missing: { question: "Refund policy?", corpus: "Support is available in the help center. Billing changes need approval.", strict: true } };
export function isEvidenceScenario(input: ExperienceInput, id: keyof typeof evidenceScenarios) { const scenario = evidenceScenarios[id]; return input.question === scenario.question && input.corpus === scenario.corpus && input.strict === scenario.strict; }
