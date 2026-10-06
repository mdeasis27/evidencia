"use client";
import { MissionBrief, MissionPrompt, MissionComparison, DecisionNotes } from "@/design-system/demo/mission-lab";
import { useEffect, useState } from "react";
import { useDemoRun } from "@/design-system/demo/use-demo-run";
import { TracePlayer } from "@/design-system/demo/trace-player";
import { type ExperienceInput } from "@/lib/experience/adapter";
import { copy as en } from "@/lib/experience/copy.en";
import { copy as es } from "@/lib/experience/copy.es";
import { EvidenceScene } from "./evidence-scene";
import { experienceDefaults } from '@/lib/experience/defaults';
import { ScenarioPicker } from "@/design-system/demo/decision-lab";
import { evidenceScenariosFor } from "@/lib/experience/story";
import { runMission } from "@/lib/experience/mission";
function localizeError(error: string, lang: "en" | "es") {
    if (lang === "es" && error.startsWith("Provide a question")) {
        return "La pregunta y el corpus deben contener texto válido.";
    }
    return error;
}
export function Experience({ lang }: {
    lang: "en" | "es";
}) {
    const defaults = experienceDefaults[lang];
    const evidenceScenarios = evidenceScenariosFor(lang);
    const c = lang === "es" ? es : en;
    const other = lang === "en" ? "es" : "en";
    const [input, setInput] = useState(defaults);
    const [selected, setSelected] = useState<"supported" | "missing" | "custom">("supported");
    const [prediction, setPrediction] = useState<string | null>(null);
    const demo = useDemoRun(runMission);
    useEffect(() => {
        demo.cancel();
    }, [input.question, input.corpus, input.strict]);
    const change = (next: ExperienceInput) => {
        setInput(next);
        setSelected("custom");
        setPrediction(null);
        demo.reset();
    };
    return (<main className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a href={`/${lang}`}>← {lang === "es" ? "Portafolio" : "Portfolio"}</a>
        <a className="rounded border px-3 py-1" href={`/${other}/app`}>{other.toUpperCase()}</a>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{lang === "es" ? "Cambiar idioma reinicia el escenario." : "Changing language resets the scenario."}</p>
      <div className="mt-6"><MissionBrief locale={lang} name="EVIDENCIA" title={lang === "es" ? "¿Responderías sin evidencia suficiente?" : "Would you answer without enough evidence?"} context={lang === "es" ? "Un equipo de soporte necesita respuestas verificables. Prueba si una política estricta evita responder cuando el corpus solo cubre parte de la pregunta." : "A support team needs verifiable answers. Test whether a strict policy stops an answer when the corpus covers only part of the question."} role={lang === "es" ? "Responsable de soporte" : "Support lead"} stakes={lang === "es" ? "Confianza en las respuestas" : "Trust in answers"}/></div>
      <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
        <section className="min-w-0 rounded-2xl border p-5">
      <button type="button" data-mission-challenge className="mb-6 rounded-lg border border-accent px-4 py-3 text-sm" onClick={() => change({ ...defaults, question: lang === "es" ? "¿Soporte reembolso?" : "Support refund?", strict: true })}>{lang === "es" ? "Probar el reto: evidencia parcial" : "Try the challenge: partial evidence"} →</button>

          <ScenarioPicker locale={lang} selected={selected} onSelect={(id) => { setInput(evidenceScenarios[id as "supported" | "missing"]); setSelected(id as "supported" | "missing"); setPrediction(null); demo.reset(); }} options={[{ id: "supported", label: lang === "es" ? "Afirmación sustentada" : "Supported claim", description: lang === "es" ? "El pasaje cubre los términos de la pregunta." : "The passage covers the question terms." }, { id: "missing", label: lang === "es" ? "Evidencia ausente" : "Missing evidence", description: lang === "es" ? "El modo estricto rechaza la afirmación." : "Strict mode refuses the claim." }]}/>
          <label>
            {lang === "es" ? "Pregunta" : "Question"}
            <input className="mt-2 w-full border p-2" value={input.question} onChange={(event) => change({ ...input, question: event.target.value })}/>
          </label>
          <label className="mt-4 block">
            {lang === "es" ? "Corpus local" : "Local corpus"}
            <textarea className="mt-2 min-h-32 w-full border p-2" value={input.corpus} onChange={(event) => change({ ...input, corpus: event.target.value })}/>
          </label>
          <label className="mt-3 flex gap-2">
            <input type="checkbox" checked={input.strict} onChange={(event) => change({ ...input, strict: event.target.checked })}/>
            {lang === "es" ? "Exigir cobertura completa de términos" : "Require full term coverage"}
          </label>
          <MissionPrompt locale={lang} question={lang === "es" ? "Con estos datos y la política seleccionada, ¿la demo responderá o rechazará la pregunta?" : "With these inputs and the selected policy, will the demo answer or refuse the question?"} prediction={prediction} onPredict={setPrediction} locked={Boolean(demo.run) || demo.running} options={[{ id: "answered", label: lang === "es" ? "Responderá" : "It will answer" }, { id: "refused", label: lang === "es" ? "Rechazará" : "It will refuse" }]}/>
        <button data-run-experiment className="mt-5 w-full rounded bg-accent py-2 text-white" disabled={demo.running} onClick={() => demo.execute(input)}>{demo.running ? (lang === "es" ? "Recuperando" : "Retrieving") : c.run}</button>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="min-w-0 rounded border px-3 py-1" onClick={demo.cancel}>{lang === "es" ? "Cancelar" : "Cancel"}</button>
            <button className="min-w-0 rounded border px-3 py-1" onClick={() => { setInput(experienceDefaults[lang]); setSelected("supported"); setPrediction(null); demo.reset(); }}>{lang === "es" ? "Restaurar" : "Reset"}</button>
          </div>
          {demo.error && <p className="mt-3 text-danger">{localizeError(demo.error, lang)}</p>}
        </section>
        <div className="min-w-0 space-y-5">
          <TracePlayer collapsible trace={demo.trace} locale={lang} executionMs={demo.run?.executionMs} translate={(key) => key === "retrieve" ? (lang === "es" ? "Pasajes recuperados" : "Passages retrieved") : (lang === "es" ? "Cobertura de términos comprobada" : "Term coverage checked")} renderStage={(frame) => <><EvidenceScene input={demo.run?.input ?? input} result={demo.run?.result ?? null} lang={lang} visible={frame.visible} total={frame.total} complete={frame.complete}/>{frame.complete && demo.run && <MissionComparison locale={lang} prediction={prediction} actual={demo.run.result.status} actualLabel={demo.run.result.status === "answered" ? (lang === "es" ? "Responde con la política elegida." : "Answers under the selected policy.") : (lang === "es" ? "Rechaza con la política elegida." : "Refuses under the selected policy.")} sides={[{ label: lang === "es" ? "Citas estrictas" : "Strict citations", value: demo.run.result.comparison.strict.status === "answered" ? (lang === "es" ? "Responde" : "Answered") : (lang === "es" ? "Rechaza" : "Refused"), detail: lang === "es" ? "Exige cobertura completa de los términos de la pregunta." : "Requires full coverage of the question terms." }, { label: lang === "es" ? "Citas flexibles" : "Flexible citations", value: demo.run.result.comparison.flexible.status === "answered" ? (lang === "es" ? "Responde" : "Answered") : (lang === "es" ? "Rechaza" : "Refused"), detail: lang === "es" ? "Permite cobertura parcial; no significa respaldo completo." : "Allows partial coverage; this does not mean complete support." }]} explanation={lang === "es" ? "Misma pregunta, mismo corpus y mismos recuperadores. Solo cambia la exigencia de cobertura. Ambas políticas rechazan si no hay evidencia compatible. Esta comprobación léxica no demuestra que una afirmación sea verdadera." : "Same question, corpus and retrievers. Only the coverage requirement changes. Both policies refuse when matching evidence is absent. This lexical check does not establish whether a claim is true."}/>}</>}/>
        </div>
      </div>
      <DecisionNotes locale={lang} implementation={lang === "es" ? "Recuperación BM25 y TF-IDF combinada, citas locales y una traza inspeccionable." : "Combined BM25 and TF-IDF retrieval, local citations and an inspectable trace."} rationale={lang === "es" ? "La recuperación léxica permite reproducir cada paso sin llaves. La cobertura de palabras es una aproximación, no una evaluación semántica." : "Lexical retrieval makes every step reproducible without keys. Word coverage is a proxy, not a semantic evaluation."} production={lang === "es" ? "Evaluar preguntas reales, calidad de citas, privacidad, permisos y respuestas sin evidencia antes de conectar un modelo." : "Evaluate real questions, citation quality, privacy, permissions and unsupported answers before connecting a model."}/>
    </main>);
}
