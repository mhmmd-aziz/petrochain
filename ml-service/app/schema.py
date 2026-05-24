"""
schema.py — Pydantic request/response schema untuk PetroChain ML Service.

Fitur input sesuai kolom sosial-ekonomi di tabel `warga` PostgreSQL.
Range nilai mengacu distribusi Susenas BPS Aceh (skala ordinal).
"""

from pydantic import BaseModel, Field, field_validator
from typing import Literal


class PredictRequest(BaseModel):
    """Input fitur sosial-ekonomi warga untuk prediksi level subsidi."""

    kondisi_rumah: int = Field(
        ...,
        ge=1, le=5,
        description="Kondisi fisik rumah: 1=sangat buruk, 5=sangat baik"
    )
    sumber_listrik: int = Field(
        ...,
        ge=1, le=4,
        description="1=tidak ada listrik, 2=genset/solar, 3=PLN prasejahtera, 4=PLN normal"
    )
    kepemilikan_aset: int = Field(
        ...,
        ge=1, le=4,
        description="Jumlah aset produktif: 1=tidak ada, 2=1 aset, 3=2 aset, 4=3+ aset"
    )
    pendidikan_kk: int = Field(
        ...,
        ge=1, le=6,
        description="Pendidikan kepala keluarga: 1=tidak sekolah, 2=SD, 3=SMP, 4=SMA, 5=D3, 6=S1+"
    )
    jml_tanggungan: int = Field(
        ...,
        ge=0, le=12,
        description="Jumlah anggota keluarga tanggungan"
    )
    jenis_pekerjaan: int = Field(
        ...,
        ge=1, le=6,
        description="1=tidak bekerja, 2=buruh harian, 3=nelayan/petani, 4=pedagang kecil, 5=ojek/transportasi, 6=karyawan tetap"
    )
    akses_air: int = Field(
        ...,
        ge=1, le=4,
        description="Akses air bersih: 1=tidak ada, 2=sumur gali, 3=sumur bor, 4=PDAM"
    )
    kepemilikan_lahan: int = Field(
        ...,
        ge=1, le=3,
        description="Status kepemilikan lahan: 1=tidak punya, 2=sewa/kontrak, 3=milik sendiri"
    )

    @field_validator("jml_tanggungan")
    @classmethod
    def tanggungan_reasonable(cls, v: int) -> int:
        # Anomaly check: tanggungan > 10 sangat jarang, log warning tapi tetap proses
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "kondisi_rumah": 2,
                "sumber_listrik": 1,
                "kepemilikan_aset": 1,
                "pendidikan_kk": 2,
                "jml_tanggungan": 4,
                "jenis_pekerjaan": 1,
                "akses_air": 2,
                "kepemilikan_lahan": 1
            }
        }
    }


class PredictResponse(BaseModel):
    """Output prediksi level subsidi BBM warga."""

    level: Literal[1, 2, 3] = Field(
        ...,
        description="Level kelayakan subsidi: 1=miskin ekstrem, 2=miskin, 3=rentan miskin"
    )
    kuota_liter: Literal[150, 80, 50] = Field(
        ...,
        description="Kuota BBM bulanan dalam liter sesuai level"
    )
    confidence: float = Field(
        ...,
        ge=0.0, le=1.0,
        description="Tingkat kepercayaan prediksi model (0.0–1.0)"
    )
    label: str = Field(
        ...,
        description="Label teks level subsidi"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "level": 1,
                "kuota_liter": 150,
                "confidence": 0.91,
                "label": "Miskin Ekstrem"
            }
        }
    }


class HealthResponse(BaseModel):
    """Response health check endpoint."""
    status: str
    model_loaded: bool
    model_type: str


# Mapping level → kuota dan label (sumber kebenaran tunggal)
LEVEL_QUOTA_MAP: dict[int, int] = {1: 150, 2: 80, 3: 50}
LEVEL_LABEL_MAP: dict[int, str] = {
    1: "Miskin Ekstrem",
    2: "Miskin",
    3: "Rentan Miskin"
}

FEATURE_ORDER = [
    "kondisi_rumah",
    "sumber_listrik",
    "kepemilikan_aset",
    "pendidikan_kk",
    "jml_tanggungan",
    "jenis_pekerjaan",
    "akses_air",
    "kepemilikan_lahan",
]
