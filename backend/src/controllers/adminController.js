const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

exports.registerWarga = async (req, res, next) => {
  try {
    const { 
      nik, nama_lengkap, alamat, kondisi_rumah, sumber_listrik, 
      kepemilikan_aset, pendidikan_kk, jml_tanggungan, jenis_pekerjaan, 
      akses_air, kepemilikan_lahan 
    } = req.body;

    // Check if NIK exists
    const existing = await prisma.warga.findUnique({ where: { nik } });
    if (existing) {
      return res.status(400).json({ success: false, data: null, message: 'NIK sudah terdaftar' });
    }

    // Call Python ML Service to get level_subsidi and kuota
    let level_subsidi = 3; // Default fallback rentan miskin
    let kuota_liter = 50;
    let ai_confidence = 0.0;
    
    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
        kondisi_rumah, sumber_listrik, kepemilikan_aset, pendidikan_kk,
        jml_tanggungan, jenis_pekerjaan, akses_air, kepemilikan_lahan
      });
      
      if (mlResponse.data && mlResponse.data.level) {
        level_subsidi = mlResponse.data.level;
        kuota_liter = mlResponse.data.kuota_liter;
        if (mlResponse.data.confidence !== undefined) {
          ai_confidence = mlResponse.data.confidence;
        }
      }
    } catch (mlError) {
      console.error("ML Service error:", mlError.message);
      // Proceed with default fallback values
    }

    const warga = await prisma.warga.create({
      data: {
        nik, nama_lengkap, alamat, 
        kondisi_rumah, sumber_listrik, kepemilikan_aset, pendidikan_kk, 
        jml_tanggungan, jenis_pekerjaan, akses_air, kepemilikan_lahan,
        level_subsidi, kuota_liter, ai_confidence
      }
    });

    res.status(201).json({
      success: true,
      data: warga,
      message: 'Warga berhasil didaftarkan'
    });

  } catch (error) {
    next(error);
  }
};

exports.getWarga = async (req, res, next) => {
  try {
    const listWarga = await prisma.warga.findMany({
      orderBy: { created_at: 'desc' }
    });

    // Also get stats
    const totalWarga = await prisma.warga.count();
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

exports.generateDummyWarga = async (req, res) => {
  try {
    const dummies = Array.from({ length: 10 }).map((_, i) => {
      const randomNik = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
      return {
        nik: randomNik,
        nama_lengkap: `Warga Simulasi ${Math.floor(Math.random() * 1000)}`,
        alamat: "Jl. Simulasi Batch No. " + Math.floor(Math.random() * 100),
        kondisi_rumah: Math.floor(Math.random() * 5) + 1,
        sumber_listrik: Math.floor(Math.random() * 4) + 1,
        kepemilikan_aset: Math.floor(Math.random() * 4) + 1,
        pendidikan_kk: Math.floor(Math.random() * 6) + 1,
        jml_tanggungan: Math.floor(Math.random() * 6),
        jenis_pekerjaan: Math.floor(Math.random() * 6) + 1,
        akses_air: Math.floor(Math.random() * 4) + 1,
        kepemilikan_lahan: Math.floor(Math.random() * 3) + 1,
        level_subsidi: null,
        kuota_liter: null,
        ai_confidence: null
      };
    });

    await prisma.warga.createMany({ data: dummies });
    res.json({ success: true, message: "10 Data simulasi berhasil ditambahkan" });
  } catch (error) {
    console.error("Error generateDummy:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.batchPredictWarga = async (req, res) => {
  try {
    // Cari semua warga yang belum diprediksi
    const unpredicted = await prisma.warga.findMany({
      where: { level_subsidi: null }
    });

    if (unpredicted.length === 0) {
      return res.json({ success: true, message: "Tidak ada data yang perlu diprediksi" });
    }

    let successCount = 0;
    
    // Call ML service for each unpredicted warga sequentially
    for (const warga of unpredicted) {
      try {
        const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
          kondisi_rumah: warga.kondisi_rumah,
          sumber_listrik: warga.sumber_listrik,
          kepemilikan_aset: warga.kepemilikan_aset,
          pendidikan_kk: warga.pendidikan_kk,
          jml_tanggungan: warga.jml_tanggungan,
          jenis_pekerjaan: warga.jenis_pekerjaan,
          akses_air: warga.akses_air,
          kepemilikan_lahan: warga.kepemilikan_lahan
        });

        if (mlResponse.data && mlResponse.data.level) {
          await prisma.warga.update({
            where: { id: warga.id },
            data: {
              level_subsidi: mlResponse.data.level,
              kuota_liter: mlResponse.data.kuota_liter,
              ai_confidence: mlResponse.data.confidence || 0.0
            }
          });
          successCount++;
        }
      } catch (mlError) {
        console.error(`Gagal memprediksi warga ${warga.nik}:`, mlError.message);
      }
    }

    res.json({ success: true, message: `Berhasil memprediksi ${successCount} dari ${unpredicted.length} data` });
  } catch (error) {
    console.error("Error batchPredict:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.importWargaBulk = async (req, res) => {
  try {
    const data = req.body; // Expecting an array of objects
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ success: false, message: "Data tidak valid" });
    }

    // Map and sanitize the incoming data from Excel
    const formattedData = data.map(row => ({
      nik: String(row.nik || ""),
      nama_lengkap: String(row.nama_lengkap || ""),
      alamat: String(row.alamat || ""),
      kondisi_rumah: Number(row.kondisi_rumah) || 3,
      sumber_listrik: Number(row.sumber_listrik) || 3,
      kepemilikan_aset: Number(row.kepemilikan_aset) || 3,
      pendidikan_kk: Number(row.pendidikan_kk) || 3,
      jml_tanggungan: Number(row.jml_tanggungan) || 0,
      jenis_pekerjaan: Number(row.jenis_pekerjaan) || 3,
      akses_air: Number(row.akses_air) || 3,
      kepemilikan_lahan: Number(row.kepemilikan_lahan) || 3,
      level_subsidi: null,
      kuota_liter: null,
      ai_confidence: null
    })).filter(row => row.nik.trim() !== "" && row.nama_lengkap.trim() !== "");

    if (formattedData.length === 0) {
      return res.status(400).json({ success: false, message: "Tidak ada data yang valid untuk diimport. Pastikan kolom NIK dan Nama Lengkap terisi. Sample data mentah: " + JSON.stringify(data.slice(0, 1)) });
    }

    // Use createMany with skipDuplicates to ignore existing NIKs
    const result = await prisma.warga.createMany({
      data: formattedData,
      skipDuplicates: true,
    });

    res.json({ success: true, message: `Berhasil mengimport ${result.count} data warga baru.` });
  } catch (error) {
    console.error("Error import bulk:", error);
    res.status(500).json({ success: false, message: "Internal server error: " + error.message });
  }
};

exports.updateWarga = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      nik, nama_lengkap, alamat, kondisi_rumah, sumber_listrik, 
      kepemilikan_aset, pendidikan_kk, jml_tanggungan, jenis_pekerjaan, 
      akses_air, kepemilikan_lahan 
    } = req.body;

    const existingWarga = await prisma.warga.findUnique({ where: { id } });
    if (!existingWarga) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    if (nik && nik !== existingWarga.nik) {
      const nikExists = await prisma.warga.findUnique({ where: { nik } });
      if (nikExists) return res.status(400).json({ success: false, message: 'NIK sudah terdaftar pada warga lain' });
    }

    // Call Python ML Service to re-predict because socio-economic features might have changed
    let level_subsidi = existingWarga.level_subsidi;
    let kuota_liter = existingWarga.kuota_liter;
    let ai_confidence = existingWarga.ai_confidence;
    
    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
        kondisi_rumah: kondisi_rumah !== undefined ? kondisi_rumah : existingWarga.kondisi_rumah,
        sumber_listrik: sumber_listrik !== undefined ? sumber_listrik : existingWarga.sumber_listrik,
        kepemilikan_aset: kepemilikan_aset !== undefined ? kepemilikan_aset : existingWarga.kepemilikan_aset,
        pendidikan_kk: pendidikan_kk !== undefined ? pendidikan_kk : existingWarga.pendidikan_kk,
        jml_tanggungan: jml_tanggungan !== undefined ? jml_tanggungan : existingWarga.jml_tanggungan,
        jenis_pekerjaan: jenis_pekerjaan !== undefined ? jenis_pekerjaan : existingWarga.jenis_pekerjaan,
        akses_air: akses_air !== undefined ? akses_air : existingWarga.akses_air,
        kepemilikan_lahan: kepemilikan_lahan !== undefined ? kepemilikan_lahan : existingWarga.kepemilikan_lahan
      });
      
      if (mlResponse.data && mlResponse.data.level) {
        level_subsidi = mlResponse.data.level;
        kuota_liter = mlResponse.data.kuota_liter;
        if (mlResponse.data.confidence !== undefined) {
          ai_confidence = mlResponse.data.confidence;
        }
      }
    } catch (mlError) {
      console.error("ML Service error on update:", mlError.message);
    }

    const updated = await prisma.warga.update({
      where: { id },
      data: {
        nik, nama_lengkap, alamat, 
        kondisi_rumah, sumber_listrik, kepemilikan_aset, pendidikan_kk, 
        jml_tanggungan, jenis_pekerjaan, akses_air, kepemilikan_lahan,
        level_subsidi, kuota_liter, ai_confidence
      }
    });

    res.json({ success: true, message: 'Data berhasil diperbarui', data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteWarga = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.warga.delete({ where: { id } });
    res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};
