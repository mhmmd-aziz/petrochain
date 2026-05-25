"use client";

import { useState } from "react";
import { Save, AlertCircle, CheckCircle2, Info, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

// ── Konstanta lokal (mirror backend) ─────────────────────────────────────
const KATEGORI_OPTIONS = [
  { value: "motor_pribadi",   label: "Motor Pribadi",   sub: "Kendaraan non-produktif / komuter harian",           kuota: 50  },
  { value: "motor_produktif", label: "Motor Produktif", sub: "Ojek Online (Gojek/Grab), Kurir, Delivery",          kuota: 100, butuhNoPol: true },
  { value: "mobil_produktif", label: "Mobil Produktif", sub: "Angkutan Umum, Taksi Online, UMKM Roda-4",           kuota: 350, butuhNoPol: true },
];

const KONDISI_RUMAH_OPT  = [{v:1,l:"1 — Sangat Buruk"},{v:2,l:"2 — Buruk"},{v:3,l:"3 — Sedang"},{v:4,l:"4 — Baik"},{v:5,l:"5 — Sangat Baik"}];
const SUMBER_LISTRIK_OPT = [{v:1,l:"1 — Tidak Ada Listrik"},{v:2,l:"2 — Genset / Solar Cell"},{v:3,l:"3 — PLN Prasejahtera (<900VA)"},{v:4,l:"4 — PLN Normal (≥900VA)"}];
const KEPEMILIKAN_ASET_OPT = [{v:1,l:"1 — Tidak Punya Aset"},{v:2,l:"2 — 1 Aset Produktif"},{v:3,l:"3 — 2 Aset Produktif"},{v:4,l:"4 — 3+ Aset Produktif"}];
const PENDIDIKAN_OPT = [{v:1,l:"1 — Tidak Sekolah"},{v:2,l:"2 — SD"},{v:3,l:"3 — SMP"},{v:4,l:"4 — SMA / SMK"},{v:5,l:"5 — Diploma (D1-D3)"},{v:6,l:"6 — Sarjana (S1/S2/S3)"}];
const JENIS_PEKERJAAN_OPT = [{v:1,l:"1 — Tidak Bekerja / Pengangguran"},{v:2,l:"2 — Buruh Harian / Pekerja Bebas"},{v:3,l:"3 — Nelayan / Petani / Pekebun"},{v:4,l:"4 — Pedagang Kecil / Wiraswasta"},{v:5,l:"5 — Ojek / Driver Transportasi"},{v:6,l:"6 — Karyawan Tetap / PNS / TNI-Polri"}];
const AKSES_AIR_OPT = [{v:1,l:"1 — Tidak Ada Akses"},{v:2,l:"2 — Sumur Gali / Mata Air"},{v:3,l:"3 — Sumur Bor / Pompa"},{v:4,l:"4 — PDAM / Air Ledeng"}];
const KEPEMILIKAN_LAHAN_OPT = [{v:1,l:"1 — Tidak Punya Lahan"},{v:2,l:"2 — Sewa / Kontrak"},{v:3,l:"3 — Milik Sendiri"}];

type FieldMeta = { v: number; l: string };
type KategoriOpt = { value: string; label: string; sub: string; kuota: number; butuhNoPol?: boolean };

const SelectField = ({ label, name, value, options, onChange, hint }: {
  label: string; name: string; value: number;
  options: FieldMeta[]; onChange: (e: any) => void; hint?: string;
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
    >
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

export default function RegistrasiWarga() {
  const [formData, setFormData] = useState({
    nik: "",
    nama_lengkap: "",
    alamat: "",
    kondisi_rumah: 3,
    sumber_listrik: 2,
    kepemilikan_aset: 1,
    pendidikan_kk: 3,
    jml_tanggungan: 2,
    jenis_pekerjaan: 3,
    akses_air: 2,
    kepemilikan_lahan: 1,
    kategori_kendaraan: "motor_pribadi",
    no_polisi: "",
  });

  const [loading, setLoading] = useState(false);
  const [verifyingSTNK, setVerifyingSTNK] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [stnkStatus, setStnkStatus] = useState<{
    valid: boolean | null;
    code?: string;
    message?: string;
    data?: any;
  }>({ valid: null });

  const selectedKat: KategoriOpt = KATEGORI_OPTIONS.find(k => k.value === formData.kategori_kendaraan)!;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const textFields = ["nik", "nama_lengkap", "alamat", "kategori_kendaraan", "no_polisi"];
    const parsed = textFields.includes(name) ? value : parseInt(value, 10);
    setFormData(prev => ({ ...prev, [name]: parsed }));
    // Reset verifikasi STNK jika no_polisi atau kategori diubah
    if (name === "no_polisi" || name === "kategori_kendaraan") {
      setStnkStatus({ valid: null });
    }
  };

  // ── Verifikasi STNK ke database ────────────────────────────────────────
  const handleVerifySTNK = async () => {
    if (!formData.no_polisi.trim()) return;
    setVerifyingSTNK(true);
    setStnkStatus({ valid: null });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/verify-kendaraan", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          no_polisi: formData.no_polisi,
          kategori_kendaraan: formData.kategori_kendaraan,
        }),
      });
      const data = await res.json();
      setStnkStatus({ valid: data.valid, code: data.code, message: data.message, data: data.data });
    } catch {
      setStnkStatus({ valid: false, code: "ERROR", message: "Gagal terhubung ke layanan verifikasi." });
    } finally {
      setVerifyingSTNK(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Blokir submit jika kategori produktif tapi STNK belum/gagal diverifikasi
    if (selectedKat.butuhNoPol && stnkStatus.valid !== true) {
      setMessage({ type: "error", text: "Nomor polisi harus diverifikasi terlebih dahulu sebelum menyimpan data." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/warga", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message || "Data warga berhasil didaftarkan." });
        setFormData(prev => ({ ...prev, nik: "", nama_lengkap: "", alamat: "", no_polisi: "" }));
      } else {
        setMessage({ type: "error", text: data.message || "Gagal mendaftar warga." });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 bg-slate-50">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Formulir Pendaftaran Warga</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Data sosio-ekonomi dievaluasi secara otomatis oleh model AI untuk menentukan kelayakan dan kuota subsidi BBM.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Alert */}
          {message && (
            <div className={`mb-8 px-4 py-3 rounded-lg text-sm font-medium flex items-start gap-3 border
              ${message.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"}`}
            >
              {message.type === "success"
                ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
                : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              }
              <div className="flex-1">
                <span>{message.text}</span>
                {message.type === "success" && (
                  <a href="/admin" className="ml-3 underline font-semibold text-green-700 text-xs">Lihat Dashboard</a>
                )}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Kolom 1: Identitas Warga ─────────────────────────────── */}
            <div className="space-y-5">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">A. Identitas Warga</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">NIK</label>
                <input
                  type="text" name="nik" maxLength={16} value={formData.nik} onChange={handleChange} required
                  placeholder="16 digit NIK sesuai KTP"
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
                <input
                  type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required
                  placeholder="Sesuai KTP"
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Alamat Domisili</label>
                <textarea
                  name="alamat" rows={4} value={formData.alamat} onChange={handleChange} required
                  placeholder="RT/RW, Desa/Kelurahan, Kecamatan, Kabupaten/Kota"
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all resize-none"
                />
              </div>

              {/* ── Kategori Kendaraan & Verifikasi ── */}
              <div className="pt-2 border-t border-slate-100">
                <div className="pb-2 mb-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">B. Kendaraan & Verifikasi</h3>
                  <p className="text-xs text-slate-400 mt-1">Diisi petugas berdasarkan dokumen fisik (STNK, surat kemitraan).</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Kategori Kendaraan</label>
                    <select
                      name="kategori_kendaraan"
                      value={formData.kategori_kendaraan}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                    >
                      {KATEGORI_OPTIONS.map(k => (
                        <option key={k.value} value={k.value}>{k.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400 mt-1">{selectedKat.sub}</p>
                  </div>

                  {/* No. Polisi + Tombol Verifikasi — muncul kondisional */}
                  {selectedKat.butuhNoPol && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                        Nomor Polisi Kendaraan <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="no_polisi"
                          value={formData.no_polisi}
                          onChange={handleChange}
                          placeholder="Contoh: BL1234AB"
                          maxLength={12}
                          required
                          className={`flex-1 px-3 py-2.5 bg-white border rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 transition-all
                            ${stnkStatus.valid === true  ? "border-green-400 focus:ring-green-300" :
                              stnkStatus.valid === false ? "border-red-400 focus:ring-red-300" :
                              "border-slate-300 focus:ring-slate-400"}`}
                        />
                        <button
                          type="button"
                          onClick={handleVerifySTNK}
                          disabled={verifyingSTNK || !formData.no_polisi.trim()}
                          className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {verifyingSTNK
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Memeriksa...</>
                            : <><ShieldCheck className="w-3.5 h-3.5" /> Verifikasi STNK</>}
                        </button>
                      </div>

                      {/* Badge Hasil Verifikasi */}
                      {stnkStatus.valid === true && stnkStatus.data && (
                        <div className="mt-2 p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <div className="text-xs text-green-800">
                            <p className="font-bold">STNK Terverifikasi</p>
                            <p>{stnkStatus.data.nama_pemilik} — {stnkStatus.data.merk} {stnkStatus.data.tahun}</p>
                          </div>
                        </div>
                      )}
                      {stnkStatus.valid === false && (
                        <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div className="text-xs text-red-800">
                            <p className="font-bold">Verifikasi Gagal ({stnkStatus.code})</p>
                            <p>{stnkStatus.message}</p>
                          </div>
                        </div>
                      )}
                      {stnkStatus.valid === null && (
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          Wajib diverifikasi sebelum menyimpan data.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Info Kuota Preview */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Estimasi Kuota BBM</p>
                      <p className="text-lg font-bold text-slate-900">{selectedKat.kuota} <span className="text-sm font-normal text-slate-500">Liter / bulan</span></p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Kolom 2 & 3: Indikator Sosio-Ekonomi ───────────────── */}
            <div className="lg:col-span-2 space-y-5">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">C. Indikator Sosio-Ekonomi</h3>
                <p className="text-xs text-slate-400 mt-1">Digunakan model AI untuk memprediksi kelayakan subsidi. Isi sesuai kondisi aktual warga.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <SelectField label="Kondisi Rumah" name="kondisi_rumah" value={formData.kondisi_rumah}
                  options={KONDISI_RUMAH_OPT} onChange={handleChange}
                  hint="Penilaian fisik bangunan tempat tinggal" />

                <SelectField label="Sumber Listrik" name="sumber_listrik" value={formData.sumber_listrik}
                  options={SUMBER_LISTRIK_OPT} onChange={handleChange}
                  hint="Akses listrik rumah tangga" />

                <SelectField label="Kepemilikan Aset" name="kepemilikan_aset" value={formData.kepemilikan_aset}
                  options={KEPEMILIKAN_ASET_OPT} onChange={handleChange}
                  hint="Jumlah aset produktif yang dimiliki KK" />

                <SelectField label="Pendidikan Kepala Keluarga" name="pendidikan_kk" value={formData.pendidikan_kk}
                  options={PENDIDIKAN_OPT} onChange={handleChange}
                  hint="Pendidikan terakhir KK yang tercatat" />

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Jumlah Tanggungan</label>
                  <select
                    name="jml_tanggungan" value={formData.jml_tanggungan} onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                  >
                    {Array.from({ length: 13 }, (_, i) => (
                      <option key={i} value={i}>{i === 0 ? "0 — Tidak Ada Tanggungan" : `${i} Orang`}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Jumlah anggota keluarga yang ditanggung</p>
                </div>

                <SelectField label="Jenis Pekerjaan Utama" name="jenis_pekerjaan" value={formData.jenis_pekerjaan}
                  options={JENIS_PEKERJAAN_OPT} onChange={handleChange}
                  hint="Pekerjaan utama kepala keluarga" />

                <SelectField label="Akses Air Bersih" name="akses_air" value={formData.akses_air}
                  options={AKSES_AIR_OPT} onChange={handleChange}
                  hint="Sumber air minum utama" />

                <SelectField label="Status Kepemilikan Lahan" name="kepemilikan_lahan" value={formData.kepemilikan_lahan}
                  options={KEPEMILIKAN_LAHAN_OPT} onChange={handleChange}
                  hint="Status lahan tempat tinggal" />
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  <span className="font-bold">Catatan Sistem:</span> Data sosio-ekonomi di atas diproses oleh model Machine Learning (LightGBM) untuk menentukan
                  tingkat kelayakan subsidi (Level 1-3). Kuota liter BBM final ditentukan dari kombinasi level tersebut dan
                  kategori kendaraan yang telah diverifikasi petugas.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-700">
                Kategori: <span className="text-slate-900">{selectedKat.label}</span>
                &nbsp;&mdash;&nbsp;
                Kuota Estimasi: <span className="font-bold text-slate-900">{selectedKat.kuota} L/bln</span>
              </p>
              <p className="text-xs text-slate-400">Kuota final mungkin berbeda setelah evaluasi AI selesai.</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-brand-red text-white font-semibold text-sm py-3 px-8 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              <Save className="w-4 h-4" />
              {loading ? "Memproses & Menyimpan..." : "Daftarkan Warga"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
