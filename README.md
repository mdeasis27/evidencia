# Evidencia

**Document Q&A with hybrid retrieval and citation verification.** Every claim must
cite a retrieved chunk, and every citation is mechanically checked for grounding
and lexical support before it reaches the reader. Runs fully offline in demo
mode.

> **Result:** Honest answers achieve **100% citation attribution** (every citation
> resolves to a retrieved chunk). A simulated hallucination that cites a chunk it
> never retrieved drops attribution to **75%** and is flagged by the verifier
> rather than shipped. Retrieval is hybrid BM25 + TF-IDF fused with reciprocal
> rank fusion over a 16-chunk fintech compliance corpus.

---

## Result

| Measure | Value |
|---|---|
| Attribution (honest) | **100%** (all citations grounded) |
| Attribution (simulated hallucination) | **75%** (1 of 4 citations ungrounded → flagged) |
| Corpus | 16 compliance chunks (credit, identity, fraud, limits) |
| Retrieval | hybrid BM25 + TF-IDF, RRF |

### What the guard catches

The demo has a "simulate hallucination" toggle. It appends a citation to a chunk
that was **not** in the retrieved set. The verifier marks it `grounded: false`
and the attribution rate drops — this is the mechanical control that stops a
claim whose source doesn't exist from shipping.

The verification is two-fold (see `lib/rag/citations.ts`):

1. **Grounding** — the cited chunk id must be in the retrieved set. Free, exact,
   catches fabricated citations.
2. **Lexical span support** — the claim's content words must appear in the cited
   chunk. A deterministic proxy; a production system swaps this for an NLI/LLM
   judge (see *Tradeoffs*).

---

## Architecture

```
lib/rag/
  retrievers.ts   # BM25, TF-IDF, reciprocal-rank fusion (deterministic)
  citations.ts    # extractCitationIds, attributionRate, spanSupport, verifyCitations
  answer.ts       # extractive answerer + a "hallucinating" variant for the demo
  demo.ts         # wires corpus + retrievers + answerer for the dashboard
  corpus.json     # 16 compliance chunks (committed)
  questions.json  # demo questions
backend/
  src/evidencia/citations.py   # canonical Python implementation
  tests/                       # pinned to the same cases as the TS tests
app/               # Next.js demo dashboard + landing (Vercel, demo mode)
```

## Design decisions & tradeoffs

1. **Two verification layers.** Grounding is exact and free but only proves the
   citation resolves; span support proves the claim is *lexically* in the chunk
   but cannot detect a well-phrased paraphrase of a wrong fact. That gap is the
   honest boundary of lexical verification — documented, not hidden.
2. **Same corpus as Veredicto.** The eval harness (Veredicto) and the system
   being evaluated (Evidencia) share one corpus, so the numbers are comparable
   across projects. A portfolio that references itself reads as a system.
3. **Math in two languages.** TS for the browser demo, Python for the
   authoritative backend — pinned by identical test cases in both suites.

## What did not work

- **The extractive answerer is not a real generator.** It returns lead sentences
  verbatim, so "attribution = 100%" is partly an artifact of extraction (it can
  only cite what it retrieved). The hallucination toggle exists precisely to
  prove the guard works when that assumption breaks.
- **Lexical span support over-rates numeric errors** — same limitation as the
  Veredicto judge. A wrong number phrased like the source passes span support;
  only an LLM judge (or schema check) catches it.

## Run it

```bash
pnpm install && pnpm dev      # http://localhost:3000
pnpm test                     # 10 vitest tests
cd backend && uv sync --extra dev && uv run pytest   # 5 tests
```

## Stack

Next.js 16 · TypeScript · Vitest · Tailwind v4 · Python 3.14 · pytest
