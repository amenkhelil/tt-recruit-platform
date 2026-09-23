from fastapi import APIRouter

from app.config import settings
from app.services.llm_service import check_ollama_connection

router = APIRouter()


@router.get("/health")
async def health_check():
    ollama_status = check_ollama_connection()
    return {
        "status": "ok",
        "llmProvider": settings.LLM_PROVIDER,
        "model": settings.LLM_MODEL,
        "ollamaStatus": ollama_status,
    }