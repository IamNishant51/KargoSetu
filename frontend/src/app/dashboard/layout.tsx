"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Ship, LayoutDashboard, FileText, TrendingUp, Settings, Bell, LogOut, User, CheckCircle2, Menu, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-[#0A1727] text-white flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center">
            <img src="/light-KargoSetu-LOGO.png" alt="Logo" className="h-8 w-auto mr-3 object-contain" />
            <span className="text-xl font-bold tracking-wide text-white">
              KargoSetu<span className="text-orange-500">.</span>
            </span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link
            href="/dashboard"
            className={`flex items-center px-3 py-3 rounded-md font-medium transition-colors ${pathname === '/dashboard' ? 'bg-[#1e293b] text-white border-l-4 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/requisitions"
            className={`flex items-center px-3 py-3 rounded-md font-medium transition-colors ${pathname.includes('/requisitions') ? 'bg-[#1e293b] text-white border-l-4 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <FileText className="w-5 h-5 mr-3" />
            Requisitions
          </Link>
          <Link
            href="/dashboard/forecasts"
            className={`flex items-center px-3 py-3 rounded-md font-medium transition-colors ${pathname.includes('/forecasts') ? 'bg-[#1e293b] text-white border-l-4 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <TrendingUp className="w-5 h-5 mr-3" />
            Forecasts
          </Link>
          <Link
            href="/dashboard/settings"
            className={`flex items-center px-3 py-3 rounded-md font-medium transition-colors ${pathname.includes('/settings') ? 'bg-[#1e293b] text-white border-l-4 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
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
      <div className="flex-1 min-w-0 flex flex-col md:ml-64 min-h-screen transition-all duration-300">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0 shrink-0">
          <div className="flex items-center text-slate-600">
            <button 
              className="md:hidden p-2 mr-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            {pathname === '/dashboard' && <><LayoutDashboard className="hidden sm:block w-5 h-5 mr-2" /><span className="text-sm font-medium">Dashboard</span></>}
            {pathname.includes('/requisitions') && <><FileText className="hidden sm:block w-5 h-5 mr-2" /><span className="text-sm font-medium">Requisitions</span></>}
            {pathname.includes('/forecasts') && <><TrendingUp className="hidden sm:block w-5 h-5 mr-2" /><span className="text-sm font-medium">Forecasts</span></>}
            {pathname.includes('/settings') && <><Settings className="hidden sm:block w-5 h-5 mr-2" /><span className="text-sm font-medium">Settings</span></>}
          </div>

          <div className="flex items-center space-x-3 sm:space-x-6">
            
            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2 rounded-full transition-colors focus:outline-none ${notificationsOpen ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  4
                </span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-semibold text-slate-800">Notifications</h3>
                    <span className="text-xs font-medium text-blue-600 cursor-pointer hover:text-blue-700">Mark all as read</span>
                  </div>
                  <div className="max-h-[300px] overflow-auto">
                    {[
                      { title: "Vessel laycan updated", desc: "Supramax available Jun 15 - 20", time: "2h ago", unread: true },
                      { title: "Report generated", desc: "Requisition export completed.", time: "5h ago", unread: true },
                      { title: "Draft alert", desc: "Haldia port draft restricted to 7.2m.", time: "1d ago", unread: true },
                      { title: "New forecast model", desc: "Q3 freight rates updated.", time: "2d ago", unread: true }
                    ].map((notif, i) => (
                      <div key={i} className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 flex gap-3 ${notif.unread ? 'bg-blue-50/30' : ''}`}>
                        <div className="mt-0.5">
                          <div className={`w-2 h-2 rounded-full ${notif.unread ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                        </div>
                        <div>
                          <p className={`text-sm ${notif.unread ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>{notif.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-slate-100 bg-slate-50">
                    <button className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative border-l border-slate-200 pl-3 sm:pl-6" ref={profileRef}>
              <div 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center cursor-pointer group"
              >
                <div className="text-right mr-3 hidden lg:block">
                  <p className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors">Admin User</p>
                  <p className="text-xs text-slate-500">Oceanix Corp.</p>
                </div>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 border text-slate-600 flex items-center justify-center shrink-0 overflow-hidden transition-all ${profileOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 group-hover:border-blue-300'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 mt-1 sm:mt-2">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-800">Admin User</p>
                    <p className="text-xs text-slate-500 mt-0.5">admin@oceanix.com</p>
                  </div>
                  <div className="p-2">
                    <Link href="/dashboard/settings" className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
                      <User className="w-4 h-4 mr-3 text-slate-400" />
                      My Profile
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
                      <Settings className="w-4 h-4 mr-3 text-slate-400" />
                      Account Settings
                    </Link>
                  </div>
                  <div className="p-2 border-t border-slate-100">
                    <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4 mr-3 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
