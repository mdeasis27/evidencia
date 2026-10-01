import { NextResponse } from "next/server";
import { getSql } from "@/lib/db/client";
import { ask } from "@/lib/rag/demo";
import corpusJson from "@/lib/rag/corpus.json";

const CORPUS = corpusJson as readonly {
  id: string;
  docId: string;
  section: string;
  text: string;
}[];

const chunkText = (id: string) => CORPUS.find((c) => c.id === id)?.text ?? "";

export async function POST(request: Request) {
  let question: string;
  let hallucinate = false;
  try {
    const body = await request.json();
    question = typeof body.question === "string" ? body.question.trim() : "";
    hallucinate = body.hallucinate === true;
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  if (!question) {
    return NextResponse.json({ error: "Escribe una pregunta" }, { status: 400 });
  }

  const result = ask(question, hallucinate);
  const chunks = result.retrieved.map((id) => ({ id, text: chunkText(id) }));

  let persisted = true;
  try {
    const db = getSql();
    await db`INSERT INTO evidencia.answers (query, status, attribution) VALUES (${result.query}, ${result.status}, ${result.attribution})`;
  } catch {
    persisted = false;
  }

  return NextResponse.json({
    ...result,
    chunks,
    persisted,
  });
}
