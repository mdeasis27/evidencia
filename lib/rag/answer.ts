// lib/rag/answer.ts
// Deterministic extractive answerer for the offline demo. Retrieves top-k
// chunks and assembles a cited answer from their lead sentences. A production
// deployment swaps this for an LLM behind the same Answer shape.

import type { Citation } from "./citations";

export type Answer = {
  status: "answered" | "refused";
  text: string;
  citations: Citation[];
  retrieved: string[];
};

function leadSentence(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences[0] ?? text;
}

export function answerQuestion(
  query: string,
  retrieve: (query: string, k: number) => string[],
  corpus: readonly { id: string; text: string }[],
  topK = 3,
): Answer {
  const retrieved = retrieve(query, topK);
  if (retrieved.length === 0) {
    return {
      status: "refused",
      text: "No encontré fuentes relevantes en el corpus para responder esta pregunta.",
      citations: [],
      retrieved,
    };
  }

  const citations: Citation[] = retrieved.map((id) => {
    const chunk = corpus.find((c) => c.id === id);
    return { chunkId: id, claim: leadSentence(chunk?.text ?? "") };
  });
  const text = citations.map((c) => `${c.claim} [${c.chunkId}]`).join(" ");

  return { status: "answered", text, citations, retrieved };
}

/** A "hallucinating" answerer that cites one chunk it never retrieved. */
export function answerQuestionWithHallucination(
  query: string,
  retrieve: (query: string, k: number) => string[],
  corpus: readonly { id: string; text: string }[],
  topK = 3,
): Answer {
  const answer = answerQuestion(query, retrieve, corpus, topK);
  if (answer.status !== "answered") return answer;
  // Fabricate a citation to a chunk outside the retrieved set (c99 if unused).
  const used = new Set(answer.retrieved);
  const outsider = corpus.find((c) => !used.has(c.id));
  if (!outsider) return answer;
  const fabricated: Citation = { chunkId: outsider.id, claim: leadSentence(outsider.text) };
  return {
    ...answer,
    text: `${answer.text} Además, el cliente tiene exposición adicional relevante [${outsider.id}].`,
    citations: [...answer.citations, fabricated],
  };
}
