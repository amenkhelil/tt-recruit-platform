import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.models.schemas import MatchRequest, MatchResponse
from app.security import verify_api_key
from app.services.matching import score_match

logger = logging.getLogger("ai-service.routes.matching")

router = APIRouter()


@router.post(
    "/matching/score",
    response_model=MatchResponse,
    dependencies=[Depends(verify_api_key)],
)
async def compute_match_score(request: MatchRequest):
    try:
        # Run in a thread to avoid blocking the event loop during LLM calls
        return await asyncio.to_thread(score_match, request)
    except Exception as err:
        logger.error(f"Matching failed: {err}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI matching failed. Please try again.",
        )