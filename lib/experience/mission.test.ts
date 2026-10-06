import { expect, it } from "vitest";
import { checkAnswers, runMission } from "./mission";

const count = (m: number) => {
  const items = checkAnswers(m);
  return { served: items.filter(i => i.status === "served").length, rerouted: items.filter(i => i.status === "rerouted").length, lost: items.filter(i => i.status === "lost").length };
};

it("requiring 30% coverage, 20 answers cite the right page and q14 answers from the wrong one", () => {
  expect(count(0.3)).toEqual({ served: 20, rerouted: 3, lost: 1 });
  expect(checkAnswers(0.3).filter(i => i.status === "lost").map(i => i.id)).toEqual(["q14"]);
});

it("flips the bet between 30% and 35%", () => {
  expect(count(0.35)).toEqual({ served: 20, rerouted: 4, lost: 0 });
});

it("sweep: both bet answers are reachable on the slider, and the default says no", () => {
  const answers = new Set<boolean>();
  for (let p = 5; p <= 100; p += 5) answers.add(count(p / 100).lost === 0);
  expect([...answers].sort()).toEqual([false, true]);
  expect(count(0.3).lost === 0).toBe(false);
});

it("runs the mission against no gate, reveals in groups and stops when cancelled", async () => {
  const ids: string[] = [];
  const run = await runMission({ minCoverage: 0.3 }, new AbortController().signal, e => ids.push(e.id));
  expect(run.result.items).toHaveLength(24);
  expect(run.result.comparison).toEqual({ mine: 1, ungated: 3 });
  expect(ids).toHaveLength(4);
  const c = new AbortController(); c.abort();
  await expect(runMission({ minCoverage: 0.3 }, c.signal, () => {})).rejects.toThrow();
});
