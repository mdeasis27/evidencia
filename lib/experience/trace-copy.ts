const COPY: Record<string, { en: string; es: string }> = {
  "answer.served": { en: "answered citing a page that has it", es: "respondió citando una página que la tiene" },
  "answer.rerouted": { en: "said it was not sure", es: "dijo que no estaba seguro" },
  "answer.lost": { en: "answered citing the wrong page", es: "respondió citando la página equivocada" },
};
export function traceCopy(locale: "en" | "es", key: string) { return COPY[key]?.[locale] ?? key; }
