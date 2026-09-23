import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes import health, resume, matching

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="TT Recruit AI Service",
    description="Microservice d'extraction de CV et de matching CV/offre par LLM",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(resume.router, prefix="/api/v1", tags=["resume"])
app.include_router(matching.router, prefix="/api/v1", tags=["matching"])


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    logging.getLogger("ai-service").error(f"Unhandled error: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})