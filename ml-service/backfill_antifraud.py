"""Script cepat untuk backfill kolom anti-fraud ke data existing."""
import psycopg2

conn = psycopg2.connect(
    user="postgres", password="admin123",
    host="localhost", port="5432", database="petrochain_db"
)
cur = conn.cursor()

# Tambah kolom jika belum ada
cur.execute("ALTER TABLE warga ADD COLUMN IF NOT EXISTS no_polisi VARCHAR(15);")
cur.execute("ALTER TABLE warga ADD COLUMN IF NOT EXISTS verified_by VARCHAR(100);")
cur.execute("ALTER TABLE warga ADD COLUMN IF NOT EXISTS tanggal_verifikasi TIMESTAMP;")

# Backfill nilai default untuk data lama
cur.execute("""
    UPDATE warga
    SET verified_by = 'Data Simulasi',
        tanggal_verifikasi = NOW()
    WHERE verified_by IS NULL;
""")

conn.commit()

# Cek hasil
cur.execute("""
    SELECT kategori_kendaraan, COUNT(*) as jumlah,
           COUNT(no_polisi) as dengan_nopol
    FROM warga
    GROUP BY kategori_kendaraan
    ORDER BY jumlah DESC;
""")
rows = cur.fetchall()
print("\nHasil migrasi kolom anti-fraud:")
print(f"  {'Kategori':<22} {'Jumlah':>8} {'Ada No.Pol':>12}")
print("  " + "-" * 44)
for kat, jml, nopol in rows:
    print(f"  {str(kat):<22} {jml:>8} {nopol:>12}")

cur.close()
conn.close()
print("\n[OK] Selesai.")
