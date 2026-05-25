"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users, Search, Info, FileSpreadsheet, FileText,
  Edit, Trash2, X, AlertCircle, ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

// ── Konstanta ──────────────────────────────────────────────────────────────
const KATEGORI_META: Record<string, { label: string; kuota: number; color: string }> = {
  motor_pribadi:   { label: "Motor Pribadi",   kuota: 50,  color: "bg-slate-100 text-slate-700 border-slate-300" },
  motor_produktif: { label: "Motor Produktif", kuota: 100, color: "bg-blue-50 text-blue-700 border-blue-200" },
  mobil_produktif: { label: "Mobil Produktif", kuota: 350, color: "bg-amber-50 text-amber-700 border-amber-200" },
};

const LEVEL_META: Record<number, { label: string; color: string }> = {
  1: { label: "L1 — Miskin Ekstrem", color: "bg-red-50 text-red-700 border-red-200" },
  2: { label: "L2 — Miskin",         color: "bg-orange-50 text-orange-700 border-orange-200" },
  3: { label: "L3 — Rentan Miskin",  color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
};

const ITEMS_PER_PAGE = 20;

// ── Helper Components ──────────────────────────────────────────────────────
const Badge = ({ text, colorClass }: { text: string; colorClass: string }) => (
  <span className={`inline-block px-2 py-0.5 rounded border text-xs font-semibold ${colorClass}`}>{text}</span>
);

const ConfidenceBar = ({ value }: { value: number }) => {
  const pct = Math.round(value * 100);
  const color = value >= 0.8 ? "bg-emerald-500" : value >= 0.5 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-600 tabular-nums">{pct}%</span>
    </div>
  );
};

// ── Select Helper ──────────────────────────────────────────────────────────
const Sel = ({ label, name, value, onChange, children }: any) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
    <select name={name} value={value} onChange={onChange}
      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300">
      {children}
    </select>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
export default function DataWarga() {
  const [wargaList, setWargaList]   = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearchQuery]   = useState("");
  const [filterLevel, setFilterLevel]   = useState("all");
  const [filterKategori, setFilterKategori] = useState("all");
  const [filterBulan, setFilterBulan]   = useState("all");
  const [filterTahun, setFilterTahun]   = useState("all");
  const [page, setPage]             = useState(1);

  const [selectedWarga, setSelectedWarga] = useState<any>(null);
  const [editWarga,     setEditWarga]     = useState<any>(null);
  const [deleteId,      setDeleteId]      = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/warga", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setWargaList(data.data.list);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  // ── Filter + Search ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return wargaList.filter((w: any) => {
      const q = searchQuery.toLowerCase();
      if (q && !w.nama_lengkap.toLowerCase().includes(q) && !w.nik.includes(q)) return false;
      if (filterLevel === "unpredicted" && w.level_subsidi !== null) return false;
      if (filterLevel !== "all" && filterLevel !== "unpredicted" && w.level_subsidi !== parseInt(filterLevel)) return false;
      if (filterKategori !== "all" && w.kategori_kendaraan !== filterKategori) return false;
      if (w.created_at) {
        const d = new Date(w.created_at);
        if (filterBulan !== "all" && String(d.getMonth() + 1).padStart(2, "0") !== filterBulan) return false;
        if (filterTahun !== "all" && String(d.getFullYear()) !== filterTahun) return false;
      }
      return true;
    });
  }, [wargaList, searchQuery, filterLevel, filterKategori, filterBulan, filterTahun]);

  const years = useMemo(() =>
    [...new Set(wargaList.map((w: any) => w.created_at ? new Date(w.created_at).getFullYear() : null).filter(Boolean))].sort((a: any, b: any) => b - a),
    [wargaList]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // reset ke page 1 saat filter berubah
  useEffect(() => { setPage(1); }, [searchQuery, filterLevel, filterKategori, filterBulan, filterTahun]);

  // ── Export ───────────────────────────────────────────────────────────────
  const buildExportData = (data: any[]) => data.map(w => ({
    NIK:                  w.nik,
    "Nama Lengkap":       w.nama_lengkap,
    Alamat:               w.alamat || "-",
    "Level Subsidi":      w.level_subsidi ? `Level ${w.level_subsidi}` : "Belum Diprediksi",
    "Kategori Kendaraan": KATEGORI_META[w.kategori_kendaraan]?.label || w.kategori_kendaraan || "-",
    "No. Polisi":         w.no_polisi || "-",
    "Kuota (L/bln)":      w.kuota_liter ?? "-",
    "Confidence AI":      w.ai_confidence ? `${(w.ai_confidence * 100).toFixed(1)}%` : "-",
    "Diverifikasi Oleh":  w.verified_by || "-",
    "Tgl Verifikasi":     w.tanggal_verifikasi ? new Date(w.tanggal_verifikasi).toLocaleDateString("id-ID") : "-",
    "Tgl Daftar":         w.created_at ? new Date(w.created_at).toLocaleDateString("id-ID") : "-",
  }));

  const doExportExcel = (data: any[]) => {
    const ws = XLSX.utils.json_to_sheet(buildExportData(data));
    ws["!cols"] = Array(11).fill({ wch: 20 });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Warga");
    XLSX.writeFile(wb, "Laporan_PetroChain.xlsx");
  };

  const doExportPDF = (data: any[]) => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(13);
    doc.text("Laporan Data Warga PetroChain", 14, 14);
    doc.setFontSize(9);
    doc.text(`Diekspor: ${new Date().toLocaleDateString("id-ID")} | Total: ${data.length} warga`, 14, 20);
    autoTable(doc, {
      head: [["NIK", "Nama Lengkap", "Level", "Kategori", "No. Polisi", "Kuota", "Conf.", "Verified By", "Tgl Daftar"]],
      body: data.map(w => [
        w.nik, w.nama_lengkap,
        w.level_subsidi ? `L${w.level_subsidi}` : "-",
        KATEGORI_META[w.kategori_kendaraan]?.label || "-",
        w.no_polisi || "-",
        w.kuota_liter ? `${w.kuota_liter}L` : "-",
        w.ai_confidence ? `${(w.ai_confidence * 100).toFixed(0)}%` : "-",
        w.verified_by || "-",
        w.created_at ? new Date(w.created_at).toLocaleDateString("id-ID") : "-",
      ]),
      startY: 24, styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59] },
    });
    doc.save("Laporan_PetroChain.pdf");
  };

  const handleExport = async (type: "excel" | "pdf") => {
    const isFiltered = filterLevel !== "all" || filterKategori !== "all" || filterBulan !== "all" || filterTahun !== "all" || searchQuery !== "";
    let targetData = wargaList;
    if (isFiltered) {
      const res = await Swal.fire({
        title: `Export ${type === "excel" ? "Excel" : "PDF"}`,
        text: "Ekspor semua data atau hanya data yang difilter?",
        icon: "question", showCancelButton: true,
        confirmButtonText: "Semua Data", cancelButtonText: "Data Terfilter",
        confirmButtonColor: "#1e293b", cancelButtonColor: "#3b82f6",
      });
      if (res.dismiss === Swal.DismissReason.cancel) targetData = filtered;
      else if (!res.isConfirmed) return;
    }
    type === "excel" ? doExportExcel(targetData) : doExportPDF(targetData);
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/warga/${deleteId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) { fetchData(); setDeleteId(null); Swal.fire("Berhasil!", "Data telah dihapus.", "success"); }
      else Swal.fire("Gagal", data.message, "error");
    } catch { Swal.fire("Error", "Kesalahan jaringan", "error"); }
  };

  // ── Update ───────────────────────────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/warga/${editWarga.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editWarga),
      });
      const data = await res.json();
      if (data.success) { fetchData(); setEditWarga(null); Swal.fire("Tersimpan!", "Data diperbarui.", "success"); }
      else Swal.fire("Gagal", data.message, "error");
    } catch { Swal.fire("Error", "Kesalahan jaringan", "error"); }
  };

  const editChange = (field: string, val: any) => setEditWarga((prev: any) => ({ ...prev, [field]: val }));
  const editKat = editWarga ? (KATEGORI_META[editWarga.kategori_kendaraan] || {}) : {};
  const editButuhNoPol = editWarga && ["motor_produktif", "mobil_produktif"].includes(editWarga.kategori_kendaraan);

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-red" />
              <h2 className="text-base font-bold text-slate-900">Data Warga</h2>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs font-bold tabular-nums">
                {filtered.length} / {wargaList.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleExport("excel")}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-1.5 px-3 rounded text-xs border border-emerald-200 transition-colors">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
              </button>
              <button onClick={() => handleExport("pdf")}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold py-1.5 px-3 rounded text-xs border border-rose-200 transition-colors">
                <FileText className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Cari NIK atau Nama..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-red focus:outline-none" />
            </div>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none">
              <option value="all">Semua Level</option>
              <option value="1">L1 — Miskin Ekstrem</option>
              <option value="2">L2 — Miskin</option>
              <option value="3">L3 — Rentan Miskin</option>
              <option value="unpredicted">Belum Diprediksi</option>
            </select>
            <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none">
              <option value="all">Semua Kendaraan</option>
              <option value="motor_pribadi">Motor Pribadi</option>
              <option value="motor_produktif">Motor Produktif</option>
              <option value="mobil_produktif">Mobil Produktif</option>
            </select>
            <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none">
              <option value="all">Semua Tahun</option>
              {years.map((y: any) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filterBulan} onChange={e => setFilterBulan(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none">
              <option value="all">Semua Bulan</option>
              {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
                .map((m, i) => <option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3">Nama & NIK</th>
                <th className="px-5 py-3">Level Subsidi</th>
                <th className="px-5 py-3">Kendaraan</th>
                <th className="px-5 py-3">No. Polisi</th>
                <th className="px-5 py-3 text-center">Kuota</th>
                <th className="px-5 py-3">Confidence AI</th>
                <th className="px-5 py-3">Tgl Daftar</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400 font-medium">Memuat data...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400 font-medium">Tidak ada data yang sesuai filter</td></tr>
              ) : paginated.map((w: any) => {
                const katMeta  = KATEGORI_META[w.kategori_kendaraan];
                const lvlMeta  = w.level_subsidi ? LEVEL_META[w.level_subsidi] : null;
                return (
                  <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900 text-sm">{w.nama_lengkap}</div>
                      <div className="font-mono text-xs text-slate-400 mt-0.5">{w.nik}</div>
                    </td>
                    <td className="px-5 py-3">
                      {lvlMeta
                        ? <Badge text={lvlMeta.label} colorClass={lvlMeta.color} />
                        : <span className="text-xs text-slate-400 font-medium">Belum Diprediksi</span>}
                    </td>
                    <td className="px-5 py-3">
                      {katMeta
                        ? <Badge text={katMeta.label} colorClass={katMeta.color} />
                        : <span className="text-xs text-slate-400">-</span>}
                    </td>
                    <td className="px-5 py-3">
                      {w.no_polisi
                        ? <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{w.no_polisi}</span>
                        : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {w.kuota_liter
                        ? <span className="font-bold text-sm text-slate-800">{w.kuota_liter}<span className="text-xs font-normal text-slate-400 ml-0.5">L</span></span>
                        : <span className="text-xs text-slate-400">-</span>}
                    </td>
                    <td className="px-5 py-3">
                      {w.ai_confidence
                        ? <ConfidenceBar value={Number(w.ai_confidence)} />
                        : <span className="text-xs text-slate-400">-</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {w.created_at ? new Date(w.created_at).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setSelectedWarga(w)} title="Detail"
                          className="p-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditWarga({ ...w })} title="Edit"
                          className="p-1.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteId(w.id)} title="Hapus"
                          className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-xs text-slate-500">
              Halaman <span className="font-bold">{page}</span> dari <span className="font-bold">{totalPages}</span>
              {" "}— menampilkan {((page-1)*ITEMS_PER_PAGE)+1}–{Math.min(page*ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} data
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="p-1.5 rounded-md border border-slate-300 hover:bg-white disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = page <= 3 ? i+1 : page >= totalPages-2 ? totalPages-4+i : page-2+i;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`w-8 h-8 text-xs font-bold rounded-md border transition-colors
                      ${pg === page ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 hover:bg-white text-slate-600"}`}>
                    {pg}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="p-1.5 rounded-md border border-slate-300 hover:bg-white disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal: Delete Confirm ──────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-2">Hapus Data Warga?</h3>
              <p className="text-sm text-slate-500 mb-6">Tindakan ini permanen. Seluruh data dan riwayat transaksi warga ini akan dihapus.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Batal</button>
                <button onClick={handleDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Edit ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editWarga && (
          <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 z-50 overflow-y-auto py-10">
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Data Warga</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Perubahan akan memicu re-evaluasi AI secara otomatis</p>
                </div>
                <button onClick={() => setEditWarga(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-5">
                {/* Identitas */}
                <div className="grid grid-cols-2 gap-4">
                  <Sel label="NIK" name="nik" value={editWarga.nik} onChange={(e:any)=>editChange("nik",e.target.value)}>
                    <option value={editWarga.nik}>{editWarga.nik}</option>
                  </Sel>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nama Lengkap</label>
                    <input value={editWarga.nama_lengkap} onChange={e=>editChange("nama_lengkap",e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Alamat</label>
                    <input value={editWarga.alamat || ""} onChange={e=>editChange("alamat",e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                  </div>
                </div>

                {/* Kendaraan */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Kendaraan & Verifikasi</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Sel label="Kategori Kendaraan" name="kategori_kendaraan" value={editWarga.kategori_kendaraan}
                      onChange={(e:any)=>editChange("kategori_kendaraan",e.target.value)}>
                      <option value="motor_pribadi">Motor Pribadi (50 L/bln)</option>
                      <option value="motor_produktif">Motor Produktif (100 L/bln)</option>
                      <option value="mobil_produktif">Mobil Produktif (350 L/bln)</option>
                    </Sel>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        No. Polisi {editButuhNoPol && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        value={editWarga.no_polisi || ""}
                        onChange={e=>editChange("no_polisi",e.target.value.toUpperCase())}
                        placeholder={editButuhNoPol ? "Wajib untuk kategori produktif" : "Opsional"}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Sosio-Ekonomi */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Indikator Sosio-Ekonomi</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Sel label="Kondisi Rumah" name="kondisi_rumah" value={editWarga.kondisi_rumah} onChange={(e:any)=>editChange("kondisi_rumah",parseInt(e.target.value))}>
                      {[{v:1,l:"1 — Sangat Buruk"},{v:2,l:"2 — Buruk"},{v:3,l:"3 — Sedang"},{v:4,l:"4 — Baik"},{v:5,l:"5 — Sangat Baik"}].map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                    </Sel>
                    <Sel label="Sumber Listrik" name="sumber_listrik" value={editWarga.sumber_listrik} onChange={(e:any)=>editChange("sumber_listrik",parseInt(e.target.value))}>
                      {[{v:1,l:"1 — Tidak Ada"},{v:2,l:"2 — Genset"},{v:3,l:"3 — PLN Prasejahtera"},{v:4,l:"4 — PLN Normal"}].map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                    </Sel>
                    <Sel label="Kepemilikan Aset" name="kepemilikan_aset" value={editWarga.kepemilikan_aset} onChange={(e:any)=>editChange("kepemilikan_aset",parseInt(e.target.value))}>
                      {[{v:1,l:"1 — Tidak Ada"},{v:2,l:"2 — 1 Aset"},{v:3,l:"3 — 2 Aset"},{v:4,l:"4 — 3+ Aset"}].map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                    </Sel>
                    <Sel label="Pendidikan KK" name="pendidikan_kk" value={editWarga.pendidikan_kk} onChange={(e:any)=>editChange("pendidikan_kk",parseInt(e.target.value))}>
                      {[{v:1,l:"1 — Tidak Sekolah"},{v:2,l:"2 — SD"},{v:3,l:"3 — SMP"},{v:4,l:"4 — SMA"},{v:5,l:"5 — D3"},{v:6,l:"6 — S1+"}].map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                    </Sel>
                    <Sel label="Jenis Pekerjaan" name="jenis_pekerjaan" value={editWarga.jenis_pekerjaan} onChange={(e:any)=>editChange("jenis_pekerjaan",parseInt(e.target.value))}>
                      {[{v:1,l:"1 — Tidak Bekerja"},{v:2,l:"2 — Buruh Harian"},{v:3,l:"3 — Nelayan/Petani"},{v:4,l:"4 — Pedagang"},{v:5,l:"5 — Ojek/Driver"},{v:6,l:"6 — Karyawan Tetap"}].map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                    </Sel>
                    <Sel label="Jumlah Tanggungan" name="jml_tanggungan" value={editWarga.jml_tanggungan} onChange={(e:any)=>editChange("jml_tanggungan",parseInt(e.target.value))}>
                      {Array.from({length:13},(_,i)=><option key={i} value={i}>{i} orang</option>)}
                    </Sel>
                    <Sel label="Akses Air" name="akses_air" value={editWarga.akses_air} onChange={(e:any)=>editChange("akses_air",parseInt(e.target.value))}>
                      {[{v:1,l:"1 — Tidak Ada"},{v:2,l:"2 — Sumur Gali"},{v:3,l:"3 — Sumur Bor"},{v:4,l:"4 — PDAM"}].map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                    </Sel>
                    <Sel label="Kepemilikan Lahan" name="kepemilikan_lahan" value={editWarga.kepemilikan_lahan} onChange={(e:any)=>editChange("kepemilikan_lahan",parseInt(e.target.value))}>
                      {[{v:1,l:"1 — Tidak Punya"},{v:2,l:"2 — Sewa/Kontrak"},{v:3,l:"3 — Milik Sendiri"}].map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                    </Sel>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setEditWarga(null)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Batal</button>
                  <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-brand-red rounded-lg transition-colors">Simpan Perubahan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Detail AI ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedWarga && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-base font-bold text-slate-900">Detail Warga</h3>
                <button onClick={() => setSelectedWarga(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                {/* Alert confidence */}
                {selectedWarga.ai_confidence && Number(selectedWarga.ai_confidence) < 0.70 ? (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <span><span className="font-bold">Confidence Rendah ({(Number(selectedWarga.ai_confidence)*100).toFixed(1)}%)</span> — Data mungkin anomali. Disarankan survei ulang.</span>
                  </div>
                ) : selectedWarga.level_subsidi ? (
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                    <span><span className="font-bold">Data Valid</span> — Kombinasi variabel konsisten. Model memiliki keyakinan tinggi.</span>
                  </div>
                ) : null}

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Nama",         selectedWarga.nama_lengkap],
                    ["NIK",          <span className="font-mono text-xs">{selectedWarga.nik}</span>],
                    ["Level Subsidi", selectedWarga.level_subsidi ? LEVEL_META[selectedWarga.level_subsidi]?.label : "Belum Diprediksi"],
                    ["Kuota BBM",    selectedWarga.kuota_liter ? `${selectedWarga.kuota_liter} L/bulan` : "-"],
                    ["Kategori",     KATEGORI_META[selectedWarga.kategori_kendaraan]?.label || "-"],
                    ["No. Polisi",   selectedWarga.no_polisi || "Tidak Ada"],
                    ["Confidence AI", selectedWarga.ai_confidence ? `${(Number(selectedWarga.ai_confidence)*100).toFixed(2)}%` : "-"],
                    ["Diverifikasi", selectedWarga.verified_by || "-"],
                    ["Tgl Verifikasi", selectedWarga.tanggal_verifikasi ? new Date(selectedWarga.tanggal_verifikasi).toLocaleDateString("id-ID") : "-"],
                    ["Tgl Daftar",   selectedWarga.created_at ? new Date(selectedWarga.created_at).toLocaleDateString("id-ID") : "-"],
                  ].map(([k, v]: any, i) => (
                    <div key={i} className={`${i === 0 ? "col-span-2" : ""} bg-slate-50 rounded-lg px-3 py-2`}>
                      <div className="text-xs text-slate-400 font-medium mb-0.5">{k}</div>
                      <div className="text-sm font-semibold text-slate-800">{v}</div>
                    </div>
                  ))}
                </div>

                {/* Fitur Sosio-Ekonomi */}
                <details className="group">
                  <summary className="cursor-pointer text-xs font-bold text-slate-500 uppercase tracking-wide py-2 border-t border-slate-100 flex items-center justify-between">
                    <span>Indikator Sosio-Ekonomi (8 Fitur AI)</span>
                    <span className="text-slate-300 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    {[
                      ["Kondisi Rumah",    selectedWarga.kondisi_rumah],
                      ["Sumber Listrik",   selectedWarga.sumber_listrik],
                      ["Kepemilikan Aset", selectedWarga.kepemilikan_aset],
                      ["Pendidikan KK",    selectedWarga.pendidikan_kk],
                      ["Jml Tanggungan",   selectedWarga.jml_tanggungan],
                      ["Jenis Pekerjaan",  selectedWarga.jenis_pekerjaan],
                      ["Akses Air",        selectedWarga.akses_air],
                      ["Kepemilikan Lahan",selectedWarga.kepemilikan_lahan],
                    ].map(([k,v]: any) => (
                      <div key={k} className="bg-slate-50 rounded px-3 py-2 flex justify-between items-center">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-bold text-slate-800">{v ?? "-"}</span>
                      </div>
                    ))}
                  </div>
                </details>

                <button onClick={() => setSelectedWarga(null)}
                  className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors">
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
