// lib/rag/coverage.ts
// How much of the question the retrieved passages cover: the share of question
// terms (4+ letters or digits, accents kept) found in the retrieved text.
// Mirrors query_coverage in backend/src/evidencia/citations.py.

export function queryTerms(query: string): string[] {
  return query.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? [];
}

export function queryCoverage(query: string, retrievedTexts: readonly string[]): number {
  const terms = queryTerms(query);
  if (terms.length === 0) return 0;
  const text = retrievedTexts.join(" ").toLowerCase();
  return terms.filter((t) => text.includes(t)).length / terms.length;
}
