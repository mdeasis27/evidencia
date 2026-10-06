"use client";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import corpus from "@/lib/rag/corpus.json";
import type { AnswerStatus, MissionResult } from "./mission";
import { focusQuestion, questionCells, revealedQuestions } from "./scene-state";
import { STORY } from "./story";

const PAGES = corpus.length;
const pageOf = (chunkId: string) => Number(chunkId.slice(1));
const VERDICT_BG: Record<AnswerStatus, string> = { served: "bg-success", rerouted: "bg-info", lost: "bg-danger" };
const VERDICT_MARK: Record<AnswerStatus, string> = { served: "✓", rerouted: "?", lost: "×" };
const TAB = {
  idle: { rect: "fill-surface stroke-border", text: "fill-muted-foreground" },
  hit: { rect: "fill-surface stroke-foreground", text: "fill-foreground" },
  open: { rect: "fill-foreground stroke-foreground", text: "fill-background font-bold" },
  answer: { rect: "fill-surface stroke-success", text: "fill-success font-bold" },
} as const;

/** The student and the book: which page each question opens, how much it covers against the bar, and the answer it gives. */
export function EvidenciaStoryScene({ frame, result, minCoverage, locale }: { frame: PlaybackFrame<TraceEvent>; result: MissionResult; minCoverage: number; locale: "en" | "es" }) {
  const copy = STORY[locale].scene;
  const reduced = useReducedMotion();
  const items = result.items;
  const revealed = revealedQuestions(frame, items.length, reduced);
  const done = reduced || frame.complete || frame.total === 0;
  const cells = questionCells(items, revealed);
  const c = tapeCounts(cells);
  const i = focusQuestion(items, revealed, done);
  const q = items[i];
  const pages = q.retrieved.map(pageOf);
  const opened = pages[0];
  const answerPages = q.status === "lost" ? q.relevant.map(pageOf) : [];
  const tabState = (p: number): keyof typeof TAB => answerPages.includes(p) ? "answer" : p === opened ? "open" : pages.includes(p) ? "hit" : "idle";
  const join = (ps: number[]) => ps.join(` ${copy.and} `);
  const cov = Math.round(q.coverage * 100);
  const bar = Math.round(minCoverage * 100);
  const verdict = q.status === "rerouted" ? copy.verdict.rerouted : copy.verdict[q.status](opened);
  const opensLine = opened === undefined ? "" : `${copy.opens} ${opened}`;
  const alsoLine = pages.length > 1 ? `${copy.alsoReads} ${join(pages.slice(1))}` : "";
  const answerLine = answerPages.length ? `${copy.answerWas} ${copy.answerOn} ${join(answerPages)}` : "";
  const bookLabel = [copy.manual(PAGES), opensLine, alsoLine, answerLine].filter(Boolean).join(". ");
  const anim = (a: string) => `${a} motion-reduce:animate-none`;

  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <div key={q.id} data-evidencia-question={q.id} data-status={q.status} className="min-w-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-mono text-lg font-semibold tracking-tight">{copy.question(i + 1, items.length)}</p>
        {q.relevant.length === 0 ? <p className="text-sm text-muted-foreground">{copy.notInManual}</p> : null}
      </div>

      <svg viewBox="0 0 360 214" role="img" aria-label={bookLabel} className="mx-auto mt-4 block h-auto w-full max-w-[460px]">
        <path d="M2 10 Q90 2 178 14 V206 Q90 196 2 204 Z" className="fill-background stroke-border" />
        <path d="M358 10 Q270 2 178 14 V206 Q270 196 358 204 Z" className="fill-background stroke-border" />
        <text x="90" y="34" textAnchor="middle" fontSize="13" className="fill-muted-foreground">{copy.manual(PAGES)}</text>
        {Array.from({ length: PAGES }, (_, k) => {
          const p = k + 1, s = TAB[tabState(p)], ans = tabState(p) === "answer";
          return <g key={p} transform={`translate(${17 + (k % 4) * 38},${46 + Math.floor(k / 4) * 39})`} aria-hidden="true">
            <rect width="32" height="32" rx="4" strokeWidth={ans ? 2.5 : 1.5} strokeDasharray={ans ? "4 3" : undefined} className={`transition-colors duration-200 motion-reduce:transition-none ${s.rect}`} />
            <text x="16" y="21" textAnchor="middle" fontSize="14" className={s.text}>{p}</text>
          </g>;
        })}
        <g aria-hidden="true">
          <text x="268" y="40" textAnchor="middle" fontSize="13" className="fill-muted-foreground">{copy.opens}</text>
          <text x="268" y="92" textAnchor="middle" fontSize="38" fontWeight="700" className="fill-foreground">{opened === undefined ? "-" : copy.page(opened)}</text>
          <text x="268" y="120" textAnchor="middle" fontSize="13" className="fill-muted-foreground">{alsoLine}</text>
          {answerLine ? <g className={anim("animate-[ev-in_200ms_ease-out_350ms_both]")}>
            <text x="268" y="160" textAnchor="middle" fontSize="13" fontWeight="600" className="fill-success">{copy.answerWas}</text>
            <text x="268" y="180" textAnchor="middle" fontSize="13" fontWeight="600" className="fill-success">{`${copy.answerOn} ${join(answerPages)}`}</text>
          </g> : null}
        </g>
      </svg>

      <div className="mt-5">
        <p className="text-sm text-muted-foreground">{copy.coverageLabel}</p>
        <div className="relative mt-2 h-3 rounded-full border border-border bg-background">
          <div style={{ width: `${Math.min(100, cov)}%` }} className={`h-full origin-left rounded-full ${q.coverage >= minCoverage ? "bg-foreground/60" : "bg-info"} ${anim("animate-[ev-grow_250ms_ease-out_50ms_both]")}`} />
          <div aria-hidden="true" style={{ left: `${bar}%` }} className="absolute -top-1.5 h-6 w-0.5 bg-foreground" />
        </div>
        <p className="mt-2 flex justify-between gap-3 font-mono text-xs"><span>{copy.covers(cov)}</span><span className="text-muted-foreground">{copy.requires(bar)}</span></p>
      </div>

      <p className={`mt-4 rounded-full px-4 py-2 text-center text-sm font-semibold text-white ${VERDICT_BG[q.status]} ${anim("animate-[ev-in_150ms_ease-out_250ms_both]")}`}>
        <span aria-hidden="true" className="mr-2">{VERDICT_MARK[q.status]}</span>{verdict}
      </p>
    </div>

    <div className="mt-6">
      <OutcomeTape cells={cells} labels={copy.tape} ariaLabel={copy.tapeLabel} columns={12} />
      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight">{copy.wrongOf(c.lost)}</p>
    </div>
  </StoryStage>;
}
