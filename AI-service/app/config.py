import os
from pathlib import Path
from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path, override=True)


def _get_float(name: str, default: float) -> float:
    value = os.getenv(name)
    return float(value) if value else default


def _get_int(name: str, default: int) -> int:
    value = os.getenv(name)
    return int(value) if value else default


class Settings:
    AI_SERVICE_API_KEY: str = os.getenv("AI_SERVICE_API_KEY", "")

    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "ollama")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "qwen2.5:7b")
    LLM_TIMEOUT_SECONDS: int = _get_int("LLM_TIMEOUT_SECONDS", 120)

    SCORE_WEIGHT_SKILL: float = _get_float("SCORE_WEIGHT_SKILL", 0.45)
    SCORE_WEIGHT_SEMANTIC: float = _get_float("SCORE_WEIGHT_SEMANTIC", 0.35)
    SCORE_WEIGHT_EXPERIENCE: float = _get_float("SCORE_WEIGHT_EXPERIENCE", 0.20)

    MAX_FILE_SIZE_MB: int = _get_int("MAX_FILE_SIZE_MB", 5)

    MODEL_VERSION: str = os.getenv("MODEL_VERSION", "v1.0-ollama-qwen2.5")

    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")


settings = Settings()

# Validation au démarrage : les poids doivent sommer à 1.0 (tolérance d'arrondi)
_weight_sum = (
    settings.SCORE_WEIGHT_SKILL + settings.SCORE_WEIGHT_SEMANTIC + settings.SCORE_WEIGHT_EXPERIENCE
)
if abs(_weight_sum - 1.0) > 0.01:
    raise ValueError(
        f"SCORE_WEIGHT_* must sum to 1.0, got {_weight_sum} "
        f"(skill={settings.SCORE_WEIGHT_SKILL}, semantic={settings.SCORE_WEIGHT_SEMANTIC}, "
        f"experience={settings.SCORE_WEIGHT_EXPERIENCE})"
    )