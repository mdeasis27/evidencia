import {OutcomeBlock, StoryStage} from "@/design-system/demo/decision-lab";
import type {ExperienceInput, ExperienceResult} from "@/lib/experience/adapter";

export function EvidenceScene({input,result,visible,total,complete,lang}:{input:ExperienceInput;result:ExperienceResult|null;visible:number;total:number;complete:boolean;lang:"en"|"es"}) {
 const es=lang==="es";
 const terms=[...new Set(input.question.match(/[\p{L}\p{N}]+/gu)??[])].slice(0,6);
 const passages=result?.passages.slice(0,3)??[];
 const match=(term:string,text:string)=>text.toLocaleLowerCase().includes(term.toLocaleLowerCase());
 return <StoryStage locale={lang} title={es?"De la pregunta a sus fuentes":"From question to sources"} caption={es?"Las líneas muestran coincidencias literales con pasajes recuperados. La comprobación final exige cobertura de términos; puedes abrir cada fuente.":"Lines show literal matches with retrieved passages. The final check requires term coverage; open each source to inspect it."} step={visible} total={total}>
  <p className="mb-2 text-sm text-muted-foreground sm:hidden">{es?"Desliza el diagrama para inspeccionar las fuentes →":"Scroll the diagram to inspect the sources →"}</p><div className="mb-4 overflow-x-auto" tabIndex={0} role="region" aria-label={es?"Diagrama de evidencia; desplázalo horizontalmente":"Evidence diagram; scroll horizontally"}><svg role="img" aria-label={es?"Conexiones entre términos y fuentes recuperadas":"Connections between question terms and retrieved sources"} viewBox="0 0 760 280" className="h-auto w-full min-w-[760px]">
   <text x="20" y="20" fill="var(--muted)" fontSize="14">{es?"TU PREGUNTA":"YOUR QUESTION"}</text><text x="420" y="20" fill="var(--muted)" fontSize="14">{es?"FUENTES LOCALES":"LOCAL SOURCES"}</text>
   {visible>0&&terms.flatMap((term,i)=>passages.filter(p=>match(term,p.text)).map((p)=>{const index=passages.indexOf(p);return <path key={term+p.id} d={`M210 ${52+i*35} C310 ${52+i*35},310 ${65+index*74},420 ${65+index*74}`} fill="none" stroke="var(--info)" strokeWidth="2" opacity=".55"/>;}))}
   {terms.map((term,i)=><g key={term}><rect x="20" y={36+i*35} width="190" height="29" rx="6" fill="var(--surface)" stroke={visible>0&&!passages.some(p=>match(term,p.text))?"var(--warning)":"var(--border)"}/><text x="32" y={55+i*35} fill="var(--foreground)" fontSize="14">{term.length>22?term.slice(0,22)+"…":term}</text></g>)}
   {visible>0&&passages.map((p,i)=><g key={p.id}><rect x="420" y={35+i*74} width="315" height="59" rx="8" fill="var(--surface)" stroke="var(--info)"/><text x="432" y={55+i*74} fill="var(--info)" fontSize="14">{p.id}</text><text x="432" y={77+i*74} fill="var(--foreground)" fontSize="14">{p.text.slice(0,43)}{p.text.length>43?"…":""}</text></g>)}
   {visible>0&&passages.length===0&&<text x="420" y="80" fill="var(--warning)" fontSize="14">{es?"No se recuperaron fuentes compatibles":"No matching sources retrieved"}</text>}
  </svg></div>
  {visible>0&&<div className="mb-6 space-y-2">{result?.passages.map(p=><details key={p.id} className="rounded border border-border p-3"><summary className="cursor-pointer text-sm"><span className="mr-2 font-mono text-info">{p.id}</span>{es?"Inspeccionar pasaje completo":"Inspect full passage"}</summary><p className="mt-3 text-sm leading-7">{p.text}</p></details>)}</div>}
  {complete&&result&&<OutcomeBlock tone={result.status==="refused"?"warning":"success"} title={result.status==="answered"?(es?"Pasajes con términos coincidentes":"Passages with matching terms"):(es?"Falta evidencia: requiere revisión":"Evidence missing: review required")} explanation={result.status==="refused"?(es?"El corpus no sustenta la afirmación. La demo rechaza la respuesta en lugar de inventar información.":result.answer):result.answer}/>}
  {complete&&result&&<p className="mt-3 text-xs leading-6 text-muted-foreground">{es?(result.note.toLowerCase().includes("partial")?"Respaldo parcial: el modo flexible no equivale a una respuesta completamente verificada.":"Recuperación léxica local con comprobación de citas; no hay un modelo en vivo."):result.note}</p>}
 </StoryStage>;
}
