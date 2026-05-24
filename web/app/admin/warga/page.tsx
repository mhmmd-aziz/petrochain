"use client";

import { useState } from "react";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegistrasiWarga() {
  const [formData, setFormData] = useState({
    nik: "",
    nama_lengkap: "",
    alamat: "",
    kondisi_rumah: 3,
    sumber_listrik: 2,
    kepemilikan_aset: 1,
    pendidikan_kk: 2,
    jml_tanggungan: 2,
    jenis_pekerjaan: 2,
    akses_air: 1,
    kepemilikan_lahan: 1
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Parse to int for select options, keep string for text inputs
    const parsedValue = ['nik', 'nama_lengkap', 'alamat'].includes(name) ? value : parseInt(value, 10);
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/warga", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Data warga berhasil didaftarkan. Kuota telah dihitung oleh ML Service.' });
        // Reset form partially
        setFormData(prev => ({ ...prev, nik: "", nama_lengkap: "", alamat: "" }));
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal mendaftar warga' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Formulir Pendaftaran Warga & Evaluasi Subsidi</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Data sosio-ekonomi akan dievaluasi oleh Model AI untuk menentukan tingkat subsidi yang layak.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          {message && (
            <div className={`mb-8 p-4 rounded-lg text-sm font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              <div className="flex gap-3 items-center">
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <span>{message.text}</span>
              </div>
              {message.type === 'success' && (
                <a href="/admin" className="shrink-0 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors text-xs text-center">
                  Lihat di Dashboard
                </a>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Kolom 1: Data Identitas */}
            <div className="space-y-6">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Identitas Dasar</h3>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nomor Induk Kependudukan (NIK)</label>
                <input
                  type="text"
                  name="nik"
                  maxLength={16}
                  value={formData.nik}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-brand-red font-mono text-sm"
                  placeholder="16 Digit Angka NIK"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap Sesuai KTP</label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-brand-red font-semibold text-sm"
                  placeholder="Masukkan Nama Lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Domisili</label>
                <textarea
                  name="alamat"
                  rows={3}
                  value={formData.alamat}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-brand-red font-medium text-sm"
                  placeholder="Alamat lengkap RT/RW, Desa, Kecamatan..."
                  required
                />
              </div>
            </div>

            {/* Kolom 2: Data Sosio Ekonomi */}
            <div className="space-y-6">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Indikator Sosio-Ekonomi</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kondisi Rumah</label>
                  <select name="kondisi_rumah" value={formData.kondisi_rumah} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm font-medium">
                    <option value={1}>Sangat Baik (1)</option>
                    <option value={2}>Baik (2)</option>
                    <option value={3}>Sedang (3)</option>
                    <option value={4}>Buruk (4)</option>
                    <option value={5}>Sangat Buruk (5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Pendidikan KK</label>
                  <select name="pendidikan_kk" value={formData.pendidikan_kk} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm font-medium">
                    <option value={1}>Perguruan Tinggi (1)</option>
                    <option value={2}>SMA/Sederajat (2)</option>
                    <option value={3}>SMP/SD/Tidak Sekolah (3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Sumber Listrik</label>
                  <select name="sumber_listrik" value={formData.sumber_listrik} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm font-medium">
                    <option value={1}>PLN &gt;900VA (1)</option>
                    <option value={2}>PLN 450-900VA (2)</option>
                    <option value={3}>Bukan PLN / Numpang (3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Jumlah Tanggungan</label>
                  <select name="jml_tanggungan" value={formData.jml_tanggungan} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm font-medium">
                    <option value={1}>0-1 Orang (1)</option>
                    <option value={2}>2-3 Orang (2)</option>
                    <option value={3}>4+ Orang (3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kepemilikan Aset</label>
                  <select name="kepemilikan_aset" value={formData.kepemilikan_aset} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm font-medium">
                    <option value={1}>Memiliki Mobil/Tanah (1)</option>
                    <option value={2}>Memiliki Motor (2)</option>
                    <option value={3}>Tidak Punya Aset Berharga (3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenis Pekerjaan</label>
                  <select name="jenis_pekerjaan" value={formData.jenis_pekerjaan} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm font-medium">
                    <option value={1}>PNS/TNI/Polri/Pegawai Tetap (1)</option>
                    <option value={2}>Wiraswasta/Pedagang (2)</option>
                    <option value={3}>Buruh/Tani/Nelayan/Informal (3)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-brand-red text-white font-bold py-3.5 px-8 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? "Memproses AI & Menyimpan..." : "Daftarkan Warga & Hitung Subsidi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
