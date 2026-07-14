"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, BedDouble, Settings, Hotel } from "lucide-react";

export default function DashboardSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
    { name: "Rooms Mgmt", href: "/dashboard/rooms", icon: BedDouble },
    { name: "Settings", href: "#", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r-2 border-gray-100 h-[calc(100vh-80px)] sticky top-20 shadow-[10px_0_30px_rgba(0,0,0,0.02)] z-20">
      <div className="p-8 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-black p-2 rounded-xl text-gold group-hover:bg-gold group-hover:text-black transition-colors shadow-md">
            <Hotel size={20} strokeWidth={2.5} />
          </div>
          <span className="font-heading font-black text-xl text-black">
            Admin
          </span>
        </Link>
      </div>
      <div className="p-6 flex-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">Management</p>
        <nav className="space-y-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all ${
                  isActive
                    ? "bg-black text-gold shadow-md"
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} /> {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-6 text-xs text-gray-400 font-medium text-center border-t border-gray-100 bg-gray-50/50">
        Add authentication in production.
      </div>
    </aside>
  );
}
