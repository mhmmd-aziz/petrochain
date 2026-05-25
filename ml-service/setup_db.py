import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import pandas as pd
from faker import Faker
import random
import uuid

# Database config
DB_USER = "postgres"
DB_PASS = "admin123"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "petrochain_db"

# ─── Matriks kuota berbasis KATEGORI KENDARAAN ─────────────────────────────
# Mirror dari ml-service/app/schema.py → VEHICLE_QUOTA_MAP
VEHICLE_QUOTA_MAP = {
    "motor_pribadi":   50,   # L/bln
    "motor_produktif": 100,  # L/bln
    "mobil_produktif": 350,  # L/bln
}


def resolve_kategori_kendaraan(jenis_pekerjaan: int) -> str:
    """
    Heuristik distribusi kategori kendaraan berdasarkan jenis pekerjaan.
    Untuk seed data — bukan untuk produksi (produksi harus verifikasi petugas).
    
    Distribusi:
      - jenis_pekerjaan=5 (ojek/transportasi): 70% motor_produktif, 20% mobil_produktif, 10% motor_pribadi
      - jenis lain: 80% motor_pribadi, 15% motor_produktif, 5% mobil_produktif
    """
    r = random.random()
    if jenis_pekerjaan == 5:
        if r < 0.70: return "motor_produktif"
        elif r < 0.90: return "mobil_produktif"
        else: return "motor_pribadi"
    else:
        if r < 0.80: return "motor_pribadi"
        elif r < 0.95: return "motor_produktif"
        else: return "mobil_produktif"


def create_database():
    try:
        conn = psycopg2.connect(
            user=DB_USER, password=DB_PASS,
            host=DB_HOST, port=DB_PORT, database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute(f"CREATE DATABASE {DB_NAME}")
            print(f"[OK] Database '{DB_NAME}' berhasil dibuat.")
        else:
            print(f"[INFO] Database '{DB_NAME}' sudah ada.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[ERROR] Gagal membuat database: {e}")


def create_table_and_seed():
    try:
        conn = psycopg2.connect(
            user=DB_USER, password=DB_PASS,
            host=DB_HOST, port=DB_PORT, database=DB_NAME
        )
        cursor = conn.cursor()

        # Create Table — termasuk kolom kategori_kendaraan
        create_table_query = """
        CREATE TABLE IF NOT EXISTS warga (
            id UUID PRIMARY KEY,
            nik VARCHAR(16) UNIQUE NOT NULL,
            nama_lengkap VARCHAR(255) NOT NULL,
            alamat TEXT,
            kondisi_rumah INT,
            sumber_listrik INT,
            kepemilikan_aset INT,
            pendidikan_kk INT,
            jml_tanggungan INT,
            jenis_pekerjaan INT,
            akses_air INT,
            kepemilikan_lahan INT,
            level_subsidi INT,
            kategori_kendaraan VARCHAR(20) DEFAULT 'motor_pribadi',
            kuota_liter INT,
            ai_confidence DECIMAL(5,4),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        cursor.execute(create_table_query)
        print("[OK] Tabel 'warga' siap.")

        # Tambah kolom jika tabel sudah ada tapi belum punya kolom baru
        cursor.execute("""
            ALTER TABLE warga
            ADD COLUMN IF NOT EXISTS kategori_kendaraan VARCHAR(20) DEFAULT 'motor_pribadi';
        """)
        cursor.execute("""
            ALTER TABLE warga
            ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(5,4);
        """)

        # Clear existing data for fresh seed
        cursor.execute("TRUNCATE TABLE transaksi, notifikasi, warga RESTART IDENTITY CASCADE;")
        
        # Read dataset
        df = pd.read_csv('models/synthetic_dataset_500.csv')
        fake = Faker('id_ID')
        
        insert_query = """
            INSERT INTO warga (
                id, nik, nama_lengkap, alamat, kondisi_rumah, sumber_listrik,
                kepemilikan_aset, pendidikan_kk, jml_tanggungan, jenis_pekerjaan,
                akses_air, kepemilikan_lahan, level_subsidi, kategori_kendaraan, kuota_liter
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        records_to_insert = []
        kategori_stats = {"motor_pribadi": 0, "motor_produktif": 0, "mobil_produktif": 0}

        for index, row in df.iterrows():
            warga_id = str(uuid.uuid4())
            nik = str(fake.unique.random_number(digits=16, fix_len=True))
            nama_lengkap = fake.name()
            alamat = fake.address().replace('\n', ' ')
            
            level = int(row['level_subsidi'])
            jenis_pekerjaan = int(row['jenis_pekerjaan'])
            
            # Tentukan kategori kendaraan berdasarkan heuristik pekerjaan
            kategori = resolve_kategori_kendaraan(jenis_pekerjaan)
            kuota = VEHICLE_QUOTA_MAP[kategori]
            kategori_stats[kategori] += 1
            
            records_to_insert.append((
                warga_id, nik, nama_lengkap, alamat,
                int(row['kondisi_rumah']), int(row['sumber_listrik']),
                int(row['kepemilikan_aset']), int(row['pendidikan_kk']),
                int(row['jml_tanggungan']), jenis_pekerjaan,
                int(row['akses_air']), int(row['kepemilikan_lahan']),
                level, kategori, kuota
            ))

        cursor.executemany(insert_query, records_to_insert)
        conn.commit()
        
        print(f"[OK] Berhasil men-seed {len(records_to_insert)} data warga ke tabel PostgreSQL.")
        print(f"\nDistribusi Kategori Kendaraan:")
        for kat, count in kategori_stats.items():
            kuota_val = VEHICLE_QUOTA_MAP[kat]
            print(f"  {kat:<22}: {count:>4} warga ({kuota_val} L/bln)")
        
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"[ERROR] Gagal membuat tabel atau seeding: {e}")


if __name__ == "__main__":
    create_database()
    create_table_and_seed()

