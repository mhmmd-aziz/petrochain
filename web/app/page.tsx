"use client";

import { motion } from "framer-motion";
import { Download, ShieldCheck, Database, Droplet, Smartphone, ChevronRight, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-red selection:text-white font-sans">
      
      {/* Top Bar for Professional Look */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-6 flex justify-between items-center hidden md:flex">
        <div className="max-w-7xl mx-auto w-full flex justify-between">
          <span>Portal Resmi Sistem Distribusi Subsidi BBM</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Bantuan</a>
            <a href="#" className="hover:text-white transition-colors">FAQ</a>
            <a href="#" className="hover:text-white transition-colors">Kontak</a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-red rounded flex items-center justify-center">
              <Droplet className="text-white w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 leading-none tracking-tight">PETROCHAIN</div>
              <div className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase mt-1">Sistem Subsidi Terpadu</div>
            </div>
          </div>
          <div className="hidden md:flex gap-8 font-semibold text-sm text-slate-600 uppercase tracking-wide">
            <a href="#fitur" className="hover:text-brand-red transition-colors">Fitur Sistem</a>
            <a href="#cara-kerja" className="hover:text-brand-red transition-colors">Mekanisme</a>
            <a href="#download" className="hover:text-brand-red transition-colors">Unduh Aplikasi</a>
          </div>
          <Link href="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded font-semibold text-sm hover:bg-brand-red transition-colors shadow-sm">
            Masuk Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative bg-white border-b border-slate-200 overflow-hidden">
        {/* Geometric Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 border-l border-slate-100 hidden lg:block transform -skew-x-12 translate-x-20"></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center px-6 py-24 relative z-10">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="flex flex-col gap-6"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-red-50 border border-red-100 w-fit">
              <span className="flex h-2 w-2 rounded-full bg-brand-red"></span>
              <span className="text-xs font-bold text-brand-red uppercase tracking-wider">Versi 1.0.0 Resmi Dirilis</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-4xl lg:text-6xl font-extrabold leading-tight text-slate-900 tracking-tight">
              Distribusi Energi <br/>
              <span className="text-brand-red">Tepat Sasaran.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
              Infrastruktur digital terintegrasi yang memadukan verifikasi KTP, kecerdasan buatan (AI), dan teknologi rantai blok (Blockchain) untuk memastikan penyaluran subsidi BBM yang transparan dan akuntabel.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 mt-6">
              <button className="flex items-center gap-2 bg-brand-red text-white px-8 py-3.5 rounded font-semibold hover:bg-red-900 transition-colors shadow-sm">
                <Download className="w-5 h-5" />
                Unduh Aplikasi Warga
              </button>
              <button className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-8 py-3.5 rounded font-semibold hover:bg-slate-50 transition-colors group">
                Pelajari Mekanisme
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-red transition-colors" />
              </button>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-8 pt-8 border-t border-slate-200 flex gap-12">
              <div>
                <div className="text-3xl font-extrabold text-slate-900">95.0%</div>
                <div className="text-sm font-medium text-slate-500 mt-1">Akurasi Validasi AI</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900">&lt; 1s</div>
                <div className="text-sm font-medium text-slate-500 mt-1">Latensi Verifikasi KTP</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Professional Dashboard UI Mockup */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                </div>
                <div className="text-xs font-semibold text-slate-400 ml-4">Terminal Verifikasi SPBU</div>
              </div>
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status Identitas</div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-200 text-sm font-bold">
                      <ShieldCheck className="w-4 h-4" /> Valid Terotentikasi
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Level Subsidi</div>
                    <div className="text-lg font-bold text-slate-800">Rentan Miskin (L3)</div>
                  </div>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 p-6 rounded mb-6">
                  <div className="flex justify-between items-end mb-4">
                    <div className="text-sm font-semibold text-slate-600">Alokasi Kuota Berjalan</div>
                    <div className="text-3xl font-extrabold text-brand-red">50 <span className="text-base text-slate-500 font-semibold">Liter</span></div>
                  </div>
                  
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-brand-red h-full w-[100%] rounded-full"></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                    <span>Terpakai: 0L</span>
                    <span>Sisa: 50L</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="text-sm font-medium text-slate-500">Nomor Induk Kependudukan</span>
                    <span className="text-sm font-mono font-bold text-slate-800">1101••••••••1234</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="text-sm font-medium text-slate-500">Tipe Kendaraan Terdaftar</span>
                    <span className="text-sm font-bold text-slate-800">Roda Dua (Komuter)</span>
                  </div>
                </div>
                
                <button className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded hover:bg-slate-800 transition-colors">
                  Otorisasi Pengisian BBM
                </button>
              </div>
            </div>
            
            {/* Decorative block behind */}
            <div className="absolute -z-10 top-4 -right-4 w-full h-full border-2 border-brand-red/20 rounded-lg"></div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section id="fitur" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Arsitektur Sistem Terpadu</h2>
            <p className="text-slate-600 font-medium text-lg">Menggunakan standar industri terkini untuk menjamin integritas data, keamanan transaksi, dan presisi penyaluran bantuan.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -4 }} className="prof-card p-8 rounded-lg">
              <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded flex items-center justify-center mb-6 text-slate-700">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Model AI Prediktif</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">Algoritma klasifikasi berbasis <span className="font-bold text-slate-800">LightGBM</span> menganalisis 8 indikator sosial-ekonomi BPS untuk mengukur indeks kelayakan subsidi secara presisi.</p>
            </motion.div>
            
            <motion.div whileHover={{ y: -4 }} className="prof-card p-8 rounded-lg border-t-4 border-t-brand-red">
              <div className="w-12 h-12 bg-red-50 border border-red-100 rounded flex items-center justify-center mb-6 text-brand-red">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Polygon Blockchain</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">Seluruh log transaksi pencairan BBM dikunci dalam kontrak pintar (Smart Contract) pada jaringan Blockchain publik, menjamin sifat *immutable* (anti manipulasi).</p>
            </motion.div>
            
            <motion.div whileHover={{ y: -4 }} className="prof-card p-8 rounded-lg">
              <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded flex items-center justify-center mb-6 text-slate-700">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Otentikasi KTP IoT</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">Dispenser SPBU yang telah dimodifikasi dengan modul ESP32 dapat membaca data chip KTP, menghubungkan identitas fisik secara *real-time* dengan *database* sisa kuota.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Analytics CTA */}
      <section className="bg-slate-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">Pantau Penyaluran secara *Real-Time*</h2>
            <p className="text-slate-400 font-medium mb-8">Sistem ini dilengkapi dengan Dashboard Eksekutif yang memungkinkan pengambil kebijakan memantau volume subsidi yang telah disalurkan berdasarkan wilayah, tipe kendaraan, dan demografi.</p>
            <button className="bg-white text-slate-900 font-bold px-6 py-3 rounded flex items-center gap-2 hover:bg-slate-100 transition-colors">
              <BarChart3 className="w-5 h-5" />
              Masuk Dashboard Eksekutif
            </button>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/20 blur-3xl rounded-full"></div>
            <div className="space-y-4 relative z-10">
              <div className="h-4 bg-slate-700 rounded w-1/3 mb-6"></div>
              <div className="h-2 bg-slate-700 rounded w-full"></div>
              <div className="h-2 bg-slate-700 rounded w-5/6"></div>
              <div className="h-2 bg-slate-700 rounded w-full"></div>
              <div className="h-2 bg-slate-700 rounded w-4/6"></div>
              <div className="mt-8 pt-4 border-t border-slate-700 flex gap-4">
                <div className="w-16 h-16 rounded bg-slate-700"></div>
                <div className="w-16 h-16 rounded bg-slate-700"></div>
                <div className="w-16 h-16 rounded bg-brand-red"></div>
                <div className="w-16 h-16 rounded bg-slate-700"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
              <Droplet className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">PETROCHAIN</span>
          </div>
          <p className="text-sm font-semibold text-slate-500">© 2026 Konsorsium PetroChain. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </footer>
    </div>
  );
}
