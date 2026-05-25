const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

// ============================================================
// Konstanta Kategori Kendaraan — sumber kebenaran tunggal
// ============================================================
const VEHICLE_QUOTA_MAP = {
  motor_pribadi:   50,
  motor_produktif: 100,
  mobil_produktif: 350,
};

const VALID_KATEGORI = Object.keys(VEHICLE_QUOTA_MAP);
const KATEGORI_BUTUH_NOPOL = ['motor_produktif', 'mobil_produktif'];

// Mapping kategori ke tipe kendaraan di tabel STNK
const KATEGORI_TO_TIPE = {
  motor_produktif: 'motor',
  mobil_produktif: 'mobil',
};

function fallbackKuota(kategori) {
  return VEHICLE_QUOTA_MAP[kategori] ?? 50;
}

// ============================================================
// Helper: Validasi anti-fraud nomor polisi
// ============================================================
function validateNoPol(kategori, no_polisi) {
  if (KATEGORI_BUTUH_NOPOL.includes(kategori)) {
    if (!no_polisi || String(no_polisi).trim() === '') {
      return 'Nomor polisi kendaraan wajib diisi untuk kategori Motor Produktif atau Mobil Produktif. ' +
             'Bukti kepemilikan kendaraan operasional diperlukan untuk mencegah kecurangan data.';
    }
    // Validasi format dasar pelat Indonesia: [huruf][angka][huruf/angka] contoh: B1234ABC
    const trimmed = String(no_polisi).trim().toUpperCase().replace(/\s+/g, '');
    if (trimmed.length < 5 || trimmed.length > 12) {
      return 'Format nomor polisi tidak valid. Contoh: B1234ABC atau AB1234CD';
    }
  }
  return null;
}

// ============================================================
// Register Warga (Individual)
// ============================================================
exports.registerWarga = async (req, res, next) => {
  try {
    const {
      nik, nama_lengkap, alamat,
      kondisi_rumah, sumber_listrik, kepemilikan_aset, pendidikan_kk,
      jml_tanggungan, jenis_pekerjaan, akses_air, kepemilikan_lahan,
      kategori_kendaraan = 'motor_pribadi',
      no_polisi,
    } = req.body;

    // Baca nama petugas dari JWT token
    const verified_by = req.user?.username || 'Admin';

    // --- Validasi kategori ---
    if (!VALID_KATEGORI.includes(kategori_kendaraan)) {
      return res.status(400).json({
        success: false, data: null,
        message: `Kategori kendaraan tidak valid. Pilihan: ${VALID_KATEGORI.join(', ')}`
      });
    }

    // --- Validasi anti-fraud nomor polisi ---
    const nopolError = validateNoPol(kategori_kendaraan, no_polisi);
    if (nopolError) {
      return res.status(400).json({ success: false, data: null, message: nopolError });
    }

    // --- Cek duplikat NIK ---
    const existing = await prisma.warga.findUnique({ where: { nik } });
    if (existing) {
      return res.status(400).json({ success: false, data: null, message: 'NIK sudah terdaftar' });
    }

    // --- Panggil ML Service ---
    let level_subsidi = 3;
    let kuota_liter = fallbackKuota(kategori_kendaraan);
    let ai_confidence = 0.0;

    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
        kondisi_rumah, sumber_listrik, kepemilikan_aset, pendidikan_kk,
        jml_tanggungan, jenis_pekerjaan, akses_air, kepemilikan_lahan,
        kategori_kendaraan
      });
      if (mlResponse.data && mlResponse.data.level) {
        level_subsidi    = mlResponse.data.level;
        kuota_liter      = mlResponse.data.kuota_liter;
        ai_confidence    = mlResponse.data.confidence || 0.0;
      }
    } catch (mlError) {
      console.error('ML Service error:', mlError.message);
    }

    const normalizedNoPol = no_polisi
      ? String(no_polisi).trim().toUpperCase().replace(/\s+/g, '')
      : null;

    const warga = await prisma.warga.create({
      data: {
        nik, nama_lengkap, alamat,
        kondisi_rumah, sumber_listrik, kepemilikan_aset, pendidikan_kk,
        jml_tanggungan, jenis_pekerjaan, akses_air, kepemilikan_lahan,
        kategori_kendaraan,
        no_polisi: normalizedNoPol,
        verified_by,
        tanggal_verifikasi: new Date(),
        level_subsidi, kuota_liter, ai_confidence
      }
    });

    res.status(201).json({
      success: true,
      data: warga,
      message: `Warga berhasil didaftarkan. Kuota: ${kuota_liter} L/bln | Diverifikasi oleh: ${verified_by}`
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================
// Get All Warga + Stats
// ============================================================
exports.getWarga = async (req, res, next) => {
  try {
    const listWarga = await prisma.warga.findMany({
      orderBy: { created_at: 'desc' }
    });
    const totalWarga     = await prisma.warga.count();
    const totalTransaksi = await prisma.transaksi.count();

    res.json({
      success: true,
      data: { list: listWarga, stats: { totalWarga, totalTransaksi } },
      message: 'Berhasil mengambil data warga'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// Generate Dummy Data (distribusi realistis)
// ============================================================
exports.generateDummyWarga = async (req, res) => {
  try {
    const kategoriPool = [
      ...Array(65).fill('motor_pribadi'),
      ...Array(25).fill('motor_produktif'),
      ...Array(10).fill('mobil_produktif'),
    ];

    // Pool plat nomor simulasi
    const platPool = ['B1234ABC','D5678XYZ','F9012GHI','G3456JKL','H7890MNO',
                      'AB1234CD','BE5678EF','DA9012GH','K3456IJ','L7890KL'];

    const dummies = Array.from({ length: 10 }).map(() => {
      const randomNik = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
      const kategori  = kategoriPool[Math.floor(Math.random() * kategoriPool.length)];
      const noPol     = KATEGORI_BUTUH_NOPOL.includes(kategori)
        ? platPool[Math.floor(Math.random() * platPool.length)]
        : null;

      return {
        nik: randomNik,
        nama_lengkap: `Warga Simulasi ${Math.floor(Math.random() * 9999)}`,
        alamat: 'Jl. Simulasi Batch No. ' + Math.floor(Math.random() * 100),
        kondisi_rumah:    Math.floor(Math.random() * 5) + 1,
        sumber_listrik:   Math.floor(Math.random() * 4) + 1,
        kepemilikan_aset: Math.floor(Math.random() * 4) + 1,
        pendidikan_kk:    Math.floor(Math.random() * 6) + 1,
        jml_tanggungan:   Math.floor(Math.random() * 6),
        jenis_pekerjaan:  Math.floor(Math.random() * 6) + 1,
        akses_air:        Math.floor(Math.random() * 4) + 1,
        kepemilikan_lahan:Math.floor(Math.random() * 3) + 1,
        kategori_kendaraan: kategori,
        no_polisi:          noPol,
        verified_by:        'Sistem Simulasi',
        tanggal_verifikasi: new Date(),
        level_subsidi: null,
        kuota_liter:   null,
        ai_confidence: null
      };
    });

    await prisma.warga.createMany({ data: dummies });
    res.json({ success: true, message: '10 Data simulasi berhasil ditambahkan' });
  } catch (error) {
    console.error('Error generateDummy:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ============================================================
// Batch Predict (prediksi massal warga belum diprediksi)
// ============================================================
exports.batchPredictWarga = async (req, res) => {
  try {
    const unpredicted = await prisma.warga.findMany({ where: { level_subsidi: null } });

    if (unpredicted.length === 0) {
      return res.json({ success: true, message: 'Tidak ada data yang perlu diprediksi' });
    }

    let successCount = 0;

    for (const warga of unpredicted) {
      const kategori = warga.kategori_kendaraan || 'motor_pribadi';
      try {
        const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
          kondisi_rumah:    warga.kondisi_rumah,
          sumber_listrik:   warga.sumber_listrik,
          kepemilikan_aset: warga.kepemilikan_aset,
          pendidikan_kk:    warga.pendidikan_kk,
          jml_tanggungan:   warga.jml_tanggungan,
          jenis_pekerjaan:  warga.jenis_pekerjaan,
          akses_air:        warga.akses_air,
          kepemilikan_lahan:warga.kepemilikan_lahan,
          kategori_kendaraan: kategori
        });

        if (mlResponse.data && mlResponse.data.level) {
          await prisma.warga.update({
            where: { id: warga.id },
            data: {
              level_subsidi: mlResponse.data.level,
              kuota_liter:   mlResponse.data.kuota_liter,
              ai_confidence: mlResponse.data.confidence || 0.0
            }
          });
          successCount++;
        }
      } catch (mlError) {
        console.error(`Gagal memprediksi warga ${warga.nik}:`, mlError.message);
        // Fallback agar data tidak tergantung
        await prisma.warga.update({
          where: { id: warga.id },
          data: {
            level_subsidi: 3,
            kuota_liter:   fallbackKuota(kategori),
            ai_confidence: 0.0
          }
        });
      }
    }

    res.json({ success: true, message: `Berhasil memprediksi ${successCount} dari ${unpredicted.length} data` });
  } catch (error) {
    console.error('Error batchPredict:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ============================================================
// Import Bulk dari Excel
// ============================================================
exports.importWargaBulk = async (req, res) => {
  try {
    const data = req.body;
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data tidak valid' });
    }

    const formattedData = data.map(row => {
      const rawKategori = (row.kategori_kendaraan || row['Kategori Kendaraan'] || 'motor_pribadi')
        .toString().toLowerCase().trim().replace(/\s+/g, '_');
      const kategori = VALID_KATEGORI.includes(rawKategori) ? rawKategori : 'motor_pribadi';

      const rawNoPol = row.no_polisi || row['No Polisi'] || row['Nomor Polisi'] || null;
      const noPol = rawNoPol
        ? String(rawNoPol).trim().toUpperCase().replace(/\s+/g, '')
        : null;

      return {
        nik:              String(row.nik || ''),
        nama_lengkap:     String(row.nama_lengkap || ''),
        alamat:           String(row.alamat || ''),
        kondisi_rumah:    Number(row.kondisi_rumah)    || 3,
        sumber_listrik:   Number(row.sumber_listrik)   || 3,
        kepemilikan_aset: Number(row.kepemilikan_aset) || 3,
        pendidikan_kk:    Number(row.pendidikan_kk)    || 3,
        jml_tanggungan:   Number(row.jml_tanggungan)   || 0,
        jenis_pekerjaan:  Number(row.jenis_pekerjaan)  || 3,
        akses_air:        Number(row.akses_air)         || 3,
        kepemilikan_lahan:Number(row.kepemilikan_lahan)|| 3,
        kategori_kendaraan: kategori,
        no_polisi:          noPol,
        verified_by:        'Import Excel',
        tanggal_verifikasi: new Date(),
        level_subsidi: null,
        kuota_liter:   null,
        ai_confidence: null
      };
    }).filter(row => row.nik.trim() !== '' && row.nama_lengkap.trim() !== '');

    if (formattedData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data valid. Pastikan kolom NIK dan Nama Lengkap terisi.'
      });
    }

    const result = await prisma.warga.createMany({ data: formattedData, skipDuplicates: true });
    res.json({ success: true, message: `Berhasil mengimport ${result.count} data warga baru.` });
  } catch (error) {
    console.error('Error import bulk:', error);
    res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
  }
};

// ============================================================
// Update Warga
// ============================================================
exports.updateWarga = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nik, nama_lengkap, alamat,
      kondisi_rumah, sumber_listrik, kepemilikan_aset, pendidikan_kk,
      jml_tanggungan, jenis_pekerjaan, akses_air, kepemilikan_lahan,
      kategori_kendaraan,
      no_polisi,
    } = req.body;

    const updated_by = req.user?.username || 'Admin';

    const existingWarga = await prisma.warga.findUnique({ where: { id } });
    if (!existingWarga) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    if (nik && nik !== existingWarga.nik) {
      const nikExists = await prisma.warga.findUnique({ where: { nik } });
      if (nikExists) {
        return res.status(400).json({ success: false, message: 'NIK sudah terdaftar pada warga lain' });
      }
    }

    const resolvedKategori = (kategori_kendaraan && VALID_KATEGORI.includes(kategori_kendaraan))
      ? kategori_kendaraan
      : (existingWarga.kategori_kendaraan || 'motor_pribadi');

    const resolvedNoPol = no_polisi !== undefined
      ? (no_polisi ? String(no_polisi).trim().toUpperCase().replace(/\s+/g, '') : null)
      : existingWarga.no_polisi;

    // Validasi anti-fraud jika kategori berubah ke produktif
    const nopolError = validateNoPol(resolvedKategori, resolvedNoPol);
    if (nopolError) {
      return res.status(400).json({ success: false, message: nopolError });
    }

    // Re-predict
    let level_subsidi = existingWarga.level_subsidi;
    let kuota_liter   = VEHICLE_QUOTA_MAP[resolvedKategori] ?? existingWarga.kuota_liter;
    let ai_confidence = existingWarga.ai_confidence;

    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
        kondisi_rumah:    kondisi_rumah    ?? existingWarga.kondisi_rumah,
        sumber_listrik:   sumber_listrik   ?? existingWarga.sumber_listrik,
        kepemilikan_aset: kepemilikan_aset ?? existingWarga.kepemilikan_aset,
        pendidikan_kk:    pendidikan_kk    ?? existingWarga.pendidikan_kk,
        jml_tanggungan:   jml_tanggungan   ?? existingWarga.jml_tanggungan,
        jenis_pekerjaan:  jenis_pekerjaan  ?? existingWarga.jenis_pekerjaan,
        akses_air:        akses_air        ?? existingWarga.akses_air,
        kepemilikan_lahan:kepemilikan_lahan ?? existingWarga.kepemilikan_lahan,
        kategori_kendaraan: resolvedKategori
      });
      if (mlResponse.data && mlResponse.data.level) {
        level_subsidi = mlResponse.data.level;
        kuota_liter   = mlResponse.data.kuota_liter;
        ai_confidence = mlResponse.data.confidence ?? 0.0;
      }
    } catch (mlError) {
      console.error('ML Service error on update:', mlError.message);
      kuota_liter = fallbackKuota(resolvedKategori);
    }

    const updated = await prisma.warga.update({
      where: { id },
      data: {
        nik, nama_lengkap, alamat,
        kondisi_rumah, sumber_listrik, kepemilikan_aset, pendidikan_kk,
        jml_tanggungan, jenis_pekerjaan, akses_air, kepemilikan_lahan,
        kategori_kendaraan: resolvedKategori,
        no_polisi:          resolvedNoPol,
        verified_by:        updated_by,
        tanggal_verifikasi: new Date(),
        level_subsidi, kuota_liter, ai_confidence
      }
    });

    res.json({ success: true, message: 'Data berhasil diperbarui', data: updated });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// Delete Warga
// ============================================================
exports.deleteWarga = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.warga.delete({ where: { id } });
    res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// Verifikasi STNK Kendaraan
// Mengecek no_polisi ke tabel kendaraan (Simulated STNK Registry)
// Di produksi: diganti API Korlantas / Ditjen Hubdat
// ============================================================
exports.verifyKendaraan = async (req, res, next) => {
  try {
    const { no_polisi, kategori_kendaraan } = req.body;

    if (!no_polisi || !kategori_kendaraan) {
      return res.status(400).json({
        valid: false,
        message: 'Parameter no_polisi dan kategori_kendaraan wajib diisi.'
      });
    }

    // Normalisasi: hapus spasi, uppercase
    const normalizedNoPol = String(no_polisi).trim().toUpperCase().replace(/\s+/g, '');

    // Query ke tabel kendaraan (STNK registry)
    const kendaraan = await prisma.kendaraan.findUnique({
      where: { no_polisi: normalizedNoPol }
    });

    // ── Pengecekan 1: No. polisi tidak ditemukan ──────────────────────────
    if (!kendaraan) {
      return res.status(200).json({
        valid: false,
        code: 'NOT_FOUND',
        message: `Nomor polisi ${normalizedNoPol} tidak ditemukan dalam database STNK. ` +
                 `Pastikan nomor polisi sesuai STNK asli, atau kendaraan belum terdaftar.`,
        data: null
      });
    }

    // ── Pengecekan 2: Status STNK aktif ──────────────────────────────────
    if (!kendaraan.status_aktif) {
      return res.status(200).json({
        valid: false,
        code: 'STNK_INACTIVE',
        message: `Kendaraan ${normalizedNoPol} (${kendaraan.nama_pemilik}) memiliki status STNK ` +
                 `tidak aktif / terblokir. Kendaraan ini tidak memenuhi syarat verifikasi subsidi.`,
        data: null
      });
    }

    // ── Pengecekan 3: Tipe kendaraan cocok dengan kategori ────────────────
    const expectedTipe = KATEGORI_TO_TIPE[kategori_kendaraan];
    if (expectedTipe && kendaraan.tipe_kendaraan !== expectedTipe) {
      return res.status(200).json({
        valid: false,
        code: 'TIPE_MISMATCH',
        message: `Tipe kendaraan tidak sesuai. Nomor polisi ${normalizedNoPol} adalah ` +
                 `${kendaraan.tipe_kendaraan} (${kendaraan.merk}), ` +
                 `tapi kategori yang dipilih membutuhkan ${expectedTipe}. ` +
                 `Ganti kategori atau gunakan nomor polisi yang tepat.`,
        data: null
      });
    }

    // ── Semua valid ───────────────────────────────────────────────────────
    return res.status(200).json({
      valid: true,
      code: 'VERIFIED',
      message: `Verifikasi berhasil. Kendaraan atas nama ${kendaraan.nama_pemilik} ` +
               `(${kendaraan.merk} ${kendaraan.tahun}) telah terverifikasi.`,
      data: {
        no_polisi:     kendaraan.no_polisi,
        nama_pemilik:  kendaraan.nama_pemilik,
        tipe_kendaraan:kendaraan.tipe_kendaraan,
        merk:          kendaraan.merk,
        tahun:         kendaraan.tahun,
        status_aktif:  kendaraan.status_aktif,
      }
    });

  } catch (error) {
    next(error);
  }
};
