"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, BedDouble, DollarSign, Users, ClipboardList, Hotel, LogOut, CreditCard } from "lucide-react";
import { useHotel } from "@/context/HotelContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ControlSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useHotel();
  const { lang, dict } = useLanguage();
  const d = dict.dashboard;

  const adminLinks = [
    { name: d.adminOverview, href: `/${lang}/dashboard`, icon: LayoutDashboard },
    { name: d.allBookings, href: `/${lang}/dashboard/bookings`, icon: Calendar },
    { name: d.roomsStatus, href: `/${lang}/dashboard/rooms`, icon: BedDouble },
    { name: d.cashier, href: `/${lang}/dashboard/cashier`, icon: CreditCard },
    { name: d.receptionist, href: `/${lang}/dashboard/receptionist`, icon: ClipboardList },
    { name: d.accountant, href: `/${lang}/dashboard/accountant`, icon: DollarSign },
  ];

  const cashierLinks = [
    { name: d.dailyReport, href: `/${lang}/dashboard/cashier`, icon: CreditCard },
  ];

  const receptionistLinks = [
    { name: d.frontDesk, href: `/${lang}/dashboard/receptionist`, icon: ClipboardList },
    { name: d.roomsStatus, href: `/${lang}/dashboard/rooms`, icon: BedDouble },
  ];

  const accountantLinks = [
    { name: d.revenueOverview, href: `/${lang}/dashboard/accountant`, icon: DollarSign },
    { name: d.allBookings, href: `/${lang}/dashboard/bookings`, icon: Calendar },
  ];

  const linksByRole: Record<string, typeof adminLinks> = {
    admin: adminLinks,
    cashier: cashierLinks,
    receptionist: receptionistLinks,
    accountant: accountantLinks,
  };

  const links = currentUser ? (linksByRole[currentUser.role] ?? adminLinks) : adminLinks;

  const handleLogout = () => {
    logout();
    router.push(`/${lang}/login`);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-black border-r border-white/10 h-[calc(100vh-80px)] sticky top-20 z-20 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <Link href={`/${lang}`} className="flex items-center gap-3 group">
          <div className="bg-gold p-2.5 rounded-xl text-black shadow-[0_0_15px_rgba(251,191,36,0.3)] group-hover:scale-105 transition-transform">
            <Hotel size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-heading font-black text-base text-gold block leading-tight tracking-wide">
              Hollywood Hotel
            </span>
            <span className="text-xs text-gold/80 font-bold uppercase tracking-wider block mt-0.5">
              {currentUser ? ((d as any)[currentUser.role] || currentUser.role) : "Guest"}
            </span>
          </div>
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="p-5 flex-1 space-y-6 overflow-y-auto">
        {/* Signed In User Card */}
        {currentUser && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-black text-gold uppercase tracking-widest mb-1">
              {d.signedInAs}
            </p>
            <p className="text-sm font-bold text-white truncate">
              {currentUser.name}
            </p>
          </div>
        )}

        {/* Navigation Cards */}
        <div>
          <p className="text-[10px] font-black text-gold uppercase tracking-widest mb-3 px-2">
            {d.navigation}
          </p>
          <nav className="space-y-2.5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`group flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 border ${
                    isActive
                      ? "bg-gold text-black border-gold shadow-[0_4px_20px_rgba(251,191,36,0.3)] font-black"
                      : "bg-white/5 border-white/10 text-white hover:text-gold hover:bg-white/10 hover:border-gold/40 shadow-sm"
                  }`}
                >
                  <link.icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors ${
                      isActive ? "text-black" : "text-white/80 group-hover:text-gold"
                    }`}
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Logout Action Footer */}
      <div className="p-5 border-t border-white/10 bg-black">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 transition-all shadow-sm"
        >
          <LogOut size={18} />
          <span>{d.signOut}</span>
        </button>
      </div>
    </aside>
  );
}
