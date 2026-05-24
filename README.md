# ⛽ PetroChain

**PetroChain** adalah ekosistem aplikasi tingkat Enterprise (*Enterprise-grade*) yang dirancang untuk mengatasi masalah distribusi Bahan Bakar Minyak (BBM) bersubsidi agar **100% tepat sasaran**. Sistem ini mengawinkan tiga teknologi mutakhir: **Sistem Verifikasi Berbasis KTP/NIK**, **Machine Learning (AI)**, dan keamanan **Blockchain**.

---

## 🌟 Fitur Utama

### 1. Dashboard Analitik Cerdas (Business Intelligence)
- Dilengkapi **Global Time Filter** (Bulan/Tahun) yang mengkalkulasi ulang data *real-time*.
- **5 Grafik Interaktif (Recharts)** yang memvisualisasikan:
  - Distribusi kelayakan subsidi (Sangat Miskin, Miskin, Rentan).
  - Tren pendaftaran Warga secara periodik.
  - Demografi pekerjaan pendaftar.
  - Komposisi fasilitas kelistrikan warga.
  - Kondisi fisik perumahan warga.

### 2. Machine Learning Engine (Python)
- Mesin prediksi ditenagai **LightGBM (LGBMClassifier)**.
- **Auto-Evaluation**: AI secara dinamis akan memprediksi kelayakan subsidi BBM berdasarkan 8 parameter sosial-ekonomi yang kompleks (Pekerjaan, Kondisi Rumah, Jumlah Tanggungan, dll).
- Memberikan skor akurasi (*Confidence Score*). Jika *score* < 70%, sistem mengkategorikannya sebagai anomali yang perlu pengecekan manual.

### 3. Manajemen Warga & Bulk Import (CRUD)
- Formulir pendaftaran terpadu untuk individu.
- **Batch Processing**: Impor data ratusan warga secara bersamaan menggunakan file **Excel/CSV**.
- **Mass Prediction**: Sekali klik untuk memprediksi ratusan warga yang belum diklasifikasikan oleh AI.
- Ekspor laporan dalam bentuk format **Excel** dan **PDF** terstruktur (mendukung *Smart Filter*).
- Fitur Edit Data: Jika kondisi sosial-ekonomi warga diedit, AI akan **otomatis melakukan re-prediksi**.

### 4. Smart Contract (IoT & Blockchain ready) - *In Development*
- Mencatat *log* pendistribusian liter kuota subsidi di SPBU langsung ke dalam jaringan Blockchain untuk mencegah penggelapan dan manipulasi data kuota.

---

## 🛠️ Tech Stack

Aplikasi ini dibangun menggunakan arsitektur *microservices* dengan stack berikut:

- **Frontend (Web):** Next.js 15 (App Router), React, TailwindCSS, Framer Motion, Recharts, SweetAlert2.
- **Backend (API):** Node.js, Express.js, Prisma ORM, JSON Web Tokens (JWT).
- **Database:** PostgreSQL.
- **ML Service (AI):** Python 3.10+, FastAPI, Uvicorn, Scikit-Learn, LightGBM, Pandas.

---

## 🚀 Cara Menjalankan Aplikasi Lokal

Aplikasi ini dibagi menjadi 3 bagian yang harus dijalankan secara paralel.

### Prasyarat
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (Berjalan di port `5432` dengan database `petrochain_db`)

### 1. Menjalankan Backend API (Node.js)
```bash
cd backend
npm install
npm run dev
```

### 2. Menjalankan ML Service (Python FastAPI)
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

### 3. Menjalankan Frontend (Next.js)
```bash
cd web
npm install
npm run dev
```

Aplikasi *Web Admin* sekarang dapat diakses melalui browser di `http://localhost:3000`.

---

## 📂 Struktur Repositori

```
/petrochain
├── /backend      # Node.js REST API & Prisma ORM Server
├── /ml-service   # Python FastAPI & AI Models
└── /web          # Next.js Frontend App
```

---

*Dikembangkan untuk efisiensi energi nasional yang lebih baik.*
