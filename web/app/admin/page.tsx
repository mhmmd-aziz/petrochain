"use client";

import { useEffect, useState } from "react";
import { Users, Droplet, Database, ShieldCheck, Activity, Filter } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Label } from "recharts";

const LEVEL_COLORS = ['#ef4444', '#f97316', '#eab308', '#94a3b8']; // L1, L2, L3, Unknown
const RUMAH_COLORS = ['#fb7185', '#f43f5e', '#e11d48', '#be123c', '#881337'];
const LISTRIK_COLORS = ['#38bdf8', '#0ea5e9', '#0284c7'];
const PEKERJAAN_COLORS = ['#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalWarga: 0, totalTransaksi: 0 });
  const [wargaList, setWargaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterTahun, setFilterTahun] = useState("all");
  const [filterBulan, setFilterBulan] = useState("all");

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
        setStats(data.data.stats);
        setWargaList(data.data.list);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableYears = () => {
    const years = new Set(wargaList.map((w: any) => w.created_at ? new Date(w.created_at).getFullYear() : null).filter(Boolean));
    return Array.from(years).sort((a: any, b: any) => b - a);
  };

  // 1. FILTER DATA
  const filteredWarga = wargaList.filter((w: any) => {
    if (!w.created_at) return filterTahun === "all" && filterBulan === "all";
    const date = new Date(w.created_at);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    
    let match = true;
    if (filterBulan !== "all" && month !== filterBulan) match = false;
    if (filterTahun !== "all" && year !== filterTahun) match = false;
    return match;
  });

  // Calculate dynamic stats
  const dynamicTotalWarga = filteredWarga.length;
  const dynamicKuota = filteredWarga.reduce((sum: number, w: any) => sum + (w.kuota_liter || 0), 0);

  // 2. CHART DATA PROCESSORS
  
  // A. Level Subsidi
  const getLevelStats = () => {
    const counts = { 1: 0, 2: 0, 3: 0, unknown: 0 };
    filteredWarga.forEach((w: any) => {
      if (w.level_subsidi === 1) counts[1]++;
      else if (w.level_subsidi === 2) counts[2]++;
      else if (w.level_subsidi === 3) counts[3]++;
      else counts.unknown++;
    });
    return [
      { name: 'L1 (Ekstrem)', value: counts[1] },
      { name: 'L2 (Miskin)', value: counts[2] },
      { name: 'L3 (Rentan)', value: counts[3] },
      { name: 'Belum Diprediksi', value: counts.unknown }
    ];
  };

  // B. Pertumbuhan Warga (Time Series)
  const getTimeSeriesStats = () => {
    const map: Record<string, number> = {};
    filteredWarga.forEach((w: any) => {
      if (w.created_at) {
        const date = new Date(w.created_at);
        // If filter is specific month, show days. Otherwise show months.
        if (filterBulan !== "all" && filterTahun !== "all") {
          const day = date.getDate();
          map[`Tgl ${day}`] = (map[`Tgl ${day}`] || 0) + 1;
        } else {
          const monthYear = date.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
          map[monthYear] = (map[monthYear] || 0) + 1;
        }
      }
    });

    // Sort appropriately
    if (filterBulan !== "all" && filterTahun !== "all") {
      return Object.entries(map)
        .map(([name, Total]) => ({ name, Total, day: parseInt(name.replace('Tgl ', '')) }))
        .sort((a, b) => a.day - b.day);
    }
    // For months, we rely on the natural insertion order roughly, or parse it back. For simplicity, just return map.
    return Object.entries(map).map(([name, Total]) => ({ name, Total }));
  };

  // C. Kondisi Rumah
  const getRumahStats = () => {
    const labels = ["Sangat Buruk", "Buruk", "Sedang", "Baik", "Sangat Baik"];
    const counts = [0, 0, 0, 0, 0];
    filteredWarga.forEach((w: any) => {
      const val = w.kondisi_rumah || 3;
      if (val >= 1 && val <= 5) counts[val - 1]++;
    });
    return labels.map((name, i) => ({ name, Jumlah: counts[i] }));
  };

  // D. Sumber Listrik (Donut)
  const getListrikStats = () => {
    const counts = { 1: 0, 2: 0, 3: 0 };
    filteredWarga.forEach((w: any) => {
      const val = w.sumber_listrik || 3;
      if (counts[val as keyof typeof counts] !== undefined) counts[val as keyof typeof counts]++;
    });
    return [
      { name: 'PLN >900VA', value: counts[1] },
      { name: 'PLN 450-900VA', value: counts[2] },
      { name: 'Numpang/Bukan PLN', value: counts[3] }
    ];
  };

  // E. Jenis Pekerjaan (Horizontal Bar)
  const getPekerjaanStats = () => {
    const labels = ["Tidak Bekerja", "Petani/Buruh", "Wiraswasta", "Karyawan Swasta", "PNS/TNI/Polri"];
    const counts = [0, 0, 0, 0, 0];
    filteredWarga.forEach((w: any) => {
      const val = w.jenis_pekerjaan || 3;
      if (val >= 1 && val <= 5) counts[val - 1]++;
    });
    return labels.map((name, i) => ({ name, Jumlah: counts[i] })).sort((a, b) => b.Jumlah - a.Jumlah);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <Filter className="w-5 h-5 text-brand-red" />
          <h2>Filter Dashboard</h2>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-brand-red focus:border-brand-red outline-none">
            <option value="all">Semua Tahun</option>
            {getAvailableYears().map((y: any) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-brand-red focus:border-brand-red outline-none">
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
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
          <div className="p-3 bg-red-50 rounded-lg text-brand-red relative z-10"><Users className="w-6 h-6" /></div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 mb-1">Total Warga (Terfilter)</p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{dynamicTotalWarga}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600 relative z-10"><Droplet className="w-6 h-6" /></div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 mb-1">Potensi Subsidi Turun</p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{dynamicKuota} <span className="text-sm font-semibold text-slate-500">L/bln</span></p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600 relative z-10"><Database className="w-6 h-6" /></div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 mb-1">Total Transaksi Global</p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats.totalTransaksi}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
          <div className="p-3 bg-green-50 rounded-lg text-green-600 relative z-10"><Activity className="w-6 h-6" /></div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 mb-1">Status AI Model</p>
            <p className="text-xl font-extrabold text-green-600 tracking-tight flex items-center gap-1.5 mt-1"><ShieldCheck className="w-5 h-5" /> Online</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 font-bold">Memuat Grafik...</div>
      ) : dynamicTotalWarga === 0 ? (
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 font-bold">Tidak ada data untuk periode waktu yang dipilih.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Chart 1: Distribusi Level */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 xl:col-span-1">
            <h2 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">Distribusi Level Subsidi</h2>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getLevelStats()} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {getLevelStats().map((entry, index) => <Cell key={`cell-${index}`} fill={LEVEL_COLORS[index % LEVEL_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value} Warga`, 'Jumlah']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Pendaftaran */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 xl:col-span-2">
            <h2 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">Tren Pendaftaran Warga Baru</h2>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getTimeSeriesStats()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} formatter={(value) => [`${value} Warga`, 'Pendaftar']} />
                  <Bar dataKey="Total" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Kondisi Rumah */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 xl:col-span-1">
            <h2 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">Kondisi Fisik Rumah</h2>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getRumahStats()} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} angle={-45} textAnchor="end" height={60} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="Jumlah" radius={[4, 4, 0, 0]}>
                    {getRumahStats().map((entry, index) => <Cell key={`cell-${index}`} fill={RUMAH_COLORS[index % RUMAH_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Sumber Listrik */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 xl:col-span-1">
            <h2 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">Sumber Listrik</h2>
            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getListrikStats()} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={2} dataKey="value">
                    {getListrikStats().map((entry, index) => <Cell key={`cell-${index}`} fill={LISTRIK_COLORS[index % LISTRIK_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value} KK`, 'Jumlah']} />
                  <Legend wrapperStyle={{fontSize: '11px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Demografi Pekerjaan */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 xl:col-span-1">
            <h2 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">Demografi Pekerjaan</h2>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getPekerjaanStats()} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} width={90} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="Jumlah" radius={[0, 4, 4, 0]}>
                    {getPekerjaanStats().map((entry, index) => <Cell key={`cell-${index}`} fill={PEKERJAAN_COLORS[index % PEKERJAAN_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
