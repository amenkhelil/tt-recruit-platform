import json
import logging
import re

import httpx
import ollama

from app.config import settings
from app.models.schemas import LLMResumeExtraction, LLMMatchAssessment

logger = logging.getLogger("ai-service.llm")

# ── Ollama client (single instance, configured from .env) ──────────────────
_client = ollama.Client(
    host=settings.OLLAMA_BASE_URL,
    timeout=httpx.Timeout(timeout=settings.LLM_TIMEOUT_SECONDS),
)


def _strip_think_blocks(text: str) -> str:
    """Supprime les blocs <think>...</think> que Qwen3 ajoute parfois
    avant de produire sa réponse JSON."""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


def _extract_json(text: str) -> dict:
    """Extrait un objet JSON depuis la réponse du LLM.
    Tente d'abord un json.loads direct, puis cherche le premier bloc {...}."""
    cleaned = _strip_think_blocks(text)
    if not cleaned:
        raise ValueError("LLM returned an empty response")

    # Tentative directe
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Extraction du premier objet JSON {...} dans la réponse
    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        return json.loads(match.group())

    raise json.JSONDecodeError("No JSON object found in LLM response", cleaned, 0)


def _call_llm_json(system_prompt: str, user_prompt: str, max_retries: int = 2) -> dict:
    """Appelle Ollama en mode JSON structuré, avec retry si la réponse
    n'est pas un JSON valide ou si un timeout se produit.
    Les erreurs de connexion et de modèle ne sont PAS retentées (inutile)."""
    last_error = None

    for attempt in range(max_retries):
        try:
            response = _client.chat(
                model=settings.LLM_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                format="json",
                options={
                    "temperature": 0,
                    "num_ctx": 8192,
                },
            )
            content = response["message"]["content"]
            return _extract_json(content)

        except json.JSONDecodeError as err:
            last_error = err
            logger.warning(f"LLM returned invalid JSON (attempt {attempt + 1}/{max_retries}): {err}")

        except ollama.ResponseError as err:
            # Erreur Ollama : modèle absent, erreur de configuration, etc.
            # Pas de retry — le problème ne se résoudra pas seul.
            raise RuntimeError(
                f"Ollama error: {err}. "
                f"Make sure the model '{settings.LLM_MODEL}' is pulled (ollama pull {settings.LLM_MODEL})"
            ) from err

        except httpx.ConnectError as err:
            # Ollama n'est pas en cours d'exécution — pas de retry.
            raise RuntimeError(
                f"Cannot connect to Ollama at {settings.OLLAMA_BASE_URL}. "
                "Make sure Ollama is running (ollama serve)"
            ) from err

        except httpx.ReadTimeout as err:
            last_error = err
            logger.warning(f"LLM call timed out (attempt {attempt + 1}/{max_retries})")

        except Exception as err:
            # Couvre les autres erreurs réseau inattendues
            raise RuntimeError(f"Unexpected LLM error: {err}") from err

    raise RuntimeError(f"LLM call failed after {max_retries} attempts: {last_error}")


RESUME_EXTRACTION_SYSTEM_PROMPT = """Tu es un système d'extraction d'informations de CV. Le CV peut être en français ou en anglais, et les intitulés de section varient (ex: "Expérience professionnelle", "Work history", "Parcours", "Projets", "Career", etc.). Tu dois comprendre le CONTENU, pas seulement des mots-clés de section.

Règles :
- Une expérience professionnelle ou un stage doit être identifié à partir du contexte (rôle + entreprise + description), même si aucune section ne s'appelle "Expérience".
- Détecte TOUTES les compétences techniques et fonctionnelles mentionnées, y compris implicitement dans des descriptions de projets ou d'expériences (ex: "Developed REST APIs using Node.js" implique les compétences "Node.js" et "REST API").
- N'invente rien. Si une information n'est pas présente ou pas claire, laisse le champ vide ou null plutôt que de deviner.
- Pour yearsOfExperience, estime le nombre total d'années d'expérience PROFESSIONNELLE (hors stages courts si le CV est junior, à ton jugement), en te basant sur les dates disponibles.
- Les dates doivent être au format ISO "YYYY-MM-DD". Si seul le mois/année est connu, utilise le premier jour du mois. Si une expérience est en cours, mets isCurrent=true et endDate=null.

Réponds UNIQUEMENT avec un objet JSON valide respectant exactement ce schéma :
{
  "skills": ["string"],
  "experiences": [{"title": "string", "company": "string", "startDate": "YYYY-MM-DD ou null", "endDate": "YYYY-MM-DD ou null", "isCurrent": bool, "description": "string"}],
  "education": [{"degree": "string", "institution": "string", "fieldOfStudy": "string", "startYear": int ou null, "endYear": int ou null}],
  "certifications": [{"name": "string", "issuer": "string", "date": "YYYY-MM-DD ou null"}],
  "languages": [{"name": "string", "proficiency": "basic|conversational|fluent|native"}],
  "yearsOfExperience": number
}"""

MATCHING_SYSTEM_PROMPT = """Tu es un système d'évaluation de correspondance entre un CV et une offre d'emploi. Tu dois juger la pertinence SÉMANTIQUE du profil pour le poste, au-delà d'une simple comparaison de mots-clés.

Exemple : si le CV dit "Developed REST APIs using Node.js and Express" et l'offre demande "Backend development with JavaScript server-side frameworks", cela DOIT être reconnu comme une forte correspondance même si les mots exacts diffèrent.

Règles :
- semanticScore (0 à 100) : à quel point l'expérience et le profil du candidat correspondent globalement au poste (mission, responsabilités, contexte), indépendamment de la liste de compétences.
- contextMatchedSkills : compétences ou technologies que tu identifies dans le CV comme pertinentes pour ce poste, même si elles ne sont pas listées explicitement comme "compétences" (déduites du contexte des expériences/projets).
- reasoning : 2-3 phrases expliquant ton évaluation, en français, utilisables telles quelles pour un recruteur.

Réponds UNIQUEMENT avec un objet JSON valide respectant exactement ce schéma :
{
  "semanticScore": number,
  "contextMatchedSkills": ["string"],
  "reasoning": "string"
}"""


def extract_resume_structured(resume_text: str) -> LLMResumeExtraction:
    """Envoie le texte brut du CV au LLM et retourne la structure validée."""
    truncated_text = resume_text[:12000]

    raw_result = _call_llm_json(
        RESUME_EXTRACTION_SYSTEM_PROMPT,
        f"Voici le texte du CV à analyser :\n\n{truncated_text}",
    )
    return LLMResumeExtraction.model_validate(raw_result)


def semantic_match(resume_text: str, job_text: str) -> LLMMatchAssessment:
    """Demande au LLM d'évaluer la correspondance sémantique CV <-> offre."""
    truncated_resume = resume_text[:6000]
    truncated_job = job_text[:4000]

    user_prompt = (
        f"CV DU CANDIDAT :\n{truncated_resume}\n\n"
        f"OFFRE D'EMPLOI :\n{truncated_job}"
    )
    raw_result = _call_llm_json(MATCHING_SYSTEM_PROMPT, user_prompt)
    return LLMMatchAssessment.model_validate(raw_result)


def check_ollama_connection() -> dict:
    """Vérifie que Ollama est joignable et que le modèle est disponible.
    Retourne un dict avec le statut pour le health check."""
    try:
        models = _client.list()
        model_names = [m.model for m in models.models] if models.models else []
        model_found = any(settings.LLM_MODEL in name for name in model_names)
        return {
            "status": "connected",
            "model": settings.LLM_MODEL,
            "modelAvailable": model_found,
            "availableModels": model_names,
        }
    except httpx.ConnectError:
        return {"status": "unreachable", "error": f"Cannot connect to Ollama at {settings.OLLAMA_BASE_URL}"}
    except Exception as err:
        return {"status": "error", "error": str(err)}