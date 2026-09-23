from datetime import date
from typing import List, Optional, Tuple

# Table d'alias minimale : normalise les variantes d'écriture les plus courantes.
# Ce n'est PAS la source de vérité des compétences (le LLM en détecte librement) —
# ça sert uniquement à éviter que "Node" et "Node.js" soient traités comme deux
# compétences différentes lors de la comparaison CV <-> offre.
SKILL_ALIASES = {
    "node": "node.js",
    "nodejs": "node.js",
    "node.js": "node.js",
    "js": "javascript",
    "javascript": "javascript",
    "ts": "typescript",
    "typescript": "typescript",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "mongo": "mongodb",
    "mongodb": "mongodb",
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
    "continuous integration / continuous deployment": "ci/cd",
    "continuous integration": "ci/cd",
    "k8s": "kubernetes",
    "kubernetes": "kubernetes",
    "reactjs": "react",
    "react.js": "react",
    "react": "react",
}


def normalize_skill(raw: str) -> str:
    """Ramène une compétence à une forme canonique pour la comparaison."""
    cleaned = raw.strip().lower()
    return SKILL_ALIASES.get(cleaned, cleaned)


def normalize_skill_set(skills: List[str]) -> set:
    return {normalize_skill(s) for s in skills if s and s.strip()}


def compute_years_from_experiences(
    date_ranges: List[Tuple[Optional[date], Optional[date]]]
) -> Optional[float]:
    """
    Calcule le nombre total d'années d'expérience à partir d'intervalles de dates,
    en fusionnant les périodes qui se chevauchent (évite de compter deux fois une
    période où plusieurs expériences se recoupent).

    Retourne None si aucune date exploitable n'est disponible (dans ce cas,
    l'appelant doit se rabattre sur l'estimation du LLM).
    """
    resolved = [(start, end or date.today()) for start, end in date_ranges if start is not None]
    if not resolved:
        return None

    resolved.sort(key=lambda r: r[0])
    merged = [resolved[0]]

    for start, end in resolved[1:]:
        last_start, last_end = merged[-1]
        if start <= last_end:
            merged[-1] = (last_start, max(last_end, end))
        else:
            merged.append((start, end))

    total_days = sum((end - start).days for start, end in merged)
    return round(total_days / 365.25, 1)