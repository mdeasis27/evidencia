import {StoryBrief} from "@/design-system/demo/decision-lab";
import stories from "@/docs/quality/business-story.json";
export function BusinessBrief({lang}:{lang:"en"|"es"}) {
 const s=stories[lang];
 return <StoryBrief locale={lang} story={{eyebrow:lang==="en"?"Decision lab":"Laboratorio de decisiones",mission:lang==="en"?"Turn a question into an inspectable answer.":"Convierte una pregunta en una respuesta inspeccionable.",context:s.problem,role:s.user,decision:s.decision,stakes:s.value}}/>;
}
