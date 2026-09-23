from fastapi import Header, HTTPException, status
from app.config import settings


async def verify_api_key(x_api_key: str = Header(None)) -> None:
    """
    Dependency FastAPI à ajouter sur chaque route sensible.
    Compare le header X-API-Key à AI_SERVICE_API_KEY (partagé avec le backend Node).
    """
    if not settings.AI_SERVICE_API_KEY:
        # Mauvaise configuration serveur : mieux vaut bloquer que laisser un service ouvert
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI_SERVICE_API_KEY is not configured on the server",
        )

    if not x_api_key or x_api_key != settings.AI_SERVICE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key",
        )