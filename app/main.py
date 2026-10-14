"""
Cognova Voice — Main FastAPI Application Entrypoint
Agentic AI Mentor for Personalized Learning & Career Readiness
Hackathon: VORTEX 2K26 (Theme 5: Deep Tech, Automation & Emerging Technology)
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import os

from app.core.config import settings
from app.database.init_db import init_database
from app.api.endpoints import router as api_router

# Initialize FastAPI App
app = FastAPI(
    title=settings.APP_NAME,
    description="Agentic AI Mentor for Personalized Learning & Career Readiness — VORTEX 2K26",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event: Ensure Directories & Initialize Seed Data
@app.on_event("startup")
def on_startup():
    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
    os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
    # Create SQLite tables and seed demo student Meghana
    try:
        init_database()
        print("[Startup] Cognova Voice DB Initialized & Demo Data Ready.")
    except Exception as e:
        print(f"[Startup Warning] Error initializing DB: {e}")

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

# Register API Router
app.include_router(api_router)

@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "project": "Cognova Voice",
        "tagline": "Speak. Learn. Improve. Grow.",
        "hackathon": "VORTEX 2K26 — Theme 5 (Deep Tech & Emerging Technology)",
        "version": "1.0.0",
        "agent_ecosystem": [
            "Orchestrator Agent",
            "Tutor Agent",
            "RAG Knowledge Agent",
            "Assessment Agent",
            "Performance Agent",
            "Adaptive Planner Agent",
            "Career Readiness Agent"
        ],
        "demo_mode": settings.DEMO_MODE_ENABLED
    }

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "llm_provider": settings.LLM_PROVIDER,
        "database": "sqlite_ready",
        "vector_store": "ready",
        "voice_stt": settings.STT_PROVIDER,
        "voice_tts": settings.TTS_PROVIDER,
        "timestamp": time.time()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
