"""Citation verification — mirrors lib/rag/citations.ts."""

from __future__ import annotations

import re
import unicodedata
from typing import Sequence

CITATION_RE = re.compile(r"\[(c\d{2})\]")

STOP = {
    "de", "la", "el", "los", "las", "un", "una", "unos", "unas",
    "es", "son", "por", "para", "con", "en", "y", "o", "a", "al",
    "del", "se", "que", "no", "su", "sus", "lo", "este", "esta",
}


def extract_citation_ids(answer: str) -> list[str]:
    return list(dict.fromkeys(CITATION_RE.findall(answer)))


def is_grounded(chunk_id: str, retrieved: Sequence[str]) -> bool:
    return chunk_id in retrieved


def ungrounded_citations(citations: Sequence[dict], retrieved: Sequence[str]) -> list[dict]:
    return [c for c in citations if c["chunkId"] not in retrieved]


def attribution_rate(citations: Sequence[dict], retrieved: Sequence[str]) -> float:
    if not citations:
        return 1.0
    grounded = sum(1 for c in citations if c["chunkId"] in retrieved)
    return grounded / len(citations)


def _tokens(text: str) -> list[str]:
    folded = "".join(
        c for c in unicodedata.normalize("NFD", text.lower()) if not unicodedata.combining(c)
    )
    return [t for t in re.split(r"[^a-z0-9]+", folded) if t and t not in STOP]


def span_support(claim: str, chunk_text: str) -> float:
    claim_tokens = set(_tokens(claim))
    if not claim_tokens:
        return 0.0
    chunk_tokens = set(_tokens(chunk_text))
    supported = sum(1 for t in claim_tokens if t in chunk_tokens)
    return supported / len(claim_tokens)


def verify_citations(
    citations: Sequence[dict],
    retrieved: Sequence[str],
    chunk_text: dict,
    support_threshold: float = 0.3,
) -> list[dict]:
    verdicts = []
    for c in citations:
        support = span_support(c["claim"], chunk_text.get(c["chunkId"], ""))
        verdicts.append(
            {
                "chunkId": c["chunkId"],
                "grounded": c["chunkId"] in retrieved,
                "supported": support >= support_threshold,
                "support": support,
            }
        )
    return verdicts
