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

it("keeps what each answer opened, how much it covered and where the answer really was", () => {
  const items = checkAnswers(0.3);
  const q14 = items.find(i => i.id === "q14");
  expect(q14).toMatchObject({ status: "lost", retrieved: ["c07", "c08", "c12"], relevant: ["c13"] });
  expect(q14?.coverage).toBeCloseTo(0.33, 2);
  expect(items.find(i => i.id === "q22")).toMatchObject({ status: "rerouted", relevant: [], coverage: 0 });
  expect(items.find(i => i.id === "q01")).toMatchObject({ status: "served", retrieved: ["c01", "c02", "c14"], relevant: ["c01"] });
});

it("runs the mission against no gate, reveals one question per step and stops when cancelled", async () => {
  const ids: string[] = [];
  const run = await runMission({ minCoverage: 0.3 }, new AbortController().signal, e => ids.push(e.id));
  expect(run.result.items).toHaveLength(24);
  expect(run.result.comparison).toEqual({ mine: 1, ungated: 3 });
  expect(ids).toHaveLength(24);
  const c = new AbortController(); c.abort();
  await expect(runMission({ minCoverage: 0.3 }, c.signal, () => {})).rejects.toThrow();
});
