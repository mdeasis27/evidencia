import { describe, expect, it } from "vitest";

import { answerQuestion, answerQuestionWithHallucination } from "./answer";
import corpus from "./corpus.json";

const corpusChunks = corpus as readonly { id: string; text: string }[];

function fakeRetrieve(results: Record<string, string[]>) {
  return (query: string, _k: number) => results[query] ?? [];
}

describe("answerQuestion", () => {
  it("refuses when nothing is retrieved", () => {
    const answer = answerQuestion("pregunta sin fuentes", fakeRetrieve({}), corpusChunks);
    expect(answer.status).toBe("refused");
    expect(answer.citations).toHaveLength(0);
  });

  it("cites exactly the retrieved chunks", () => {
    const answer = answerQuestion(
      "tasa",
      fakeRetrieve({ tasa: ["c01"] }),
      corpusChunks,
    );
    expect(answer.status).toBe("answered");
    expect(answer.citations.map((c) => c.chunkId)).toEqual(["c01"]);
    expect(answer.text).toContain("[c01]");
  });

  it("hallucination variant adds an ungrounded citation", () => {
    const retrieve = fakeRetrieve({ tasa: ["c01"] });
    const honest = answerQuestion("tasa", retrieve, corpusChunks);
    const bad = answerQuestionWithHallucination("tasa", retrieve, corpusChunks);
    expect(bad.citations.length).toBe(honest.citations.length + 1);
    expect(bad.retrieved).toEqual(honest.retrieved);
    const outsider = bad.citations[bad.citations.length - 1];
    expect(bad.retrieved).not.toContain(outsider.chunkId);
  });
});
