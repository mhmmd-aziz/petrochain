"""
main.py — FastAPI application untuk PetroChain ML Microservice.

Hanya bisa diakses dari backend internal (Node.js).
Tidak expose ke publik internet.
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.model import load_model, predict, is_model_loaded, get_model_type
from app.schema import PredictRequest, PredictResponse, HealthResponse

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("petrochain.main")


# ---------------------------------------------------------------------------
# Lifespan — load model SEKALI saat startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model saat startup. Jika gagal, service tidak akan berjalan."""
    logger.info("PetroChain ML Service memulai startup...")
    try:
        load_model()
        logger.info("[OK] Startup selesai. Service siap menerima request.")
    except FileNotFoundError as e:
        logger.critical(f"[ERROR] STARTUP GAGAL: {e}")
        raise SystemExit(1)  # Hentikan service jika model tidak ada

    yield  # Application running

    logger.info("PetroChain ML Service shutdown.")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="PetroChain ML Service",
    description=(
        "Microservice prediksi level kelayakan subsidi BBM berbasis fitur "
        "sosial-ekonomi warga. Hanya dapat diakses dari backend internal."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",   # Disable di production: docs_url=None
    redoc_url="/redoc",
)

# CORS sangat ketat — hanya izinkan backend internal
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://backend:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


# ---------------------------------------------------------------------------
# Global error handler
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error"},
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Cek status service dan apakah model sudah dimuat."""
    return HealthResponse(
        status="ok" if is_model_loaded() else "degraded",
        model_loaded=is_model_loaded(),
        model_type=get_model_type(),
    )


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
async def predict_endpoint(req: PredictRequest):
    """
    Prediksi level kelayakan subsidi BBM dari fitur sosial-ekonomi warga.

    **Hanya dipanggil dari backend Node.js saat registrasi/update warga di Admin Panel.**
    Tidak dipanggil saat scan KTP di SPBU.
    """
    if not is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model belum siap. Service sedang dalam proses startup."
        )

    try:
        result = predict(req)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Prediksi gagal: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Prediksi gagal. Cek log service.")
