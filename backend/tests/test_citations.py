from evidencia.citations import (
    attribution_rate,
    extract_citation_ids,
    span_support,
    ungrounded_citations,
    verify_citations,
)


def test_extract_citation_ids():
    text = "La tasa es 12% [c01] y el plazo [c02] y otra vez [c01]"
    assert extract_citation_ids(text) == ["c01", "c02"]


def test_ungrounded_citations():
    citations = [
        {"chunkId": "c01", "claim": "La tasa de mora es 12 por ciento."},
        {"chunkId": "c99", "claim": "El cliente vive en Marte."},
    ]
    ungrounded = ungrounded_citations(citations, ["c01", "c02"])
    assert [c["chunkId"] for c in ungrounded] == ["c99"]


def test_attribution_rate():
    citations = [
        {"chunkId": "c01", "claim": "x"},
        {"chunkId": "c99", "claim": "y"},
    ]
    assert attribution_rate(citations, ["c01", "c02"]) == 0.5
    assert attribution_rate([], ["c01"]) == 1.0


def test_span_support():
    source = "La tasa de interés de mora para créditos de consumo es del 12 por ciento anual."
    assert span_support("La tasa de mora es 12 por ciento.", source) > 0.5
    assert span_support("El cliente vive en Marte.", source) == 0.0


def test_verify_citations():
    source = "La tasa de interés de mora para créditos de consumo es del 12 por ciento anual."
    citations = [
        {"chunkId": "c01", "claim": "La tasa de mora es 12 por ciento."},
        {"chunkId": "c02", "claim": "El cliente vive en Marte."},
    ]
    verdicts = verify_citations(
        citations,
        ["c01"],
        {"c01": source, "c02": "El plazo máximo es de 60 meses."},
    )
    assert verdicts[0]["grounded"] is True and verdicts[0]["supported"] is True
    assert verdicts[1]["grounded"] is False and verdicts[1]["supported"] is False
