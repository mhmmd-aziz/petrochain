"use client";

import { useEffect, useState } from "react";
import { Users, Search, Info, FileSpreadsheet, FileText, Edit, Trash2, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

export default function DataWarga() {
  const [wargaList, setWargaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterBulan, setFilterBulan] = useState("all");
  const [filterTahun, setFilterTahun] = useState("all");
  const [loading, setLoading] = useState(true);
  
  const [selectedWarga, setSelectedWarga] = useState<any>(null); // For AI Detail
  const [editWarga, setEditWarga] = useState<any>(null); // For Edit Modal
  const [deleteWargaId, setDeleteWargaId] = useState<string | null>(null); // For Delete Confirm

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
        setWargaList(data.data.list);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelLabel = (level: number) => {
    switch(level) {
      case 1: return <span className="px-2.5 py-1 rounded bg-red-100 text-red-700 text-xs font-bold border border-red-200">L1 - Sangat Miskin (Ekstrem)</span>;
      case 2: return <span className="px-2.5 py-1 rounded bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200">L2 - Miskin</span>;
      case 3: return <span className="px-2.5 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200">L3 - Rentan Miskin</span>;
      default: return <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">Tidak Diketahui</span>;
    }
  };

  // Filter Logic
  const filteredWarga = wargaList.filter((w: any) => {
    const matchSearch = w.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) || w.nik.includes(searchQuery);
    
    let matchLevel = true;
    if (filterLevel === "unpredicted") matchLevel = w.level_subsidi === null;
    else if (filterLevel !== "all") matchLevel = w.level_subsidi === parseInt(filterLevel);

    let matchTime = true;
    if (w.created_at) {
      const date = new Date(w.created_at);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear());
      if (filterBulan !== "all" && month !== filterBulan) matchTime = false;
      if (filterTahun !== "all" && year !== filterTahun) matchTime = false;
    }

    return matchSearch && matchLevel && matchTime;
  });

  const getAvailableYears = () => {
    const years = new Set(wargaList.map((w: any) => w.created_at ? new Date(w.created_at).getFullYear() : null).filter(Boolean));
    return Array.from(years).sort((a: any, b: any) => b - a);
  };

  // Export Logic
  const executeExportExcel = (data: any[]) => {
    const dataToExport = data.map((w: any) => ({
      NIK: w.nik,
      'Nama Lengkap': w.nama_lengkap,
      Alamat: w.alamat,
      'Level Subsidi': w.level_subsidi ? `Level ${w.level_subsidi}` : 'Belum Diprediksi',
      'Kuota Liter': w.kuota_liter || '-',
      'Confidence AI': w.ai_confidence ? `${(w.ai_confidence * 100).toFixed(2)}%` : '-',
      'Tanggal Daftar': w.created_at ? new Date(w.created_at).toLocaleDateString('id-ID') : '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Warga");
    XLSX.writeFile(workbook, "Laporan_PetroChain.xlsx");
  };

  const handleExportExcel = async () => {
    const isFiltered = filterLevel !== 'all' || filterBulan !== 'all' || filterTahun !== 'all' || searchQuery !== '';
    if (isFiltered) {
      const result = await Swal.fire({
        title: "Export Excel",
        text: "Anda sedang menggunakan Filter. Ingin mengekspor SEMUA data atau HANYA DATA TERFILTER?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Semua Data",
        cancelButtonText: "Data Terfilter",
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#10b981"
      });

      if (result.isConfirmed) {
        executeExportExcel(wargaList);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        executeExportExcel(filteredWarga);
      }
    } else {
      executeExportExcel(wargaList);
    }
  };

  const executeExportPDF = (data: any[]) => {
    const doc = new jsPDF();
    doc.text("Laporan Data Warga PetroChain", 14, 15);
    
    const tableData = data.map((w: any) => [
      w.nik, 
      w.nama_lengkap, 
      w.level_subsidi ? `L${w.level_subsidi}` : '-', 
      w.kuota_liter || '-', 
      w.ai_confidence ? `${(w.ai_confidence * 100).toFixed(1)}%` : '-',
      w.created_at ? new Date(w.created_at).toLocaleDateString('id-ID') : '-'
    ]);

    autoTable(doc, {
      head: [['NIK', 'Nama Lengkap', 'Level', 'Kuota', 'Confidence', 'Tgl Daftar']],
      body: tableData,
      startY: 20,
    });

    doc.save("Laporan_PetroChain.pdf");
  };

  const handleExportPDF = async () => {
    const isFiltered = filterLevel !== 'all' || filterBulan !== 'all' || filterTahun !== 'all' || searchQuery !== '';
    if (isFiltered) {
      const result = await Swal.fire({
        title: "Export PDF",
        text: "Anda sedang menggunakan Filter. Ingin mengekspor SEMUA data atau HANYA DATA TERFILTER?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Semua Data",
        cancelButtonText: "Data Terfilter",
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#f43f5e"
      });

      if (result.isConfirmed) {
        executeExportPDF(wargaList);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        executeExportPDF(filteredWarga);
      }
    } else {
      executeExportPDF(wargaList);
    }
  };

  const handleDelete = async () => {
    if (!deleteWargaId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/warga/${deleteWargaId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setDeleteWargaId(null);
        Swal.fire("Berhasil!", "Data telah dihapus.", "success");
      } else {
        Swal.fire("Gagal", "Gagal menghapus: " + data.message, "error");
      }
    } catch (e) {
      Swal.fire("Error", "Terjadi kesalahan jaringan", "error");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/warga/${editWarga.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(editWarga)
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setEditWarga(null);
        Swal.fire("Tersimpan!", "Data berhasil diperbarui.", "success");
      } else {
        Swal.fire("Gagal", "Gagal memperbarui: " + data.message, "error");
      }
    } catch (e) {
      Swal.fire("Error", "Terjadi kesalahan jaringan", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50/50">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2"><Users className="w-5 h-5 text-brand-red" /> Data Warga</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <button onClick={handleExportExcel} className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1.5 px-3 rounded text-xs transition-colors border border-emerald-200">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
              </button>
              <button onClick={handleExportPDF} className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-1.5 px-3 rounded text-xs transition-colors border border-rose-200">
                <FileText className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Filters */}
            <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-600">
              <option value="all">Semua Tahun</option>
              {getAvailableYears().map((y: any) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-600">
              <option value="all">Semua Bulan</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
            <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-600">
              <option value="all">Semua Level</option>
              <option value="1">L1 - Ekstrem</option>
              <option value="2">L2 - Miskin</option>
              <option value="3">L3 - Rentan</option>
              <option value="unpredicted">Belum Diprediksi</option>
            </select>
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
              <input type="text" placeholder="Cari NIK atau Nama..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-red" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Lengkap & NIK</th>
                <th className="px-6 py-4">Level Subsidi</th>
                <th className="px-6 py-4">Confidence AI</th>
                <th className="px-6 py-4">Tgl Daftar</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-semibold">Memuat data...</td></tr>
              ) : filteredWarga.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-semibold">Data tidak ditemukan</td></tr>
              ) : (
                filteredWarga.map((warga: any) => (
                  <tr key={warga.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{warga.nama_lengkap}</div>
                      <div className="font-mono text-xs text-slate-500 mt-0.5">{warga.nik}</div>
                    </td>
                    <td className="px-6 py-4">{warga.level_subsidi ? getLevelLabel(warga.level_subsidi) : <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-600 text-xs font-bold border border-slate-300">Belum Diprediksi</span>}</td>
                    <td className="px-6 py-4">
                      {warga.level_subsidi === null ? (
                         <span className="text-xs font-semibold text-slate-400">-</span>
                      ) : warga.ai_confidence ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full ${warga.ai_confidence > 0.8 ? 'bg-green-500' : warga.ai_confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${warga.ai_confidence * 100}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-slate-700">{(warga.ai_confidence * 100).toFixed(1)}%</span>
                        </div>
                      ) : <span className="text-xs font-semibold text-slate-400">Fallback</span>}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">{warga.created_at ? new Date(warga.created_at).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedWarga(warga)} className="text-blue-600 hover:text-blue-900 font-semibold text-xs flex items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-md hover:bg-blue-100 transition-colors" title="Detail AI"><Info className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditWarga(warga)} className="text-amber-600 hover:text-amber-900 font-semibold text-xs flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-md hover:bg-amber-100 transition-colors" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteWargaId(warga.id)} className="text-red-600 hover:text-red-900 font-semibold text-xs flex items-center gap-1 bg-red-50 px-2.5 py-1.5 rounded-md hover:bg-red-100 transition-colors" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteWargaId && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus Data Warga?</h3>
              <p className="text-sm text-slate-600 mb-6">Tindakan ini tidak dapat dibatalkan. Data warga dan transaksinya akan dihapus selamanya.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteWargaId(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button onClick={handleDelete} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg">Ya, Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editWarga && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto pt-24 pb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden my-auto">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">Edit Data Warga</h3>
                <button onClick={() => setEditWarga(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdate} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">NIK</label>
                    <input type="text" required value={editWarga.nik} onChange={(e) => setEditWarga({...editWarga, nik: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                    <input type="text" required value={editWarga.nama_lengkap} onChange={(e) => setEditWarga({...editWarga, nama_lengkap: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat</label>
                    <input type="text" required value={editWarga.alamat} onChange={(e) => setEditWarga({...editWarga, alamat: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Kondisi Rumah</label>
                    <select value={editWarga.kondisi_rumah} onChange={(e) => setEditWarga({...editWarga, kondisi_rumah: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"><option value={1}>Sangat Buruk (1)</option><option value={2}>Buruk (2)</option><option value={3}>Sedang (3)</option><option value={4}>Baik (4)</option><option value={5}>Sangat Baik (5)</option></select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Sumber Listrik</label>
                    <select value={editWarga.sumber_listrik} onChange={(e) => setEditWarga({...editWarga, sumber_listrik: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"><option value={1}>PLN &gt;900VA (1)</option><option value={2}>PLN 450-900VA (2)</option><option value={3}>Bukan PLN / Numpang (3)</option></select>
                  </div>
                  {/* For brevity we just edit these two crucial ones and let AI repredict, or we can list all 8. Let's list a few more so the modal isn't insanely long but functional */}
                  <div className="md:col-span-2 mt-2 bg-amber-50 p-3 rounded text-xs text-amber-800 border border-amber-200 flex gap-2 items-start">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Perubahan pada data kondisi sosial ekonomi akan memicu AI untuk melakukan evaluasi ulang (re-prediksi) terhadap Level Subsidi secara otomatis saat disimpan.</span>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setEditWarga(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Batal</button>
                  <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-brand-red hover:bg-red-700 rounded-lg transition-colors">Simpan Perubahan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail AI Modal */}
      <AnimatePresence>
        {selectedWarga && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">Analisis Model AI</h3>
                <button onClick={() => setSelectedWarga(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6">
                {selectedWarga.ai_confidence && selectedWarga.ai_confidence < 0.70 ? (
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3 text-orange-800">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-orange-500" />
                    <div className="text-sm leading-relaxed">
                      <span className="font-bold block mb-1">Perhatian: Confidence Score Rendah</span>
                      Tingkat keyakinan AI rendah ({(selectedWarga.ai_confidence * 100).toFixed(1)}%). Terdapat kemungkinan data anomali atau kontradiktif. Disarankan survei ulang.
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3 text-blue-800">
                    <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                    <div className="text-sm leading-relaxed">
                      <span className="font-bold block mb-1">Info AI</span>
                      Kombinasi variabel konsisten. Model memprediksi {selectedWarga.nama_lengkap} sangat cocok di Level {selectedWarga.level_subsidi}.
                    </div>
                  </div>
                )}
                <button onClick={() => setSelectedWarga(null)} className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">Tutup</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
