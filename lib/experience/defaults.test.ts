import {expect,it} from 'vitest';
import {experienceDefaults} from './defaults';
import {runExperience} from './adapter';

for(const locale of ['en','es'] as const){
 it(`the ${locale} starting scenario has supported evidence`,async()=>{
  const run=await runExperience(experienceDefaults[locale],new AbortController().signal,()=>{});
  expect(run.result.status).toBe('answered');
  expect(run.result.passages.some(passage=>passage.id==='local-1')).toBe(true);
 });
}
