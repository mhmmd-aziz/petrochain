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

def create_database():
    try:
        # Connect to default 'postgres' database to create the new database
        conn = psycopg2.connect(
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT,
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
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
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME
        )
        cursor = conn.cursor()

        # Create Table
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
            kuota_liter INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        cursor.execute(create_table_query)
        print("[OK] Tabel 'warga' siap.")

        # Clear existing data for fresh seed
        cursor.execute("TRUNCATE TABLE warga;")
        
        # Read dataset
        df = pd.read_csv('models/synthetic_dataset_500.csv')
        fake = Faker('id_ID')
        
        # Mapping Level to Kuota
        # Level 1: Miskin Ekstrem (150L)
        # Level 2: Miskin (80L)
        # Level 3: Rentan Miskin (50L)
        level_to_kuota = {1: 150, 2: 80, 3: 50}

        insert_query = """
            INSERT INTO warga (
                id, nik, nama_lengkap, alamat, kondisi_rumah, sumber_listrik,
                kepemilikan_aset, pendidikan_kk, jml_tanggungan, jenis_pekerjaan,
                akses_air, kepemilikan_lahan, level_subsidi, kuota_liter
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        records_to_insert = []
        for index, row in df.iterrows():
            warga_id = str(uuid.uuid4())
            nik = str(fake.unique.random_number(digits=16, fix_len=True))
            nama_lengkap = fake.name()
            alamat = fake.address().replace('\n', ' ')
            
            level = int(row['level_subsidi'])
            kuota = level_to_kuota.get(level, 0)
            
            records_to_insert.append((
                warga_id, nik, nama_lengkap, alamat,
                int(row['kondisi_rumah']), int(row['sumber_listrik']),
                int(row['kepemilikan_aset']), int(row['pendidikan_kk']),
                int(row['jml_tanggungan']), int(row['jenis_pekerjaan']),
                int(row['akses_air']), int(row['kepemilikan_lahan']),
                level, kuota
            ))

        cursor.executemany(insert_query, records_to_insert)
        conn.commit()
        
        print(f"[OK] Berhasil men-seed {len(records_to_insert)} data warga ke tabel PostgreSQL.")
        
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"[ERROR] Gagal membuat tabel atau seeding: {e}")

if __name__ == "__main__":
    create_database()
    create_table_and_seed()
