const COPY: Record<string, { en: string; es: string }> = {
  "batch.1": { en: "questions 1 to 6 answered", es: "preguntas 1 a 6 respondidas" },
  "batch.2": { en: "questions 7 to 12 answered", es: "preguntas 7 a 12 respondidas" },
  "batch.3": { en: "questions 13 to 18 answered", es: "preguntas 13 a 18 respondidas" },
  "batch.4": { en: "questions 19 to 24 answered", es: "preguntas 19 a 24 respondidas" },
};
export function traceCopy(locale: "en" | "es", key: string) { return COPY[key]?.[locale] ?? key; }
