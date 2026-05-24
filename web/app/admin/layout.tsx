"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Droplet,
  Menu,
  X,
  Layers,
  Database
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Data Warga", href: "/admin/data-warga", icon: Database },
    { name: "Registrasi Warga", href: "/admin/warga", icon: Users },
    { name: "Batch Prediksi AI", href: "/admin/batch", icon: Layers },
    { name: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-brand-red selection:text-white">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-slate-900 w-64 text-slate-300 transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950">
          <img src="/favicon.png" alt="PetroChain Logo" className="w-12 h-12 object-contain" />
          <div className="hidden md:block">
            <h1 className="text-xl font-black text-white tracking-tight leading-none">PETROCHAIN</h1>
            <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
        </div>

        <nav className="p-4 space-y-1.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-3 mt-4">Menu Utama</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${isActive ? 'bg-brand-red text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg font-semibold text-sm hover:bg-slate-800 hover:text-red-400 transition-colors text-slate-400"
          >
            <LogOut className="w-5 h-5" />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}>
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-slate-500 hover:text-slate-900 transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-xl font-extrabold text-slate-900 capitalize tracking-tight">
              {pathname === '/admin' ? 'Dashboard Utama' : pathname.replace('/admin/', '').replace('-', ' ')}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-900">Administrator</div>
              <div className="text-xs font-semibold text-slate-500">Divisi Distribusi BBM</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-brand-red flex items-center justify-center text-slate-600 font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
