// lib/rag/demo.ts
// Computed demo layer: wires corpus + retrievers + answerer, and reports
// attribution + per-citation verification for the dashboard.

import corpusJson from "./corpus.json";
import questionsJson from "./questions.json";
import { bm25Retriever, reciprocalRankFusion, tfidfRetriever } from "./retrievers";
import { answerQuestion, answerQuestionWithHallucination } from "./answer";
import { attributionRate, verifyCitations, type CitationVerdict } from "./citations";

export type CorpusChunk = { id: string; docId: string; section: string; text: string };

const CORPUS = corpusJson as readonly CorpusChunk[];

const hybrid = reciprocalRankFusion([bm25Retriever(CORPUS), tfidfRetriever(CORPUS)], CORPUS);

const chunkText = (id: string): string => CORPUS.find((c) => c.id === id)?.text ?? "";

export function getDemoQuestions() {
  return (questionsJson as readonly { id: string; query: string }[]).slice(0, 8).map((q) => ({
    id: q.id,
    query: q.query,
  }));
}

export type VerifiedAnswer = {
  query: string;
  status: "answered" | "refused";
  text: string;
  retrieved: string[];
  verdicts: CitationVerdict[];
  attribution: number;
};

export function ask(query: string, hallucinate = false): VerifiedAnswer {
  const answer = hallucinate
    ? answerQuestionWithHallucination(query, hybrid, CORPUS)
    : answerQuestion(query, hybrid, CORPUS);
  const verdicts = verifyCitations(answer.citations, answer.retrieved, chunkText);
  return {
    query,
    status: answer.status,
    text: answer.text,
    retrieved: answer.retrieved,
    verdicts,
    attribution: attributionRate(answer.citations, answer.retrieved),
  };
}

export function getHeadline() {
  // Attribution over all answerable demo questions, no hallucination.
  const qs = getDemoQuestions();
  let total = 0;
  let grounded = 0;
  for (const q of qs) {
    const a = ask(q.query, false);
    total += a.verdicts.length;
    grounded += a.verdicts.filter((v) => v.grounded).length;
  }
  return {
    attribution: total === 0 ? 1 : grounded / total,
    nQuestions: qs.length,
    nCorpus: CORPUS.length,
  };
}

export function getRefusalRate() {
  const qs = getDemoQuestions();
  const refused = qs.filter((q) => ask(q.query, false).status === "refused").length;
  return refused / qs.length;
}
