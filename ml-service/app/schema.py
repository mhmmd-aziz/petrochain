"""
schema.py — Pydantic request/response schema untuk PetroChain ML Service.

Fitur input sesuai kolom sosial-ekonomi di tabel `warga` PostgreSQL.
Range nilai mengacu distribusi Susenas BPS Aceh (skala ordinal).

Sistem Kuota v2 — Dua Dimensi:
  Dimensi 1 (AI): Level kelayakan subsidi (1=Miskin Ekstrem, 2=Miskin, 3=Rentan Miskin)
  Dimensi 2 (Petugas): Kategori kendaraan & fungsi usaha
  
  Matriks Kuota:
    motor_pribadi   → 50 L/bln  (komuter, kendaraan swasta non-produktif)
    motor_produktif → 100 L/bln (ojek online, kurir, delivery)
    mobil_produktif → 350 L/bln (supir Grab/taksi online, angkot, UMKM mobil)
"""

from pydantic import BaseModel, Field, field_validator
from typing import Literal


# ---------------------------------------------------------------------------
# Peta kuota berbasis KATEGORI KENDARAAN & FUNGSI USAHA
# Sumber kebenaran tunggal — digunakan di schema dan model
# ---------------------------------------------------------------------------
VEHICLE_QUOTA_MAP: dict[str, int] = {
    "motor_pribadi":   50,   # L/bln — Motor komuter / swasta
    "motor_produktif": 100,  # L/bln — Ojek Online (Gojek/Grab Motor), kurir
    "mobil_produktif": 350,  # L/bln — Supir Grab Mobil, angkot, UMKM roda-4
}

VEHICLE_LABEL_MAP: dict[str, str] = {
    "motor_pribadi":   "Motor Pribadi (Komuter/Swasta)",
    "motor_produktif": "Motor Produktif (Ojek Online/Kurir)",
    "mobil_produktif": "Mobil Produktif (Grab/Angkot/UMKM)",
}

# Level subsidi (dari AI) → label kemiskinan
LEVEL_LABEL_MAP: dict[int, str] = {
    1: "Miskin Ekstrem",
    2: "Miskin",
    3: "Rentan Miskin",
}

# Legacy map — masih digunakan untuk anomaly description di logs
LEVEL_QUOTA_MAP: dict[int, int] = {1: 150, 2: 80, 3: 50}

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
    kategori_kendaraan: str = Field(
        default="motor_pribadi",
        description=(
            "Kategori kendaraan & fungsi usaha, diisi petugas verifikasi berdasarkan dokumen fisik. "
            "Nilai valid: motor_pribadi | motor_produktif | mobil_produktif"
        )
    )

    @field_validator("jml_tanggungan")
    @classmethod
    def tanggungan_reasonable(cls, v: int) -> int:
        # Anomaly check: tanggungan > 10 sangat jarang, log warning tapi tetap proses
        return v

    @field_validator("kategori_kendaraan")
    @classmethod
    def validate_kategori_kendaraan(cls, v: str) -> str:
        valid_values = set(VEHICLE_QUOTA_MAP.keys())
        if v not in valid_values:
            raise ValueError(
                f"kategori_kendaraan harus salah satu dari: {', '.join(sorted(valid_values))}. "
                f"Diterima: '{v}'"
            )
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "kondisi_rumah": 2,
                "sumber_listrik": 2,
                "kepemilikan_aset": 2,
                "pendidikan_kk": 3,
                "jml_tanggungan": 3,
                "jenis_pekerjaan": 5,
                "akses_air": 2,
                "kepemilikan_lahan": 1,
                "kategori_kendaraan": "motor_produktif"
            }
        }
    }


class PredictResponse(BaseModel):
    """Output prediksi level subsidi BBM warga."""

    level: Literal[1, 2, 3] = Field(
        ...,
        description="Level kelayakan subsidi dari AI: 1=miskin ekstrem, 2=miskin, 3=rentan miskin"
    )
    kategori_kendaraan: str = Field(
        ...,
        description="Kategori kendaraan yang digunakan untuk menghitung kuota"
    )
    kuota_liter: int = Field(
        ...,
        description=(
            "Kuota BBM bulanan (liter) berdasarkan kategori kendaraan: "
            "motor_pribadi=50, motor_produktif=100, mobil_produktif=350"
        )
    )
    confidence: float = Field(
        ...,
        ge=0.0, le=1.0,
        description="Tingkat kepercayaan prediksi AI (0.0-1.0)"
    )
    label_level: str = Field(
        ...,
        description="Label teks level kemiskinan (dari AI)"
    )
    label_kendaraan: str = Field(
        ...,
        description="Label teks kategori kendaraan"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "level": 3,
                "kategori_kendaraan": "motor_produktif",
                "kuota_liter": 100,
                "confidence": 0.88,
                "label_level": "Rentan Miskin",
                "label_kendaraan": "Motor Produktif (Ojek Online/Kurir)"
            }
        }
    }


class HealthResponse(BaseModel):
    """Response health check endpoint."""
    status: str
    model_loaded: bool
    model_type: str
