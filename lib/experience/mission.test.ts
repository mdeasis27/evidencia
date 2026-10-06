import {expect, test} from "vitest";
import {runMission} from "./mission";

test("compares only citation strictness on the same partial evidence", async () => {
  const input = {question:"Support refund?", corpus:"Support is available in the help center.", strict:true};
  const run = await runMission(input, new AbortController().signal, () => {});
  expect(run.result.status).toBe("refused");
  expect(run.result.comparison.strict.status).toBe("refused");
  expect(run.result.comparison.flexible.status).toBe("answered");
  expect(run.input).toEqual(input);
  expect(input.strict).toBe(true);
  expect(run.trace).toHaveLength(2);
});
test("missing evidence is refused by both policies", async () => {
  const run = await runMission({question:"Refund policy?",corpus:"Support is available.",strict:false},new AbortController().signal,()=>{});
  expect(run.result.comparison.strict.status).toBe("refused");
  expect(run.result.comparison.flexible.status).toBe("refused");
});
test("cancellation during the visible trace stops the whole mission", async () => {
  const controller = new AbortController();
  await expect(runMission({question:"Support refund?",corpus:"Support is available.",strict:true},controller.signal,()=>controller.abort())).rejects.toThrow("Aborted");
});
