"""
model.py — Load & predict XGBoost model untuk PetroChain ML Service.

Model di-load SEKALI saat startup FastAPI.
Jangan pernah load ulang model di dalam request handler.
"""

import os
import logging
import numpy as np
import joblib
from pathlib import Path
from typing import Optional

from app.schema import (
    PredictRequest,
    PredictResponse,
    LEVEL_QUOTA_MAP,
    LEVEL_LABEL_MAP,
    VEHICLE_QUOTA_MAP,
    VEHICLE_LABEL_MAP,
    FEATURE_ORDER,
)

logger = logging.getLogger("petrochain.model")


# ---------------------------------------------------------------------------
# Feature Engineering — HARUS IDENTIK dengan training_v2.py
# ---------------------------------------------------------------------------
def _compute_engineered_features(X_base: np.ndarray) -> np.ndarray:
    """
    Tambahkan 5 fitur turunan dari 8 fitur dasar.

    Input X_base kolom (index):
        0: kondisi_rumah (1-5)
        1: sumber_listrik (1-4)
        2: kepemilikan_aset (1-4)
        3: pendidikan_kk (1-6)
        4: jml_tanggungan (0-12)
        5: jenis_pekerjaan (1-6)
        6: akses_air (1-4)
        7: kepemilikan_lahan (1-3)

    Output: X_base + 5 kolom baru (total 13 kolom)
    """
    kondisi_rumah     = X_base[:, 0]
    sumber_listrik    = X_base[:, 1]
    kepemilikan_aset  = X_base[:, 2]
    pendidikan_kk     = X_base[:, 3]
    jml_tanggungan    = X_base[:, 4]
    jenis_pekerjaan   = X_base[:, 5]
    akses_air         = X_base[:, 6]
    kepemilikan_lahan = X_base[:, 7]

    # 1. Skor kerentanan (weighted sum — semakin tinggi = semakin baik)
    skor_kerentanan = (
        kondisi_rumah * 2.0 +
        sumber_listrik * 1.5 +
        kepemilikan_aset * 2.5 +
        pendidikan_kk * 1.0 +
        jenis_pekerjaan * 2.0 +
        akses_air * 1.5 +
        kepemilikan_lahan * 2.0 -
        jml_tanggungan * 1.5
    )

    # 2. Rasio tanggungan terhadap aset
    rasio_tanggungan_aset = jml_tanggungan / (kepemilikan_aset + kepemilikan_lahan + 0.5)

    # 3. Skor infrastruktur
    skor_infrastruktur = sumber_listrik + akses_air

    # 4. Skor ekonomi
    skor_ekonomi = jenis_pekerjaan + kepemilikan_aset + kepemilikan_lahan

    # 5. Interaksi pendidikan × pekerjaan
    interaksi_pend_kerja = pendidikan_kk * jenis_pekerjaan

    # Stack semua fitur
    engineered = np.column_stack([
        skor_kerentanan,
        rasio_tanggungan_aset,
        skor_infrastruktur,
        skor_ekonomi,
        interaksi_pend_kerja,
    ])

    return np.hstack([X_base, engineered])



# ---------------------------------------------------------------------------
# Global model holder — di-set saat startup, read-only saat serving
# ---------------------------------------------------------------------------
_model = None
_model_type: str = "unknown"


def load_model() -> None:
    """
    Load model dari path di environment variable MODEL_PATH.
    Dipanggil SEKALI saat startup FastAPI via lifespan context.
    Raise FileNotFoundError jika file tidak ada agar service tidak berjalan tanpa model.
    """
    global _model, _model_type

    model_path = Path(os.getenv("MODEL_PATH", "./models/petrochain_model.pkl"))

    if not model_path.exists():
        raise FileNotFoundError(
            f"Model file tidak ditemukan: {model_path.resolve()}. "
            "Jalankan notebook training terlebih dahulu untuk menghasilkan file .pkl"
        )

    _model = joblib.load(model_path)
    _model_type = type(_model).__name__
    logger.info(f"Model berhasil dimuat: {_model_type} dari {model_path}")


def is_model_loaded() -> bool:
    return _model is not None


def get_model_type() -> str:
    return _model_type


# ---------------------------------------------------------------------------
# Anomaly check — validasi multi-sumber sebelum predict
# ---------------------------------------------------------------------------
def _validate_input_anomaly(req: PredictRequest) -> Optional[str]:
    """
    Deteksi kombinasi fitur yang secara logika tidak konsisten.
    Return pesan warning jika ada anomali, None jika bersih.

    Ini bukan penolakan — data tetap diproses, tapi anomali dicatat.
    """
    warnings = []

    # Tanggungan sangat besar tapi kondisi rumah sangat baik → patut dicek
    if req.jml_tanggungan >= 8 and req.kondisi_rumah >= 4:
        warnings.append("Tanggungan sangat besar tapi kondisi rumah sangat baik")

    # Tidak bekerja tapi kepemilikan aset banyak → patut dicek
    if req.jenis_pekerjaan == 1 and req.kepemilikan_aset >= 3:
        warnings.append("Tidak bekerja tapi kepemilikan aset tinggi")

    # Pendidikan S1+ tapi tidak bekerja dan tidak punya aset
    if req.pendidikan_kk >= 6 and req.jenis_pekerjaan == 1 and req.kepemilikan_aset == 1:
        warnings.append("Pendidikan S1+ tapi tidak bekerja dan tidak punya aset")

    return "; ".join(warnings) if warnings else None


# ---------------------------------------------------------------------------
# Predict
# ---------------------------------------------------------------------------
def predict(req: PredictRequest) -> PredictResponse:
    """
    Jalankan prediksi level subsidi dari fitur sosial-ekonomi warga.

    Sistem kuota v2 — dua dimensi:
      - Level subsidi (1/2/3) diprediksi AI dari fitur sosio-ekonomi
        → menentukan KELAYAKAN mendapat subsidi
      - Kategori kendaraan diverifikasi petugas berdasarkan dokumen fisik
        → menentukan BERAPA LITER kuota per bulan

    Raises:
        RuntimeError: Jika model belum di-load.
    """
    if _model is None:
        raise RuntimeError("Model belum dimuat. Tunggu startup selesai.")

    # Anomaly check — log warning tapi jangan tolak request
    anomaly = _validate_input_anomaly(req)
    if anomaly:
        logger.warning(f"Anomaly terdeteksi pada input: {anomaly}")

    # Susun fitur DASAR dalam urutan yang sama persis saat training
    base_features = np.array([[getattr(req, f) for f in FEATURE_ORDER]], dtype=float)

    # Hitung fitur turunan (HARUS identik dengan training_v2.py)
    features = _compute_engineered_features(base_features)

    # Predict level kemiskinan (kelayakan subsidi)
    predicted_level: int = int(_model.predict(features)[0])

    # Ambil confidence dari probabilitas kelas yang diprediksi
    if hasattr(_model, "predict_proba"):
        proba = _model.predict_proba(features)[0]
        # XGBoost/sklearn: class index dimulai dari 0, label kita 1-3
        class_index = predicted_level - 1
        confidence = float(proba[class_index])
    else:
        # Fallback jika model tidak support predict_proba
        confidence = 1.0

    # Kuota dari kategori kendaraan — BUKAN dari level kemiskinan
    kategori = req.kategori_kendaraan
    kuota_liter = VEHICLE_QUOTA_MAP[kategori]

    logger.info(
        f"Prediksi: level={predicted_level} ({LEVEL_LABEL_MAP[predicted_level]}), "
        f"confidence={confidence:.3f}, "
        f"kategori={kategori}, "
        f"kuota={kuota_liter} L/bln"
    )

    return PredictResponse(
        level=predicted_level,
        kategori_kendaraan=kategori,
        kuota_liter=kuota_liter,
        confidence=round(confidence, 4),
        label_level=LEVEL_LABEL_MAP[predicted_level],
        label_kendaraan=VEHICLE_LABEL_MAP[kategori],
    )

