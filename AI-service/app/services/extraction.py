import io
import logging
import zipfile
import xml.etree.ElementTree as ET

import fitz  # PyMuPDF
from docx import Document

from app.models.schemas import ResumeExtractionResponse
from app.services import llm_service
from app.utils import compute_years_from_experiences

logger = logging.getLogger("ai-service.extraction")

SUPPORTED_CONTENT_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.oasis.opendocument.text": "odt",
}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text_parts = []
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n".join(text_parts).strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    document = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in document.paragraphs if p.text.strip()]
    return "\n".join(paragraphs).strip()


def extract_text_from_odt(file_bytes: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(file_bytes)) as archive:
      try:
          content = archive.read("content.xml")
      except KeyError as exc:
          raise ValueError("Invalid ODT file: content.xml is missing") from exc

    root = ET.fromstring(content)
    paragraphs = []
    for element in root.iter():
        tag = element.tag.rsplit("}", 1)[-1]
        if tag in {"p", "h"}:
            text = "".join(element.itertext()).strip()
            if text:
                paragraphs.append(text)

    return "\n".join(paragraphs).strip()


def extract_raw_text(file_bytes: bytes, content_type: str) -> str:
    file_type = SUPPORTED_CONTENT_TYPES.get(content_type)
    if file_type == "pdf":
        return extract_text_from_pdf(file_bytes)
    if file_type == "docx":
        return extract_text_from_docx(file_bytes)
    if file_type == "odt":
        return extract_text_from_odt(file_bytes)
    raise ValueError(f"Unsupported content type: {content_type}")


def process_resume(file_bytes: bytes, content_type: str) -> ResumeExtractionResponse:
    """
    Pipeline complet : bytes du fichier -> texte brut -> structuration LLM ->
    réponse validée prête à être renvoyée à Node.js.
    """
    raw_text = extract_raw_text(file_bytes, content_type)

    if not raw_text or len(raw_text.strip()) < 30:
        raise ValueError(
            "Could not extract meaningful text from the file. "
            "It may be a scanned/image-based document (OCR not supported in this version)."
        )

    llm_result = llm_service.extract_resume_structured(raw_text)

    # Recalcul déterministe des années d'expérience à partir des dates résolues,
    # utilisé comme correction si suffisamment de dates sont exploitables -
    # plus fiable qu'une estimation purement LLM.
    date_ranges = [(exp.startDate, exp.endDate) for exp in llm_result.experiences]
    computed_years = compute_years_from_experiences(date_ranges)

    resolved_dates_count = sum(1 for start, _ in date_ranges if start is not None)
    years_of_experience = llm_result.yearsOfExperience
    if computed_years is not None and resolved_dates_count >= max(1, len(date_ranges) // 2):
        years_of_experience = computed_years

    return ResumeExtractionResponse(
        rawText=raw_text,
        skills=llm_result.skills,
        experiences=llm_result.experiences,
        education=llm_result.education,
        certifications=llm_result.certifications,
        languages=llm_result.languages,
        yearsOfExperience=years_of_experience,
    )
