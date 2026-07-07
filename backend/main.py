"""
Tactive Savings Calculator — FastAPI Application

Entry point for the backend server.
Run with:  uvicorn main:app --reload
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db, close_db
from routes.calculate import router as calculate_router
from routes.report import router as report_router
from routes.leads import router as leads_router

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(name)-25s  %(levelname)-7s  %(message)s",
)
logger = logging.getLogger("tactive")


# ---------------------------------------------------------------------------
# Application lifespan (startup / shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise resources on startup and clean up on shutdown."""
    logger.info("Starting Tactive backend …")
    await init_db()
    logger.info("Database initialised.")
    yield
    logger.info("Shutting down Tactive backend …")
    await close_db()
    logger.info("Database connection closed.")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Tactive Savings Calculator API",
    description=(
        "API for the Tactive construction savings calculator. "
        "Estimates project losses, calculates Tactive recovery potential, "
        "generates PDF reports, and captures sales leads."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow all origins in development
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(calculate_router)
app.include_router(report_router)
app.include_router(leads_router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def health_check():
    """Basic health-check endpoint."""
    return {
        "status": "healthy",
        "service": "Tactive Savings Calculator API",
        "version": "1.0.0",
    }


@app.get("/api/health", tags=["Health"])
async def api_health():
    """API-level health check."""
    return {"status": "ok"}
