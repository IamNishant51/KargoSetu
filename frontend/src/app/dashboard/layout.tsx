import { ReactNode } from "react";
import Link from "next/link";
import { Ship, LayoutDashboard, FileText, TrendingUp, Settings, Bell } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A1727] text-white flex flex-col fixed inset-y-0 left-0 z-20">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <img src="/logo-ks.png" alt="Logo" className="w-8 h-8 mr-3 object-contain" />
          <span className="text-xl font-bold tracking-wide text-white">
            KargoSetu<span className="text-orange-500">.</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link
            href="/dashboard"
            className="flex items-center px-3 py-3 bg-[#1e293b] text-white rounded-md border-l-4 border-blue-500 font-medium transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/requisitions"
            className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors"
          >
            <FileText className="w-5 h-5 mr-3" />
            Requisitions
          </Link>
          <Link
            href="/dashboard/forecasts"
            className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors"
          >
            <TrendingUp className="w-5 h-5 mr-3" />
            Forecasts
          </Link>
          <Link
            href="/settings"
            className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
        </nav>

        {/* Profile Area - Sidebar */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-semibold text-sm shrink-0">
              AC
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Oceanix Corp.</p>
              <p className="text-xs text-slate-400 truncate">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center text-slate-600">
            <LayoutDashboard className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Dashboard</span>
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                4
              </span>
            </button>

            <div className="flex items-center border-l border-slate-200 pl-6 cursor-pointer">
              <div className="text-right mr-3 hidden md:block">
                <p className="text-sm font-medium text-slate-800">Admin User</p>
                <p className="text-xs text-slate-500">Oceanix Corp.</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mt-2">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
