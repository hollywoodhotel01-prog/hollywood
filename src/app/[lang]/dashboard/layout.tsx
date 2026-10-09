"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useHotel } from "@/context/HotelContext";
import { useLanguage } from "@/context/LanguageContext";
import ControlSidebar from "@/components/ControlSidebar";
import { Menu, Hotel, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, authLoading } = useHotel();
  const { dict, lang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push(`/${lang}/login`);
    }
  }, [currentUser, authLoading, router, lang]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">{dict.dashboard.checkingCredentials}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 flex flex-col md:flex-row relative">
      {/* Background Grid Pattern */}
      <div className="absolute top-0 right-0 w-full h-[300px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Mobile Sticky Top Header with Hamburger on Left */}
      <div className="md:hidden sticky top-20 z-30 bg-black text-white border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-md print:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2.5 px-3 py-2 bg-gold/10 hover:bg-gold hover:text-black border border-gold/30 rounded-xl text-gold font-bold text-xs transition-all active:scale-95 shadow-sm"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu size={20} />
          <span className="uppercase tracking-wider">Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-black text-gold uppercase tracking-wider">
            {currentUser.role} Portal
          </span>
        </div>
      </div>

      {/* Backdrop Overlay when Mobile Sidebar is open */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden cursor-pointer"
            aria-label="Close Mobile Sidebar Overlay"
          />
        )}
      </AnimatePresence>

      {/* Control Sidebar (Responsive Drawer on Mobile, Pinned on Desktop) */}
      <ControlSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Dashboard Content Wrapper */}
      <main id="main-content" className="flex-1 w-full max-w-full p-4 sm:p-6 md:p-12 overflow-x-hidden relative z-10 flex flex-col min-h-[calc(100vh-80px)]">
        <div className="w-full">{children}</div>
        <footer className="mt-auto pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium print:hidden">
          <p>&copy; {new Date().getFullYear()} Hollywood Hotel Management System. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="capitalize">{currentUser.role} Portal</span>
            <span>&bull;</span>
            <span>Rwanda</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

