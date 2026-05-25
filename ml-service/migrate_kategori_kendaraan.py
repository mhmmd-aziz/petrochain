"""
migrate_kategori_kendaraan.py
═══════════════════════════════════════════════════════════════
Script migrasi untuk menambah kolom `kategori_kendaraan` ke
tabel warga yang sudah ada di PostgreSQL.

JALANKAN SEKALI setelah deploy perubahan schema Prisma.

Strategi migrasi data existing:
  - Warga dengan jenis_pekerjaan = 5 (ojek/transportasi) + kepemilikan_aset >= 2
    → Heuristik: motor_produktif (100 L)
  - Warga lainnya
    → Default: motor_pribadi (50 L)

Data existing TIDAK di-recalculate sebagai mobil_produktif karena tidak ada
data historis yang cukup untuk membedakan ojek motor vs supir Grab — ini harus
dilakukan manual oleh petugas. Migration ini hanya memberikan nilai aman.

Usage:
  cd ml-service
  python migrate_kategori_kendaraan.py
"""

import psycopg2
import sys

# ─── Konfigurasi koneksi — sesuaikan jika berbeda ─────────────────────────
DB_USER = "postgres"
DB_PASS = "admin123"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "petrochain_db"

# ─── Matriks kuota (mirror dari schema.py) ────────────────────────────────
VEHICLE_QUOTA_MAP = {
    "motor_pribadi":   50,
    "motor_produktif": 100,
    "mobil_produktif": 350,
}


def connect():
    return psycopg2.connect(
        user=DB_USER, password=DB_PASS,
        host=DB_HOST, port=DB_PORT, database=DB_NAME
    )


def run_migration():
    print("=" * 60)
    print("PetroChain -- Migrasi Kategori Kendaraan v2")
    print("=" * 60)

    conn = connect()
    cursor = conn.cursor()

    # -- Step 1: Tambah kolom (idempotent) -----------------------------------
    print("\n[1/4] Menambah kolom kategori_kendaraan...")
    cursor.execute("""
        ALTER TABLE warga
        ADD COLUMN IF NOT EXISTS kategori_kendaraan VARCHAR(20) DEFAULT 'motor_pribadi';
    """)
    conn.commit()
    print("      [OK] Kolom siap.")

    # -- Step 2: Heuristik -- tandai ojek online yang sudah ada ---------------
    # jenis_pekerjaan = 5 (ojek/transportasi) + kepemilikan_aset >= 2 (punya motor)
    print("\n[2/4] Heuristik: menandai warga ojek online -> motor_produktif...")
    cursor.execute("""
        UPDATE warga
        SET kategori_kendaraan = 'motor_produktif'
        WHERE kategori_kendaraan = 'motor_pribadi'
          AND jenis_pekerjaan = 5
          AND kepemilikan_aset >= 2;
    """)
    updated_ojek = cursor.rowcount
    conn.commit()
    print(f"      [OK] {updated_ojek} warga ditandai sebagai motor_produktif.")

    # -- Step 3: Recalculate kuota_liter untuk warga motor_produktif ----------
    print("\n[3/4] Recalculate kuota_liter untuk warga motor_produktif...")
    cursor.execute("""
        UPDATE warga
        SET kuota_liter = 100
        WHERE kategori_kendaraan = 'motor_produktif'
          AND kuota_liter IS NOT NULL;
    """)
    updated_kuota = cursor.rowcount
    conn.commit()
    print(f"      [OK] {updated_kuota} baris kuota diperbarui ke 100 L.")

    # -- Step 4: Verifikasi hasil ---------------------------------------------
    print("\n[4/4] Verifikasi hasil migrasi...")
    cursor.execute("""
        SELECT kategori_kendaraan, COUNT(*) as jumlah,
               AVG(kuota_liter)::NUMERIC(10,1) as rata_kuota
        FROM warga
        GROUP BY kategori_kendaraan
        ORDER BY jumlah DESC;
    """)
    rows = cursor.fetchall()
    
    print(f"\n  {'Kategori':<22} {'Jumlah':>8} {'Rata Kuota':>12}")
    print("  " + "-" * 44)
    for kategori, jumlah, rata_kuota in rows:
        print(f"  {str(kategori):<22} {jumlah:>8,} {str(rata_kuota or '-'):>12}")

    cursor.close()
    conn.close()

    print("\n" + "=" * 60)
    print("[SELESAI] Migrasi berhasil.")
    print()
    print("CATATAN: Warga yang menggunakan mobil produktif (Grab/angkot)")
    print("harus diupdate MANUAL oleh petugas via Admin Panel,")
    print("karena sistem tidak memiliki data historis kepemilikan mobil.")
    print("=" * 60)


if __name__ == "__main__":
    try:
        run_migration()
    except psycopg2.Error as e:
        print(f"\n[ERROR] Koneksi database gagal: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Migrasi gagal: {e}")
        sys.exit(1)
