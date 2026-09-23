import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.config import settings
from app.models.schemas import ResumeExtractionResponse
from app.security import verify_api_key
from app.services.extraction import SUPPORTED_CONTENT_TYPES, process_resume

logger = logging.getLogger("ai-service.routes.resume")

router = APIRouter()


@router.post(
    "/resume/extract",
    response_model=ResumeExtractionResponse,
    dependencies=[Depends(verify_api_key)],
)
async def extract_resume(file: UploadFile = File(...)):
    if file.content_type not in SUPPORTED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Only PDF, DOCX and ODT are supported.",
        )

    file_bytes = await file.read()

    max_size_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size of {settings.MAX_FILE_SIZE_MB}MB",
        )

    try:
        return process_resume(file_bytes, file.content_type)
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))
    except Exception as err:
        logger.error(f"Resume extraction failed: {err}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI extraction failed. Please try again.",
        )
