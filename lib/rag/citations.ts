// lib/rag/citations.ts
// Citation verification — the load-bearing part of a grounded RAG system.
//
// A generated answer is only as good as its provenance: every claim must cite a
// chunk that was actually retrieved, and the claim must be lexically supported
// by that chunk. The functions here make that check mechanical instead of
// asserted.

export type Citation = { chunkId: string; claim: string };

const CITATION_RE = /\[(c\d{2})\]/g;

/** Extract the chunk ids referenced by `[cXX]` markers, in order, de-duplicated. */
export function extractCitationIds(answer: string): string[] {
  const ids = [...answer.matchAll(CITATION_RE)].map((m) => m[1]);
  return [...new Set(ids)];
}

/** A citation is grounded when its chunk was actually in the retrieved set. */
export function isGrounded(citation: Citation, retrieved: readonly string[]): boolean {
  return retrieved.includes(citation.chunkId);
}

/** Citations that reference chunks never retrieved — the classic hallucination. */
export function ungroundedCitations(
  citations: readonly Citation[],
  retrieved: readonly string[],
): Citation[] {
  return citations.filter((c) => !retrieved.includes(c.chunkId));
}

/** Share of citations that are grounded. 1.0 = every citation resolves. */
export function attributionRate(
  citations: readonly Citation[],
  retrieved: readonly string[],
): number {
  if (citations.length === 0) return 1;
  const grounded = citations.filter((c) => retrieved.includes(c.chunkId)).length;
  return grounded / citations.length;
}

const STOP = new Set([
  "de", "la", "el", "los", "las", "un", "una", "unos", "unas",
  "es", "son", "por", "para", "con", "en", "y", "o", "a", "al",
  "del", "se", "que", "no", "su", "sus", "lo", "este", "esta",
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0 && !STOP.has(t));
}

/** Lexical span support: share of the claim's content words present in the chunk. */
export function spanSupport(claim: string, chunkText: string): number {
  const claimTokens = new Set(tokens(claim));
  if (claimTokens.size === 0) return 0;
  const chunkTokens = new Set(tokens(chunkText));
  const supported = [...claimTokens].filter((t) => chunkTokens.has(t)).length;
  return supported / claimTokens.size;
}

export type CitationVerdict = {
  chunkId: string;
  grounded: boolean;
  supported: boolean;
  support: number;
};

/** Verify every citation: grounded in retrieval AND lexically supported. */
export function verifyCitations(
  citations: readonly Citation[],
  retrieved: readonly string[],
  chunkText: (chunkId: string) => string,
  supportThreshold = 0.3,
): CitationVerdict[] {
  return citations.map((c) => {
    const support = spanSupport(c.claim, chunkText(c.chunkId));
    return {
      chunkId: c.chunkId,
      grounded: retrieved.includes(c.chunkId),
      supported: support >= supportThreshold,
      support,
    };
  });
}
