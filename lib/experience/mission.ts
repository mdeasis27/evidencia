import corpus from "@/lib/rag/corpus.json";
import questions from "@/lib/rag/questions.json";
import { answerQuestion } from "@/lib/rag/answer";
import { verifyCitations } from "@/lib/rag/citations";
import { queryCoverage } from "@/lib/rag/coverage";
import { bm25Retriever, reciprocalRankFusion, tfidfRetriever } from "@/lib/rag/retrievers";
import type { DemoAdapter, TraceEvent } from "@/design-system/demo/types";

type Question = { id: string; query: string; relevantChunkIds: string[]; answerable: boolean };
export type AnswerStatus = "served" | "rerouted" | "lost";
export type CheckedAnswer = { id: string; status: AnswerStatus };
export type MissionInput = { minCoverage: number };
export type MissionResult = { items: CheckedAnswer[]; wrong: number; comparison: { mine: number; ungated: number } };

const STEP = 6;
const TOP_K = 3;
const docs = corpus as { id: string; text: string }[];
const hybrid = reciprocalRankFusion([bm25Retriever(docs), tfidfRetriever(docs)], docs);
const textOf = (id: string) => docs.find((d) => d.id === id)?.text ?? "";

/** Each committed question: answered from a relevant page, refused, or answered from the wrong page / out of scope. */
export function checkAnswers(minCoverage: number): CheckedAnswer[] {
  if (!Number.isFinite(minCoverage) || minCoverage <= 0 || minCoverage > 1) throw new Error("minCoverage must be in (0, 1].");
  return (questions as Question[]).map((q) => {
    const a = answerQuestion(q.query, hybrid, docs, TOP_K);
    const cited = verifyCitations(a.citations, a.retrieved, textOf).every((v) => v.grounded && v.supported);
    const coverage = queryCoverage(q.query, a.retrieved.map(textOf));
    const answered = a.status === "answered" && cited && coverage > 0 && coverage >= minCoverage;
    if (!answered) return { id: q.id, status: "rerouted" };
    const rightPage = q.answerable && q.relevantChunkIds.some((id) => a.retrieved.includes(id));
    return { id: q.id, status: rightPage ? "served" : "lost" };
  });
}

const wrongIn = (items: CheckedAnswer[]) => items.filter((i) => i.status === "lost").length;
/** Without a coverage gate any answer with a valid citation goes out (smallest positive share). */
const UNGATED = Number.MIN_VALUE;

export const runMission: DemoAdapter<MissionInput, MissionResult> = async (input, signal, onEvent) => {
  const startedAt = performance.now();
  const items = checkAnswers(input.minCoverage);
  const trace: TraceEvent[] = [];
  for (let i = 0; i < items.length; i += STEP) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const event: TraceEvent = { id: `batch-${i / STEP + 1}`, step: i / STEP + 1, kind: "evidence", messageKey: `batch.${i / STEP + 1}`, timestampMs: performance.now() - startedAt, evidenceIds: items.slice(i, i + STEP).map((q) => q.id) };
    trace.push(event);
    onEvent(event);
  }
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  const wrong = wrongIn(items);
  return { input, result: { items, wrong, comparison: { mine: wrong, ungated: wrongIn(checkAnswers(UNGATED)) } }, trace, executionMs: performance.now() - startedAt, mode: "local" };
};
