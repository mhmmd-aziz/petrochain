const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock /api/scan
exports.scanKTP = async (req, res, next) => {
  try {
    const { nik, spbu_id } = req.body;

    if (!nik || !spbu_id) {
      return res.status(400).json({ success: false, data: null, message: 'Missing nik or spbu_id' });
    }

    const warga = await prisma.warga.findUnique({
      where: { nik }
    });

    if (!warga) {
      return res.status(404).json({ success: false, data: null, message: 'Warga tidak ditemukan' });
    }

    if (warga.kuota_liter <= 0) {
      return res.status(403).json({ success: false, data: null, message: 'Kuota habis' });
    }

    res.json({
      success: true,
      data: {
        nama: warga.nama_lengkap,
        sisa_kuota: warga.kuota_liter,
        status: "authorized"
      },
      message: 'Scan berhasil'
    });

  } catch (error) {
    next(error);
  }
};

// Mock /api/transaksi/complete
exports.completeTransaksi = async (req, res, next) => {
  try {
    const { nik, spbu_id, liter_real } = req.body;

    if (!nik || !spbu_id || liter_real === undefined) {
      return res.status(400).json({ success: false, data: null, message: 'Missing parameters' });
    }

    const warga = await prisma.warga.findUnique({
      where: { nik }
    });

    if (!warga) {
      return res.status(404).json({ success: false, data: null, message: 'Warga tidak ditemukan' });
    }

    if (warga.kuota_liter < liter_real) {
      return res.status(400).json({ success: false, data: null, message: 'Liter melebihi sisa kuota' });
    }

    // Update sisa kuota
    const updatedWarga = await prisma.warga.update({
      where: { id: warga.id },
      data: { kuota_liter: warga.kuota_liter - liter_real }
    });

    // Record transaction
    const transaksi = await prisma.transaksi.create({
      data: {
        warga_id: warga.id,
        spbu_id,
        liter: liter_real,
        level_subsidi: warga.level_subsidi,
        // blockchain_tx is empty for now
      }
    });

    res.json({
      success: true,
      data: {
        transaksi_id: transaksi.id,
        sisa_kuota_baru: updatedWarga.kuota_liter
      },
      message: 'Transaksi selesai dan kuota dipotong'
    });

  } catch (error) {
    next(error);
  }
};
