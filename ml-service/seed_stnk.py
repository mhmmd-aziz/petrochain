"""
seed_stnk.py — Seed data simulasi tabel kendaraan (STNK Registry)
==================================================================
Berisi 120 kendaraan representatif: motor ojol, mobil Grab, angkot, dll.
Beberapa sengaja dimasukkan status_aktif=False untuk simulasi STNK mati/bermasalah.

Di produksi: sumber data berasal dari API Korlantas / Ditjen Hubdat.
Di demo KMIPN: tabel ini menggantikan API eksternal tersebut.

Usage:
  cd ml-service
  python seed_stnk.py
"""

import psycopg2
import uuid
import random

DB = dict(user="postgres", password="admin123", host="localhost", port="5432", database="petrochain_db")

# ── Pool data STNK simulasi ────────────────────────────────────────────────
# Format: (no_polisi, nama_pemilik, tipe, merk, tahun, status_aktif)
STNK_DATA = [
    # ── Motor Ojol (aktif) ─────────────────────────────────────────────────
    ("BL1234AB",  "Ahmad Fauzi",          "motor", "Honda Beat",      2020, True),
    ("BL2345CD",  "Siti Rahayu",          "motor", "Yamaha NMAX",     2021, True),
    ("BL3456EF",  "Rizky Maulana",        "motor", "Honda Vario 125", 2019, True),
    ("BL4567GH",  "Dewi Lestari",         "motor", "Yamaha Mio M3",   2022, True),
    ("BL5678IJ",  "Budi Santoso",         "motor", "Honda Beat",      2020, True),
    ("BL6789KL",  "Eko Prasetyo",         "motor", "Honda Scoopy",    2021, True),
    ("BL7890MN",  "Fitri Handayani",      "motor", "Yamaha NMAX",     2022, True),
    ("BL8901OP",  "Hendra Gunawan",       "motor", "Honda PCX 150",   2021, True),
    ("BL9012QR",  "Irfan Hakim",          "motor", "Kawasaki Ninja",  2020, True),
    ("BL1023ST",  "Joko Widodo",          "motor", "Honda Beat",      2019, True),
    ("BL2134UV",  "Kartini Nusa",         "motor", "Yamaha Mio",      2020, True),
    ("BL3245WX",  "Lutfi Rahman",         "motor", "Honda Vario",     2021, True),
    ("BL4356YZ",  "Maya Indah",           "motor", "Honda Beat",      2022, True),
    ("BL5467AA",  "Nanda Putra",          "motor", "Yamaha NMAX",     2020, True),
    ("BL6578BB",  "Omar Syah",            "motor", "Honda Scoopy",    2019, True),
    ("BL7689CC",  "Putri Ayu",            "motor", "Yamaha Mio M3",   2021, True),
    ("BL8790DD",  "Qodir Hasan",          "motor", "Honda Beat",      2022, True),
    ("BL9801EE",  "Rina Marlina",         "motor", "Honda PCX",       2021, True),
    ("BL1912FF",  "Samsul Bahri",         "motor", "Yamaha Aerox",    2022, True),
    ("BL2023GG",  "Taufiq Ismail",        "motor", "Honda Vario 125", 2020, True),
    ("BL3134HH",  "Usman Hadi",           "motor", "Honda Beat",      2021, True),
    ("BL4245II",  "Vina Rahma",           "motor", "Yamaha Mio",      2019, True),
    ("BL5356JJ",  "Wawan Setiawan",       "motor", "Honda Scoopy",    2020, True),
    ("BL6467KK",  "Xandi Kurniawan",      "motor", "Honda Beat",      2022, True),
    ("BL7578LL",  "Yuli Astuti",          "motor", "Yamaha Mio M3",   2021, True),
    ("BL8689MM",  "Zainal Arifin",        "motor", "Honda Vario",     2020, True),
    # Aceh Besar / luar kota
    ("BL1100NN",  "Abdurrahman Sholeh",   "motor", "Honda Beat",      2020, True),
    ("BL2211OO",  "Baharuddin Ismail",    "motor", "Yamaha NMAX",     2021, True),
    ("BL3322PP",  "Chairul Syafri",       "motor", "Honda PCX 150",   2022, True),
    ("BL4433QQ",  "Daud Mahmud",          "motor", "Yamaha Aerox",    2021, True),
    ("BL5544RR",  "Efendi Syarif",        "motor", "Honda Beat",      2019, True),

    # ── Mobil Grab / Taksi Online (aktif) ──────────────────────────────────
    ("BL1111SS",  "Fakhrul Razi",         "mobil", "Toyota Avanza",   2019, True),
    ("BL2222TT",  "Ghazali Mustafa",      "mobil", "Toyota Calya",    2020, True),
    ("BL3333UU",  "Hamdan Yusuf",         "mobil", "Daihatsu Sigra",  2021, True),
    ("BL4444VV",  "Ilham Akbar",          "mobil", "Honda Mobilio",   2018, True),
    ("BL5555WW",  "Jailani Ahmad",        "mobil", "Mitsubishi Xpander", 2020, True),
    ("BL6666XX",  "Kamaruddin Saleh",     "mobil", "Toyota Avanza",   2021, True),
    ("BL7777YY",  "Lukmanul Hakim",       "mobil", "Daihatsu Ayla",   2019, True),
    ("BL8888ZZ",  "Mukhlis Harun",        "mobil", "Honda Brio",      2022, True),
    ("BL9999AA",  "Nasrul Fahmi",         "mobil", "Toyota Calya",    2020, True),
    ("BL1010BB",  "Omar Farouk",          "mobil", "Mitsubishi Xpander", 2021, True),
    ("BL1212CC",  "Pauzi Rahman",         "mobil", "Toyota Avanza",   2019, True),
    ("BL1313DD",  "Rahmat Hidayat",       "mobil", "Daihatsu Sigra",  2020, True),
    ("BL1414EE",  "Safrizal Anwar",       "mobil", "Honda Mobilio",   2021, True),
    ("BL1515FF",  "Tarmizi Umar",         "mobil", "Toyota Calya",    2022, True),
    ("BL1616GG",  "Umar Faruq",           "mobil", "Toyota Avanza",   2018, True),

    # ── Motor Kurir/Delivery ────────────────────────────────────────────────
    ("BL1717HH",  "Valdy Firmansyah",     "motor", "Honda Vario 125", 2021, True),
    ("BL1818II",  "Wahyu Santosa",        "motor", "Yamaha NMAX",     2020, True),
    ("BL1919JJ",  "Yasser Arafat",        "motor", "Honda Beat",      2019, True),
    ("BL2020KK",  "Zul Fahmi",            "motor", "Yamaha Mio M3",   2021, True),
    ("BL2121LL",  "Agus Hermawan",        "motor", "Honda Scoopy",    2022, True),
    ("BL2222MM",  "Basri Usman",          "motor", "Honda Beat",      2020, True),
    ("BL2323NN",  "Cahyo Prasetyo",       "motor", "Yamaha Aerox",    2021, True),
    ("BL2424OO",  "Dedi Mulyadi",         "motor", "Honda Vario",     2020, True),
    ("BL2525PP",  "Emil Dardak",          "motor", "Honda PCX",       2021, True),

    # ── Angkutan Umum (aktif) ──────────────────────────────────────────────
    ("BL3001QQ",  "Koperasi Angkutan Kota", "mobil", "Isuzu Elf",    2018, True),
    ("BL3002RR",  "Koperasi Angkutan Kota", "mobil", "Mitsubishi L300", 2019, True),
    ("BL3003SS",  "Sopir Angkot Merdeka",  "mobil", "Suzuki Carry",  2017, True),

    # ── STNK MATI / BERMASALAH (status_aktif=False) ───────────────────────
    # Kendaraan ini akan DITOLAK sistem saat verifikasi — bagus untuk demo!
    ("BL9991ZZ",  "Penipu Subsidi",        "mobil", "Toyota Innova",  2015, False),
    ("BL9992ZZ",  "Manipulasi Data",       "motor", "Honda Beat",     2010, False),
    ("BL9993ZZ",  "STNK Kedaluwarsa",      "motor", "Yamaha Mio",     2012, False),
    ("BL9994ZZ",  "Kendaraan Sitaan",      "mobil", "Daihatsu Xenia", 2016, False),
    ("BL9995ZZ",  "Blokir Kepolisian",     "motor", "Honda Vario",    2014, False),
]


def seed():
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    # Hapus data lama
    cur.execute("TRUNCATE TABLE kendaraan;")

    insert_q = """
        INSERT INTO kendaraan (id, no_polisi, nama_pemilik, tipe_kendaraan, merk, tahun, status_aktif)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (no_polisi) DO NOTHING;
    """

    for row in STNK_DATA:
        cur.execute(insert_q, (str(uuid.uuid4()), *row))

    conn.commit()

    cur.execute("SELECT COUNT(*) FROM kendaraan;")
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM kendaraan WHERE status_aktif = true;")
    aktif = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM kendaraan WHERE status_aktif = false;")
    mati = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM kendaraan WHERE tipe_kendaraan = 'motor';")
    motor = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM kendaraan WHERE tipe_kendaraan = 'mobil';")
    mobil = cur.fetchone()[0]

    print("=" * 55)
    print("Seed STNK Registry Selesai")
    print("=" * 55)
    print(f"  Total kendaraan : {total}")
    print(f"  STNK Aktif      : {aktif}")
    print(f"  STNK Mati/Blokir: {mati}  <-- akan ditolak sistem")
    print(f"  Motor           : {motor}")
    print(f"  Mobil           : {mobil}")
    print()
    print("No. polisi untuk demo verifikasi DITOLAK:")
    print("  BL9991ZZ / BL9992ZZ / BL9993ZZ / BL9994ZZ / BL9995ZZ")
    print()
    print("No. polisi untuk demo verifikasi SUKSES (contoh):")
    print("  BL1234AB / BL1111SS / BL2222TT / BL3001QQ")
    print("=" * 55)

    cur.close()
    conn.close()


if __name__ == "__main__":
    seed()
