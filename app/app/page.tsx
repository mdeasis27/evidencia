"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { buttonVariants } from "@/design-system/components/button";
import { Card } from "@/design-system/components/card";
import { MetricCard } from "@/design-system/components/metric-card";
import { StatusBadge } from "@/design-system/components/status-badge";
import { cn } from "@/design-system/utils";
import { ask, getDemoQuestions, getHeadline } from "@/lib/rag/demo";

const HEADLINE = getHeadline();
const QUESTIONS = getDemoQuestions();

export default function AppPage() {
  const [query, setQuery] = useState("");
  const [hallucinate, setHallucinate] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof ask> | null>(null);

  function run(q: string) {
    if (!q.trim()) return;
    setResult(ask(q, hallucinate));
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Inicio
            </Link>
            <div className="h-4 w-px bg-[var(--border)]" aria-hidden="true" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground leading-tight">Evidencia</h1>
                <p className="text-xs text-muted-foreground">RAG con citas verificadas</p>
              </div>
            </div>
          </div>
          <StatusBadge tone="info" dot className="px-3 py-1">
            Demo mode
          </StatusBadge>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Atribución" value={`${(HEADLINE.attribution * 100).toFixed(0)}%`} tone="success" />
          <MetricCard label="Chunks" value={HEADLINE.nCorpus} />
          <MetricCard label="Preguntas demo" value={HEADLINE.nQuestions} />
          <MetricCard label="Retriever" value="Híbrido" hint="BM25 + TF-IDF (RRF)" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Demo questions */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Preguntas de ejemplo
            </p>
            <div className="space-y-2">
              {QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => { setQuery(q.query); run(q.query); }}
                  className="w-full rounded-[var(--radius-md)] shadow-[var(--shadow-border-light)] bg-background px-3 py-2.5 text-left text-sm text-foreground hover:bg-[var(--gray-50)] transition-colors"
                >
                  {q.query}
                </button>
              ))}
            </div>
          </div>

          {/* Q&A panel */}
          <div className="space-y-4">
            <Card className="p-5">
              <form
                onSubmit={(e) => { e.preventDefault(); run(query); }}
                className="space-y-3"
              >
                <label htmlFor="query" className="block text-sm font-medium text-foreground">
                  Pregunta sobre el corpus
                </label>
                <input
                  id="query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej. ¿Qué umbral facial confirma identidad?"
                  className="w-full rounded-[var(--radius-md)] shadow-[var(--shadow-border-light)] bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className={cn(buttonVariants({ size: "default" }))}>
                    Preguntar
                  </button>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hallucinate}
                      onChange={(e) => setHallucinate(e.target.checked)}
                      className="size-4"
                    />
                    Simular alucinación (cita no recuperada)
                  </label>
                </div>
              </form>
            </Card>

            {result && (
              <div className="space-y-4">
                {result.status === "refused" ? (
                  <Alert tone="warning" title="Fuera de alcance">
                    {result.text}
                  </Alert>
                ) : (
                  <>
                    <Card className="p-5">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Respuesta
                        </p>
                        <StatusBadge tone={result.attribution === 1 ? "success" : "danger"} dot>
                          Atribución {(result.attribution * 100).toFixed(0)}%
                        </StatusBadge>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">{result.text}</p>
                    </Card>

                    <Card className="p-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Verificación de citas
                      </p>
                      <ul className="space-y-2">
                        {result.verdicts.map((v) => (
                          <li key={v.chunkId} className="flex items-center gap-2 text-sm">
                            <StatusBadge tone={v.grounded ? "success" : "danger"}>
                              {v.grounded ? "grounded" : "no recuperado"}
                            </StatusBadge>
                            <span className="font-mono text-xs text-muted-foreground">[{v.chunkId}]</span>
                            <span className="text-muted-foreground">
                              soporte léxico {(v.support * 100).toFixed(0)}%
                            </span>
                          </li>
                        ))}
                      </ul>
                      {result.verdicts.some((v) => !v.grounded) && (
                        <Alert tone="danger" className="mt-4">
                          Una cita referencia un chunk que nunca fue recuperado. En producción este
                          claim se rechaza y regenera.
                        </Alert>
                      )}
                    </Card>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="pt-8 border-t border-[var(--border)] flex items-center justify-between text-xs text-muted-foreground">
          <span>Evidencia · RAG con citas verificadas · Demo mode</span>
          <a href="https://github.com/mdeasis27/evidencia" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors font-mono">GitHub</a>
        </footer>
      </div>
    </div>
  );
}
