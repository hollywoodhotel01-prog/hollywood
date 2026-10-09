"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, BedDouble, DollarSign, Users, ClipboardList, Hotel, LogOut, CreditCard, X, FileText, Receipt, KeyRound, LineChart, PieChart } from "lucide-react";
import { useHotel } from "@/context/HotelContext";
import { useLanguage } from "@/context/LanguageContext";

interface ControlSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ControlSidebar({ isOpen = false, onClose }: ControlSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, bookings, conferenceBookings } = useHotel();
  const { lang, dict } = useLanguage();
  const d = dict.dashboard;
  
  const pendingCount = bookings.filter(b => b.status === "Pending").length + conferenceBookings.filter(b => b.status === "Pending").length;

  useEffect(() => {
    onClose?.();
  }, [pathname]);

  const adminLinks = [
    { name: d.adminOverview, href: `/${lang}/dashboard`, icon: LayoutDashboard },
    { name: d.allBookings, href: `/${lang}/dashboard/bookings`, icon: Calendar },
    { name: d.roomsStatus, href: `/${lang}/dashboard/rooms`, icon: BedDouble },
    { name: d.cashier, href: `/${lang}/dashboard/cashier`, icon: CreditCard },
    { name: d.receptionist, href: `/${lang}/dashboard/receptionist`, icon: ClipboardList },
    { name: d.dailyFinance, href: `/${lang}/dashboard/finance`, icon: LineChart },
    { name: d.reports, href: `/${lang}/dashboard/reports`, icon: PieChart },
  ];

  const changePasswordHref = `/${lang}/dashboard/change-password`;
  const isChangePasswordActive = pathname === changePasswordHref;

  const cashierLinks = [
    { name: d.dailyReport, href: `/${lang}/dashboard/cashier`, icon: CreditCard },
  ];

  const receptionistLinks = [
    { name: d.frontDesk, href: `/${lang}/dashboard/receptionist`, icon: ClipboardList },
    { name: d.roomsStatus, href: `/${lang}/dashboard/rooms`, icon: BedDouble },
    { name: d.allBookings, href: `/${lang}/dashboard/bookings`, icon: Calendar },
  ];

  const accountantLinks = [
    { name: d.dailyFinance, href: `/${lang}/dashboard/finance`, icon: LineChart },
    { name: d.reports, href: `/${lang}/dashboard/reports`, icon: PieChart },
    { name: d.allBookings, href: `/${lang}/dashboard/bookings`, icon: Calendar },
    { name: d.invoices, href: `/${lang}/dashboard/invoices`, icon: FileText },
    { name: d.receipts, href: `/${lang}/dashboard/receipts`, icon: Receipt },
  ];

  const linksByRole: Record<string, typeof adminLinks> = {
    admin: adminLinks,
    cashier: cashierLinks,
    receptionist: receptionistLinks,
    accountant: accountantLinks,
  };

  const links = currentUser ? (linksByRole[currentUser.role] ?? adminLinks) : adminLinks;

  const handleLogout = () => {
    onClose?.();
    logout();
    router.push(`/${lang}/login`);
  };

  const handleLinkClick = () => {
    onClose?.();
  };

  return (
    <aside
      className={`bg-black border-r border-white/10 overflow-y-auto flex flex-col
        /* Mobile styles: fixed full-height drawer */
        fixed top-0 left-0 z-50 w-72 max-w-[85vw] h-screen shadow-2xl transition-transform duration-300 ease-in-out
        /* Desktop styles: normal sticky column */
        md:sticky md:top-20 md:h-[calc(100vh-80px)] md:w-64 md:shrink-0 md:z-20 md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 pointer-events-none md:pointer-events-auto"}
        print:hidden
      `}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <Link href={`/${lang}`} onClick={handleLinkClick} className="flex items-center gap-3 group">
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
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden p-2 text-gray-400 hover:text-gold rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
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
                  onClick={handleLinkClick}
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
                  {link.name === d.allBookings && pendingCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Admin: Change Password + Logout Footer */}
      <div className="p-5 border-t border-white/10 bg-black space-y-2.5">
        {currentUser?.role === "admin" && (
          <Link
            href={changePasswordHref}
            onClick={handleLinkClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 border ${
              isChangePasswordActive
                ? "bg-gold text-black border-gold shadow-[0_4px_20px_rgba(251,191,36,0.3)] font-black"
                : "bg-white/5 border-white/10 text-amber-400 hover:text-amber-300 hover:bg-white/10 hover:border-amber-400/40 shadow-sm"
            }`}
          >
            <KeyRound
              size={18}
              strokeWidth={isChangePasswordActive ? 2.5 : 2}
              className={isChangePasswordActive ? "text-black" : "text-amber-400"}
            />
            <span>{(d as any).changePassword ?? "Change Password"}</span>
          </Link>
        )}
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

