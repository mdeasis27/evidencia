import type { TapeStatus } from "@/design-system/demo/outcome-tape";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import type { AnswerStatus } from "./mission";

export function questionCells(items: readonly { status: AnswerStatus }[], revealed: number): TapeStatus[] {
  return items.map((c, i) => (i >= revealed ? "pending" : c.status));
}

export function revealedQuestions(frame: { visible: number; total: number; complete: boolean }, n: number, reducedMotion: boolean): number {
  if (reducedMotion || frame.complete || frame.total === 0) return n;
  return Math.ceil((n * frame.visible) / frame.total);
}

export const COMPLETE_FRAME: PlaybackFrame<TraceEvent> = { visible: 0, total: 0, event: undefined, complete: true };

/** Index of the question shown in the book: the latest one while playing; once done, the first wrong page, else the first "not sure", else the last. */
export function focusQuestion(items: readonly { status: AnswerStatus }[], revealed: number, done: boolean): number {
  if (!done) return Math.max(0, Math.min(revealed, items.length) - 1);
  for (const status of ["lost", "rerouted"] as const) {
    const i = items.findIndex(q => q.status === status);
    if (i >= 0) return i;
  }
  return items.length - 1;
}
