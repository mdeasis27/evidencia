import {runExperience, type ExperienceInput, type ExperienceResult} from "./adapter";
import type {DemoAdapter} from "@/design-system/demo/types";

export type MissionResult = ExperienceResult & {comparison:{strict:ExperienceResult;flexible:ExperienceResult}};
export const runMission: DemoAdapter<ExperienceInput, MissionResult> = async (input, signal, onEvent) => {
  const start = performance.now();
  const run = await runExperience(input, signal, onEvent);
  const other = await runExperience({...input, strict:!input.strict}, signal, () => {});
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  return {...run, executionMs:performance.now()-start, result:{...run.result, comparison:{
    strict:input.strict ? run.result : other.result,
    flexible:input.strict ? other.result : run.result,
  }}};
};
