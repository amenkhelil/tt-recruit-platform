from datetime import date
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator

PROFICIENCY_MAP = {
    "native": "native",
    "natif": "native",
    "langue maternelle": "native",
    "mother tongue": "native",
    "fluent": "fluent",
    "courant": "fluent",
    "professional": "fluent",
    "professional level": "fluent",
    "proficient": "fluent",
    "advanced": "fluent",
    "avancé": "fluent",
    "c1": "fluent",
    "c2": "fluent",
    "conversational": "conversational",
    "intermediate": "conversational",
    "intermédiaire": "conversational",
    "b1": "conversational",
    "b2": "conversational",
    "basic": "basic",
    "beginner": "basic",
    "débutant": "basic",
    "elementary": "basic",
    "a1": "basic",
    "a2": "basic",
}

ProficiencyLevel = Literal["basic", "conversational", "fluent", "native"]


# ---------- Structures internes du CV (miroir exact des sous-documents Mongoose) ----------


class ExperienceItem(BaseModel):
    title: str
    company: str = ""
    startDate: Optional[date] = None
    endDate: Optional[date] = None
    isCurrent: bool = False
    description: str = ""


class EducationItem(BaseModel):
    degree: str
    institution: str = ""
    fieldOfStudy: str = ""
    startYear: Optional[int] = None
    endYear: Optional[int] = None


class CertificationItem(BaseModel):
    name: str
    issuer: str = ""
    date: Optional[str] = None

    @field_validator("date", mode="before")
    @classmethod
    def coerce_date(cls, v):
        if v is None:
            return None
        return str(v)


class LanguageItem(BaseModel):
    name: str
    proficiency: ProficiencyLevel = "conversational"

    @field_validator("proficiency", mode="before")
    @classmethod
    def normalize_proficiency(cls, v):
        if isinstance(v, str):
            normalized = PROFICIENCY_MAP.get(v.lower().strip())
            if normalized:
                return normalized
        # Fallback: si la valeur n'est pas reconnue, deviner à partir de mots-clés
        if isinstance(v, str):
            v_lower = v.lower()
            if any(kw in v_lower for kw in ["native", "natif", "maternelle"]):
                return "native"
            if any(kw in v_lower for kw in ["fluent", "courant", "professional", "advanced", "proficient"]):
                return "fluent"
            if any(kw in v_lower for kw in ["intermediate", "conversational", "intermédiaire"]):
                return "conversational"
            return "basic"
        return "conversational"


# ---------- Résultat brut retourné par le LLM (avant enrichissement déterministe) ----------


class LLMResumeExtraction(BaseModel):
    """Ce que le LLM doit produire. rawText n'est PAS demandé au LLM (on l'a déjà
    localement depuis PyMuPDF/python-docx) -> économise des tokens et évite
    qu'il le reformule/hallucine."""

    skills: List[str] = Field(default_factory=list)
    experiences: List[ExperienceItem] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    certifications: List[CertificationItem] = Field(default_factory=list)
    languages: List[LanguageItem] = Field(default_factory=list)
    yearsOfExperience: float = 0


# ---------- Réponse finale de POST /api/v1/resume/extract (contrat avec Node.js) ----------


class ResumeExtractionResponse(BaseModel):
    rawText: str
    skills: List[str]
    experiences: List[ExperienceItem]
    education: List[EducationItem]
    certifications: List[CertificationItem]
    languages: List[LanguageItem]
    yearsOfExperience: float


# ---------- Requête de POST /api/v1/matching/score (contrat avec Node.js) ----------
# Champs identiques à ce que application.controller.js envoie déjà - aucun changement
# de payload requis côté Node.


class MatchRequest(BaseModel):
    resumeText: str
    resumeSkills: List[str] = Field(default_factory=list)
    resumeYearsExperience: float = 0
    jobText: str
    requiredSkills: List[str] = Field(default_factory=list)
    experienceYearsMin: float = 0

    @field_validator("resumeText", "jobText")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("must not be empty")
        return v


# ---------- Réponse du LLM pour le matching sémantique (usage interne) ----------


class LLMMatchAssessment(BaseModel):
    semanticScore: float = Field(ge=0, le=100)
    contextMatchedSkills: List[str] = Field(default_factory=list)
    reasoning: str = ""


# ---------- Réponse finale de POST /api/v1/matching/score (contrat avec Node.js) ----------


class MatchResponse(BaseModel):
    semanticScore: float = Field(ge=0, le=100)
    skillScore: float = Field(ge=0, le=100)
    experienceScore: float = Field(ge=0, le=100)
    finalScore: float = Field(ge=0, le=100)
    matchedSkills: List[str]
    missingSkills: List[str]
    explanation: str
    modelVersion: str