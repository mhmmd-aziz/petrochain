"use client";

import { Settings, Save } from "lucide-react";

export default function Pengaturan() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5" /> Pengaturan Sistem
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Konfigurasi parameter API dan Smart Contract PetroChain.</p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Endpoint Settings */}
          <section className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Konfigurasi Endpoint Backend</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Node.js API URL</label>
                <input
                  type="text"
                  defaultValue="http://localhost:5000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-500 font-mono"
                  disabled
                />
                <p className="text-xs text-slate-400 mt-1">Hanya bisa diubah melalui .env server</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Python ML Service URL</label>
                <input
                  type="text"
                  defaultValue="http://localhost:8000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-500 font-mono"
                  disabled
                />
                <p className="text-xs text-slate-400 mt-1">Hanya bisa diubah melalui .env server</p>
              </div>
            </div>
          </section>

          {/* Blockchain Settings */}
          <section className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Polygon Blockchain</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Contract Address</label>
                <input
                  type="text"
                  defaultValue="0x0000000000000000000000000000000000000000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-500 font-mono"
                  disabled
                />
                <p className="text-xs text-slate-400 mt-1">Modul blockchain saat ini dinonaktifkan untuk mode pengembangan.</p>
              </div>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <button
              disabled
              className="flex items-center gap-2 bg-slate-300 text-slate-500 font-bold py-3 px-8 rounded-lg cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
