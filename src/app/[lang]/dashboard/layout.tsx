"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHotel } from "@/context/HotelContext";
import { useLanguage } from "@/context/LanguageContext";
import ControlSidebar from "@/components/ControlSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useHotel();
  const { dict } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

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
    <div className="min-h-screen bg-white pt-20 flex relative">
      <div className="absolute top-0 right-0 w-full h-[300px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <ControlSidebar />
      <main className="flex-1 p-8 md:p-12 overflow-y-auto relative z-10 flex flex-col justify-between min-h-[calc(100vh-80px)]">
        <div>{children}</div>
        <footer className="mt-16 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium">
          <p>&copy; {new Date().getFullYear()} Hollywood Hotel Management System. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="capitalize">{currentUser.role} Portal</span>
            <span>&bull;</span>
            <span>Kayonza, Rwanda</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
