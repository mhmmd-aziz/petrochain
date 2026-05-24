"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplet, ArrowRight, Lock, User } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        router.push("/admin");
      } else {
        setError(data.message || "Login gagal");
      }
    } catch (err) {
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-brand-red selection:text-white">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-slate-900 p-8 text-center border-b-4 border-brand-red">
            <div className="w-12 h-12 bg-brand-red rounded-lg flex items-center justify-center mx-auto mb-4">
              <Droplet className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">PETROCHAIN</h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">Portal Admin & Eksekutif</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-semibold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all sm:text-sm bg-slate-50 text-slate-900 font-medium"
                    placeholder="Masukkan username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all sm:text-sm bg-slate-50 text-slate-900 font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-red-800 text-white font-bold py-3.5 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Masuk Sistem"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </div>
          
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 text-center">
            <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
