import type { Heading } from "@/design-system/demo/project-story";

type NodeCopy = { name: string; sub: string; analogy: string };

export interface EvidenciaStory {
  name: string;
  oneLiner: string;
  chips: string[];
  analogy: { heading: Heading; paragraphs: string[]; dictionaryLabel: string; dictionary: { term: string; means: string }[] };
  why: { title: string; text: string };
  tryIt: { heading: Heading; lead: string; question: (pct: number) => string; yes: string; no: string; coverageLabel: string; note: string; simulate: string; cancel: string; reset: string; error: string; idle: string };
  compare: { heading: Heading; lead: string; mine: (pct: number) => string; ungated: string; wrong: string; sentence: (mine: number, ungated: number) => string; verdict: (wrong: number) => string };
  fit: { heading: Heading; worthLabel: string; worth: string; notLabel: string; not: string };
  proves: { heading: Heading; text: string };
  engineers: { summary: string; points: string[]; repoLabel: string };
  scene: { title: string; caption: string; statusLabels: { active: string; danger: string; success: string }; tapeLabel: string; nodes: { questions: NodeCopy; student: NodeCopy; cited: NodeCopy; declined: NodeCopy }; tape: { served: string; rerouted: string; lost: string }; wrongOf: (n: number) => string };
}

export const STORY: Record<"en" | "es", EvidenciaStory> = {
  en: {
    name: "Grounded answers",
    oneLiner: "If it can't point to the page the answer came from, it should say it doesn't know.",
    chips: ["Answers with sources", "2 min", "Live demo"],
    analogy: {
      heading: { before: "The", accent: "analogy" },
      paragraphs: [
        "A good student answers with the page number: \"it's on page 42\". When the page they open only half covers the question, they say they aren't sure. A careless one points to any page and hopes nobody checks.",
        "Here the student is an assistant that answers from a manual of sixteen passages. Each answer cites the passages it used. The slider decides how much of the question those passages must cover before the assistant may answer.",
      ],
      dictionaryLabel: "In the diagram below",
      dictionary: [
        { term: "the book", means: "16 passages of a policy manual" },
        { term: "the student", means: "the assistant that answers" },
        { term: "citing the page", means: "linking each answer to its passages" },
        { term: "\"I'm not sure\"", means: "a refusal when coverage is too low" },
      ],
    },
    why: { title: "Why I built it", text: "" },
    tryIt: {
      heading: { before: "Try", accent: "it" },
      lead: "Twenty-four questions about the manual. Twenty-one have their answer in it; three ask about things the manual never mentions.",
      question: (pct) => `Before you run it, place a bet: requiring ${pct}% of the question to be covered, does every answer cite a page that really has it?`,
      yes: "Yes, every answer",
      no: "No, at least one slips",
      coverageLabel: "Share of the question the cited pages must cover",
      note: "Each square is one question, in order. Green answered from the right page, blue said it wasn't sure, red answered from a page that doesn't have the answer.",
      simulate: "Run it",
      cancel: "Cancel",
      reset: "Start over",
      error: "The questions could not be answered. Try another setting.",
      idle: "Place your bet and press Run it.",
    },
    compare: {
      heading: { before: "With your bar", accent: "or none" },
      lead: "Same questions, same manual. One side uses your coverage bar; the other answers whenever it has any citation at all.",
      mine: (pct) => `Requiring ${pct}%`,
      ungated: "No bar",
      wrong: "answers from the wrong page",
      sentence: (mine, ungated) => {
        if (mine === ungated) return mine === 0 ? "Neither side answered from the wrong page." : `Both sides gave ${mine} ${mine === 1 ? "answer" : "answers"} from the wrong page.`;
        if (mine > ungated) return `This time no bar did better: ${ungated} against ${mine}.`;
        return `With your bar, ${mine === 0 ? "no answer" : mine === 1 ? "1 answer" : `${mine} answers`} came from the wrong page. With no bar, ${ungated}, including questions the manual never covers.`;
      },
      verdict: (n) => n === 0 ? "Every answer cited a page that has it" : n === 1 ? "1 answer cited the wrong page" : `${n} answers cited the wrong page`,
    },
    fit: {
      heading: { before: "Where it", accent: "fits" },
      worthLabel: "Worth it",
      worth: "When staff or customers act on what an assistant says and someone must be able to check where it came from. I picture a support desk answering from internal policies.",
      notLabel: "Not needed",
      not: "For brainstorming or drafting, where nobody expects each sentence to come from a document.",
    },
    proves: {
      heading: { before: "What it", accent: "proves" },
      text: "I treated a refusal as a good answer when the evidence is thin. The bar makes that trade visible: raise it and wrong pages disappear, raise it too far and good answers turn into refusals.",
    },
    engineers: {
      summary: "For engineers",
      points: [
        "Hybrid retrieval: BM25 and TF-IDF merged by reciprocal rank fusion, top 3 passages. Each claim cites a retrieved passage and is checked for grounding and support.",
        "Coverage is the share of question terms (four or more letters or digits, accents kept) found in the retrieved passages. Accented words used to be cut in half; that is fixed.",
        "Coverage per question is pinned in a fixture read by the TypeScript and Python suites. The retrievers and answerer run in TypeScript only.",
        "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
      ],
      repoLabel: "Source code",
    },
    scene: {
      title: "What the assistant did with each question",
      caption: "Watch each question get an answer with its page, or an honest \"I'm not sure\".",
      statusLabels: { active: "reading", success: "right page", danger: "wrong page" },
      tapeLabel: "Twenty-four questions, in order",
      nodes: {
        questions: { name: "Questions", sub: "24 about the manual", analogy: "the exam" },
        student: { name: "Assistant", sub: "reads and cites", analogy: "the student" },
        cited: { name: "Answered", sub: "with its passages", analogy: "the page number" },
        declined: { name: "Not sure", sub: "coverage too low", analogy: "\"I don't know\"" },
      },
      tape: { served: "right page", rerouted: "not sure", lost: "wrong page" },
      wrongOf: (n) => `Answers from the wrong page: ${n}`,
    },
  },
  es: {
    name: "Evidencia",
    oneLiner: "Si no puede señalar la página de donde sacó la respuesta, mejor que diga que no sabe.",
    chips: ["Respuestas con fuentes", "2 min", "Demo en vivo"],
    analogy: {
      heading: { accent: "La analogía" },
      paragraphs: [
        "Un buen alumno responde con el número de página: \"está en la página 42\". Cuando la página que abre solo cubre la mitad de la pregunta, dice que no está seguro. Uno descuidado señala cualquier página y espera que nadie revise.",
        "Aquí el alumno es un asistente que responde con un manual de dieciséis pasajes. Cada respuesta cita los pasajes que usó. El slider decide qué parte de la pregunta deben cubrir esos pasajes para que el asistente pueda responder.",
      ],
      dictionaryLabel: "En el diagrama de abajo",
      dictionary: [
        { term: "el libro", means: "16 pasajes de un manual de políticas" },
        { term: "el alumno", means: "el asistente que responde" },
        { term: "citar la página", means: "ligar cada respuesta con sus pasajes" },
        { term: "\"no estoy seguro\"", means: "un rechazo cuando la cobertura es baja" },
      ],
    },
    why: { title: "Por qué lo hice", text: "" },
    tryIt: {
      heading: { accent: "Pruébalo" },
      lead: "Veinticuatro preguntas sobre el manual. Veintiuna tienen su respuesta ahí; tres preguntan por cosas que el manual nunca menciona.",
      question: (pct) => `Antes de correrlo, apuesta: exigiendo que se cubra el ${pct}% de la pregunta, ¿cada respuesta cita una página que de verdad la tiene?`,
      yes: "Sí, todas",
      no: "No, al menos una se cuela",
      coverageLabel: "Parte de la pregunta que deben cubrir las páginas citadas",
      note: "Cada cuadrito es una pregunta, en orden. Verde respondió con la página correcta, azul dijo que no estaba seguro, rojo respondió con una página que no tiene la respuesta.",
      simulate: "Correr",
      cancel: "Cancelar",
      reset: "Empezar de nuevo",
      error: "No se pudieron responder las preguntas. Prueba con otro ajuste.",
      idle: "Haz tu apuesta y presiona Correr.",
    },
    compare: {
      heading: { before: "Con tu exigencia", accent: "o sin ninguna" },
      lead: "Mismas preguntas, mismo manual. De un lado se usa tu exigencia de cobertura; del otro se responde siempre que haya alguna cita.",
      mine: (pct) => `Exigiendo ${pct}%`,
      ungated: "Sin exigencia",
      wrong: "respuestas con la página equivocada",
      sentence: (mine, ungated) => {
        if (mine === ungated) return mine === 0 ? "Ningún lado respondió con la página equivocada." : `Los dos lados dieron ${mine} ${mine === 1 ? "respuesta" : "respuestas"} con la página equivocada.`;
        if (mine > ungated) return `Esta vez sin exigencia salió mejor: ${ungated} contra ${mine}.`;
        return `Con tu exigencia, ${mine === 0 ? "ninguna respuesta salió" : mine === 1 ? "1 respuesta salió" : `${mine} respuestas salieron`} con la página equivocada. Sin exigencia, ${ungated}, incluidas preguntas que el manual nunca cubre.`;
      },
      verdict: (n) => n === 0 ? "Todas las respuestas citaron una página que la tiene" : n === 1 ? "1 respuesta citó la página equivocada" : `${n} respuestas citaron la página equivocada`,
    },
    fit: {
      heading: { before: "¿Dónde", accent: "sirve", after: "?" },
      worthLabel: "Vale la pena",
      worth: "Cuando empleados o clientes actúan con lo que dice un asistente y alguien tiene que poder revisar de dónde salió. Pienso en una mesa de soporte que responde con políticas internas.",
      notLabel: "No hace falta",
      not: "Para lluvia de ideas o borradores, donde nadie espera que cada frase salga de un documento.",
    },
    proves: {
      heading: { before: "Lo que", accent: "demuestra" },
      text: "Traté el rechazo como una buena respuesta cuando la evidencia es poca. La exigencia hace visible el intercambio: si la subes, desaparecen las páginas equivocadas; si la subes de más, las buenas respuestas se vuelven rechazos.",
    },
    engineers: {
      summary: "Para ingenieros",
      points: [
        "Búsqueda híbrida: BM25 y TF-IDF combinados con reciprocal rank fusion, los 3 mejores pasajes. Cada afirmación cita un pasaje recuperado y se revisa que esté respaldada.",
        "La cobertura es la parte de los términos de la pregunta (cuatro o más letras o dígitos, con acentos) que aparece en los pasajes recuperados. Antes las palabras con acento se cortaban a la mitad; ya está corregido.",
        "La cobertura de cada pregunta está fijada en un fixture que leen las pruebas de TypeScript y de Python. Los buscadores y el generador de respuestas corren solo en TypeScript.",
        "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
      ],
      repoLabel: "Código fuente",
    },
    scene: {
      title: "Lo que hizo el asistente con cada pregunta",
      caption: "Mira cómo cada pregunta recibe una respuesta con su página o un \"no estoy seguro\" honesto.",
      statusLabels: { active: "leyendo", success: "página correcta", danger: "página equivocada" },
      tapeLabel: "Veinticuatro preguntas, en orden",
      nodes: {
        questions: { name: "Preguntas", sub: "24 sobre el manual", analogy: "el examen" },
        student: { name: "Asistente", sub: "lee y cita", analogy: "el alumno" },
        cited: { name: "Respondida", sub: "con sus pasajes", analogy: "el número de página" },
        declined: { name: "No seguro", sub: "cobertura baja", analogy: "\"no sé\"" },
      },
      tape: { served: "página correcta", rerouted: "no estaba seguro", lost: "página equivocada" },
      wrongOf: (n) => `Respuestas con la página equivocada: ${n}`,
    },
  },
};
