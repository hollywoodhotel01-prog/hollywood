"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BedDouble,
  FileText,
  Receipt,
  Calculator,
  Hotel,
  ShieldCheck,
} from "lucide-react";

export default function DashboardSidebar() {
  const pathname = usePathname();

  const isAccountantView = pathname.includes("/dashboard/accountant");

  const coreLinks = [
    { name: "Admin Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
    { name: "Rooms Mgmt", href: "/dashboard/rooms", icon: BedDouble },
  ];

  const financeLinks = [
    { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
    { name: "Receipts", href: "/dashboard/receipts", icon: Receipt },
    { name: "Accountant Portal", href: "/dashboard/accountant", icon: Calculator },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r-2 border-gray-100 h-[calc(100vh-80px)] sticky top-20 shadow-[10px_0_30px_rgba(0,0,0,0.02)] z-20 overflow-y-auto">
      {/* Header / Brand */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-black p-2 rounded-xl text-gold group-hover:bg-gold group-hover:text-black transition-colors shadow-md">
            <Hotel size={20} strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-heading font-black text-lg text-black block leading-none">
              Midland Portal
            </span>
            <span className="text-[10px] font-bold text-gold-dark uppercase tracking-wider">
              {isAccountantView ? "Finance Dept" : "Administration"}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="p-5 flex-1 space-y-6">
        {/* Core Hotel Mgmt */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-3">
            Hotel Operations
          </p>
          <nav className="space-y-1.5">
            {coreLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    isActive
                      ? "bg-black text-gold shadow-md"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  <link.icon size={18} strokeWidth={isActive ? 2.5 : 2} /> {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Finance & Accounting */}
        <div>
          <p className="text-[11px] font-bold text-gold-dark uppercase tracking-widest mb-3 px-3 flex items-center justify-between">
            <span>Finance & Billing</span>
            <span className="text-[9px] bg-gold/20 text-black px-1.5 py-0.5 rounded font-black border border-gold/30">
              SPEC
            </span>
          </p>
          <nav className="space-y-1.5">
            {financeLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    isActive
                      ? "bg-black text-gold shadow-md"
                      : "text-gray-600 hover:bg-gold/10 hover:text-black"
                  }`}
                >
                  <link.icon size={18} strokeWidth={isActive ? 2.5 : 2} /> {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Quick Role Switcher Banner */}
      <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50/70">
        <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-500 font-semibold flex items-center gap-1">
              <ShieldCheck size={14} className="text-green-600" /> Active Role:
            </span>
            <span className="font-bold text-black uppercase">
              {isAccountantView ? "Accountant" : "Admin"}
            </span>
          </div>
          <Link
            href={isAccountantView ? "/dashboard" : "/dashboard/accountant"}
            className="block text-center w-full py-1.5 bg-gray-100 hover:bg-black hover:text-gold text-black rounded-lg text-xs font-bold transition-colors"
          >
            Switch to {isAccountantView ? "Admin Dashboard" : "Accountant Portal"}
          </Link>
        </div>
      </div>
    </aside>
  );
}
