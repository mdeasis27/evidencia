import {expect,test} from "vitest";
import {evidenceScenarios,evidenceScenariosFor} from "./story";
import {experienceDefaults} from "./defaults";
import {runExperience} from "./adapter";
test("business presets answer supported evidence and refuse an absent policy",async()=>{
 const supported=await runExperience(evidenceScenarios.supported,new AbortController().signal,()=>{});
 const missing=await runExperience(evidenceScenarios.missing,new AbortController().signal,()=>{});
 expect(supported.result.status).toBe("answered");
 expect(supported.result.passages[0].id).toBe("local-1");
 expect(missing.result.status).toBe("refused");
 expect(missing.trace.at(-1)?.kind).toBe("decision");
});
test("Spanish presets restore localized inputs and keep the evidence/refusal contrast",async()=>{
 const scenarios=evidenceScenariosFor("es");
 expect(scenarios.supported).toEqual(experienceDefaults.es);
 expect((await runExperience(scenarios.supported,new AbortController().signal,()=>{})).result.status).toBe("answered");
 expect((await runExperience(scenarios.missing,new AbortController().signal,()=>{})).result.status).toBe("refused");
});
