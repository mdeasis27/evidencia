"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { Card } from "@/design-system/components/card";
import { MetricCard } from "@/design-system/components/metric-card";
import { StatusBadge } from "@/design-system/components/status-badge";
import { getDemoQuestions, getHeadline } from "@/lib/rag/demo";

const HEADLINE = getHeadline();
const QUESTIONS = getDemoQuestions();

const pct = (v: number) => `${(v * 100).toFixed(0)}%`;

const PRE = QUESTIONS[0]?.query ?? "";

interface ChunkText {
  id: string;
  text: string;
}

interface Verdict {
  chunkId: string;
  grounded: boolean;
  supported: boolean;
  support: number;
}

interface AskResult {
  query?: string;
  status: "answered" | "refused";
  text: string;
  retrieved: string[];
  chunks: ChunkText[];
  verdicts: Verdict[];
  attribution: number;
  persisted?: boolean;
  error?: string;
}

interface HistoryItem {
  id: number;
  query: string;
  status: string;
  attribution: number;
  created_at: string;
}

export default function AppPage() {
  const [query, setQuery] = useState(PRE);
  const [hallucinate, setHallucinate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  async function run() {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query, hallucinate }),
      });
      const data = await res.json();
      setResult(data);
      if (res.ok) loadHistory();
    } catch (err) {
      setResult({
        status: "refused",
        text: "",
        retrieved: [],
        chunks: [],
        verdicts: [],
        attribution: 1,
        error: err instanceof Error ? err.message : "Error de red",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.answers ?? []);
      }
    } catch {
      /* history is best-effort */
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const ungrounded = result ? result.verdicts.filter((v) => !v.grounded).length : 0;

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
          <StatusBadge tone="success" dot className="px-3 py-1">
            Postgres en vivo
          </StatusBadge>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* ── SUMMARY ─────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Atribución" value={pct(HEADLINE.attribution)} tone="success" />
          <MetricCard label="Chunks" value={HEADLINE.nCorpus} />
          <MetricCard label="Preguntas demo" value={HEADLINE.nQuestions} />
          <MetricCard label="Retriever" value="Híbrido" hint="BM25 + TF-IDF (RRF)" />
        </div>

        {/* ── PLAYGROUND ──────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Preguntas y respuestas en vivo</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Haz una pregunta sobre el corpus y comprueba que cada cita apunta a un chunk realmente
            recuperado. Activa &quot;simular alucinación&quot; para forzar una cita sin base. Cada
            respuesta queda guardada en Postgres.
          </p>

          <Card className="p-4 space-y-4">
            <div>
              <label htmlFor="query" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pregunta sobre el corpus
              </label>
              <input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej. ¿Qué umbral facial confirma identidad?"
                className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={run}
                disabled={loading}
                className="rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-sm font-medium text-[#ffffff] hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Respondiendo…" : "Responder"}
              </button>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={hallucinate}
                  onChange={(e) => setHallucinate(e.target.checked)}
                  className="size-4"
                />
                Simular alucinación
              </label>
            </div>
          </Card>

          {result?.error && <Alert tone="danger" title="No se pudo responder" className="mt-4">{result.error}</Alert>}

          {result && !result.error && (
            <div className="mt-4 space-y-4">
              <Card className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <StatusBadge tone={result.status === "answered" ? "success" : "warning"} dot>
                    {result.status === "answered" ? "respondida" : "rehusada"}
                  </StatusBadge>
                </div>
                <p className="text-sm leading-relaxed text-foreground">{result.text}</p>
              </Card>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricCard label="Atribución" value={pct(result.attribution)} tone={result.attribution === 1 ? "success" : "danger"} />
                <MetricCard label="Chunks recuperados" value={result.retrieved.length} />
                <MetricCard label="Citas" value={result.verdicts.length} />
                <MetricCard label="Citas sin base" value={ungrounded} tone={ungrounded > 0 ? "danger" : "success"} />
              </div>

              <Card className="p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Chunks recuperados
                </p>
                <ul className="space-y-2">
                  {result.chunks.map((c) => (
                    <li key={c.id} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 shrink-0 font-mono text-xs text-muted-foreground">[{c.id}]</span>
                      <span className="text-muted-foreground">{c.text}</span>
                    </li>
                  ))}
                </ul>
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
                      <span className="text-muted-foreground">soporte léxico {pct(v.support)}</span>
                    </li>
                  ))}
                </ul>
                {ungrounded > 0 && (
                  <Alert tone="danger" className="mt-4">
                    Una cita referencia un chunk que nunca fue recuperado. En producción este claim
                    se rechaza y regenera.
                  </Alert>
                )}
              </Card>
            </div>
          )}
        </section>

        {/* ── HISTORY ─────────────────────────── */}
        {history.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Historial de respuestas (persistido en Postgres)</h3>
            <div className="overflow-x-auto rounded-[var(--radius-md)] shadow-[var(--shadow-card)] bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--gray-50)]">
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pregunta</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Atribución</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {history.map((h) => (
                    <tr key={h.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setQuery(h.query)}>
                      <td className="px-4 py-2.5 text-foreground">{h.query}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge tone={h.status === "answered" ? "success" : "warning"}>
                          {h.status === "answered" ? "respondida" : "rehusada"}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{pct(Number(h.attribution))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <footer className="pt-8 border-t border-[var(--border)] flex items-center justify-between text-xs text-muted-foreground">
          <span>Evidencia · RAG con citas verificadas · Postgres en vivo</span>
          <a href="https://github.com/mdeasis27/evidencia" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors font-mono">GitHub</a>
        </footer>
      </div>
    </div>
  );
}
