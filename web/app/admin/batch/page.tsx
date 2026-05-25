"use client";

import { useEffect, useState } from "react";
import { Layers, Play, Database, AlertCircle, CheckCircle2, Upload, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";

export default function BatchPrediction() {
  const [unpredictedList, setUnpredictedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/warga", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Filter only unpredicted warga
        const unpredicted = data.data.list.filter((w: any) => w.level_subsidi === null);
        setUnpredictedList(unpredicted);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDummy = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/warga/bulk-dummy", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Gagal menambah data simulasi' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchPredict = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/warga/batch-predict", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchData(); // Refresh list (should be empty now)
      } else {
        setMessage({ type: 'error', text: 'Gagal memprediksi data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'NIK': '1234567812345678',
        'Nama Lengkap': 'Siti Rahayu',
        'Alamat': 'Jl. Mawar No. 5, Banda Aceh',
        'Kondisi Rumah': 2,
        'Sumber Listrik': 2,
        'Kepemilikan Aset': 1,
        'Pendidikan KK': 3,
        'Jumlah Tanggungan': 3,
        'Jenis Pekerjaan': 3,
        'Akses Air': 2,
        'Kepemilikan Lahan': 1,
        'Kategori Kendaraan': 'motor_pribadi',
      },
      {
        'NIK': '9876543298765432',
        'Nama Lengkap': 'Budi Santoso',
        'Alamat': 'Jl. Melati No. 12, Banda Aceh',
        'Kondisi Rumah': 2,
        'Sumber Listrik': 3,
        'Kepemilikan Aset': 2,
        'Pendidikan KK': 4,
        'Jumlah Tanggungan': 2,
        'Jenis Pekerjaan': 5,
        'Akses Air': 3,
        'Kepemilikan Lahan': 1,
        'Kategori Kendaraan': 'motor_produktif',
      },
      {
        'NIK': '1122334455667788',
        'Nama Lengkap': 'Ahmad Fauzi',
        'Alamat': 'Jl. Kenanga No. 3, Aceh Besar',
        'Kondisi Rumah': 3,
        'Sumber Listrik': 3,
        'Kepemilikan Aset': 2,
        'Pendidikan KK': 3,
        'Jumlah Tanggungan': 4,
        'Jenis Pekerjaan': 5,
        'Akses Air': 2,
        'Kepemilikan Lahan': 2,
        'Kategori Kendaraan': 'mobil_produktif',
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    // Set lebar kolom agar mudah dibaca
    worksheet['!cols'] = [
      { wch: 18 }, { wch: 22 }, { wch: 30 }, { wch: 14 }, { wch: 14 },
      { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 10 },
      { wch: 16 }, { wch: 22 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Import");
    XLSX.writeFile(workbook, "Template_Import_PetroChain.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActionLoading(true);
    setMessage(null);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const VALID_KATEGORI = ['motor_pribadi', 'motor_produktif', 'mobil_produktif'];
      const mappedData = jsonData.map((row: any) => {
        const rawKategori = (row['Kategori Kendaraan'] || row.kategori_kendaraan || 'motor_pribadi')
          .toString().toLowerCase().trim().replace(/\s+/g, '_');
        const kategori = VALID_KATEGORI.includes(rawKategori) ? rawKategori : 'motor_pribadi';
        return {
          nik: row.NIK || row.nik,
          nama_lengkap: row['Nama Lengkap'] || row.nama_lengkap || row.nama,
          alamat: row.Alamat || row.alamat,
          kondisi_rumah: row['Kondisi Rumah'] || row.kondisi_rumah || 3,
          sumber_listrik: row['Sumber Listrik'] || row.sumber_listrik || 3,
          kepemilikan_aset: row['Kepemilikan Aset'] || row.kepemilikan_aset || 3,
          pendidikan_kk: row['Pendidikan KK'] || row.pendidikan_kk || 3,
          jml_tanggungan: row['Jumlah Tanggungan'] || row.jml_tanggungan || 0,
          jenis_pekerjaan: row['Jenis Pekerjaan'] || row.jenis_pekerjaan || 3,
          akses_air: row['Akses Air'] || row.akses_air || 3,
          kepemilikan_lahan: row['Kepemilikan Lahan'] || row.kepemilikan_lahan || 3,
          kategori_kendaraan: kategori,
        };
      });

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/warga/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(mappedData)
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchData();
      } else {
        setMessage({ type: 'error', text: "Gagal mengimport data: " + result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Gagal memproses file Excel" });
    } finally {
      setActionLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-red" /> Batch Prediksi AI
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Evaluasi data warga dalam jumlah besar secara otomatis menggunakan model Machine Learning.</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {message && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-lg flex gap-3 text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
            <button
              onClick={handleDownloadTemplate}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg transition-colors border border-slate-300 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" /> Download Template
            </button>
            <label className={`cursor-pointer flex items-center justify-center gap-2 bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-300 text-indigo-700 font-bold py-3 px-6 rounded-lg transition-colors ${actionLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload className="w-4 h-4" /> Import Excel
              <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} disabled={actionLoading} />
            </label>
            <button
              onClick={handleGenerateDummy}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              <Database className="w-4 h-4" /> Tambah 10 Data Simulasi
            </button>
            <button
              onClick={handleBatchPredict}
              disabled={actionLoading || unpredictedList.length === 0}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-brand-red text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" /> Prediksi Massal AI ({unpredictedList.length} Data)
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-700 text-sm">Menunggu Prediksi: {unpredictedList.length} Warga</span>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white text-xs uppercase font-bold text-slate-500 sticky top-0 border-b border-slate-200 shadow-sm">
                  <tr>
                    <th className="px-4 py-3">NIK</th>
                    <th className="px-4 py-3">Nama Warga</th>
                    <th className="px-4 py-3">Alamat</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500 font-semibold">Memuat data...</td>
                    </tr>
                  ) : unpredictedList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
                          <p className="text-slate-600 font-bold">Semua data warga telah diprediksi!</p>
                          <p className="text-slate-400 text-sm mt-1">Anda bisa menambah data simulasi untuk mencoba fitur ini.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    unpredictedList.map((warga: any) => (
                      <tr key={warga.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{warga.nik}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{warga.nama_lengkap}</td>
                        <td className="px-4 py-3 text-xs truncate max-w-[200px]" title={warga.alamat}>{warga.alamat}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 rounded bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold">Belum Ada AI</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
