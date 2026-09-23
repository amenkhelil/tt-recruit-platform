from app.config import settings
from app.models.schemas import MatchRequest, MatchResponse
from app.services import llm_service
from app.utils import normalize_skill, normalize_skill_set


def compute_skill_score(required_skills: list, candidate_skills: set) -> tuple:
    """
    Compare les compétences requises par l'offre aux compétences du candidat
    (CV + compétences identifiées par le LLM dans le contexte des expériences).
    Retourne (score 0-100, matchedSkills, missingSkills) en gardant les libellés
    originaux (non normalisés) pour l'affichage au recruteur.
    """
    if not required_skills:
        # Aucune compétence requise définie sur l'offre -> le critère ne pénalise pas
        return 100.0, [], []

    matched, missing = [], []
    for skill in required_skills:
        if normalize_skill(skill) in candidate_skills:
            matched.append(skill)
        else:
            missing.append(skill)

    score = (len(matched) / len(required_skills)) * 100
    return round(score, 1), matched, missing


def compute_experience_score(candidate_years: float, required_years: float) -> float:
    """
    Score déterministe basé sur le ratio années candidat / années requises.
    - Si aucune expérience minimale n'est requise -> score plein.
    - Le score plafonne à 100 dès que le candidat atteint le minimum requis
      (plus d'expérience que demandé n'augmente pas artificiellement le score).
    """
    if required_years <= 0:
        return 100.0
    ratio = candidate_years / required_years
    return round(min(ratio, 1.0) * 100, 1)


def compute_final_score(skill_score: float, semantic_score: float, experience_score: float) -> float:
    final = (
        skill_score * settings.SCORE_WEIGHT_SKILL
        + semantic_score * settings.SCORE_WEIGHT_SEMANTIC
        + experience_score * settings.SCORE_WEIGHT_EXPERIENCE
    )
    return round(min(max(final, 0), 100), 1)


def build_explanation(
    skill_score: float,
    matched: list,
    missing: list,
    semantic_score: float,
    experience_score: float,
    candidate_years: float,
    required_years: float,
    llm_reasoning: str,
) -> str:
    parts = [
        f"Compétences : {len(matched)}/{len(matched) + len(missing)} compétences requises "
        f"identifiées ({skill_score}%).",
        f"Pertinence du profil pour le poste : {semantic_score}%.",
        f"Expérience : {candidate_years} an(s) pour {required_years} an(s) requis ({experience_score}%).",
    ]
    if llm_reasoning:
        parts.append(llm_reasoning)
    return " ".join(parts)


def score_match(request: MatchRequest) -> MatchResponse:
    llm_assessment = llm_service.semantic_match(request.resumeText, request.jobText)

    # Les compétences du candidat = celles déclarées dans son CV structuré
    # + celles que le LLM a identifiées dans le contexte des expériences/projets.
    candidate_skills = normalize_skill_set(request.resumeSkills) | normalize_skill_set(
        llm_assessment.contextMatchedSkills
    )

    skill_score, matched_skills, missing_skills = compute_skill_score(
        request.requiredSkills, candidate_skills
    )
    experience_score = compute_experience_score(
        request.resumeYearsExperience, request.experienceYearsMin
    )
    final_score = compute_final_score(skill_score, llm_assessment.semanticScore, experience_score)

    explanation = build_explanation(
        skill_score,
        matched_skills,
        missing_skills,
        llm_assessment.semanticScore,
        experience_score,
        request.resumeYearsExperience,
        request.experienceYearsMin,
        llm_assessment.reasoning,
    )

    return MatchResponse(
        semanticScore=llm_assessment.semanticScore,
        skillScore=skill_score,
        experienceScore=experience_score,
        finalScore=final_score,
        matchedSkills=matched_skills,
        missingSkills=missing_skills,
        explanation=explanation,
        modelVersion=settings.MODEL_VERSION,
    )