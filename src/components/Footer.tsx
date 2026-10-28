"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer({ lang, dict }: { lang: string, dict: any }) {
  const pathname = usePathname();

  if (pathname?.includes("/dashboard")) {
    return null;
  }

  return (
    <footer className="bg-neutral-950 text-white pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href={`/${lang}`} className="flex items-center gap-3 mb-4 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-white/20 bg-white group-hover:scale-105 transition-all shrink-0 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Hollywood Hotel Logo"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="font-heading font-black text-xl tracking-tight text-white">
                Hollywood Hotel
              </span>
            </Link>
            <p className="text-gray-400 font-normal text-sm leading-relaxed mb-6">
              Where every moment shines. Your premier destination for luxury stays, grand events, exquisite dining, and world-class wellness.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-base mb-4 text-white uppercase tracking-wider text-xs">Explore</h4>
            <ul className="space-y-3">
              <li><Link href={`/${lang}`} className="text-gray-400 hover:text-white transition-colors text-sm">{dict.home}</Link></li>
              <li><Link href={`/${lang}/rooms`} className="text-gray-400 hover:text-white transition-colors text-sm">{dict.rooms}</Link></li>
              <li><Link href={`/${lang}/tour`} className="text-gray-400 hover:text-white transition-colors text-sm">{dict.tour || "Tour"}</Link></li>
              <li><Link href={`/${lang}/conference`} className="text-gray-400 hover:text-white transition-colors text-sm">{dict.conference}</Link></li>
              <li><Link href={`/${lang}/dining`} className="text-gray-400 hover:text-white transition-colors text-sm">{dict.dining}</Link></li>
              <li><Link href={`/${lang}/facilities`} className="text-gray-400 hover:text-white transition-colors text-sm">{dict.facilities || dict.wellness}</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="font-heading font-bold text-base mb-4 text-white uppercase tracking-wider text-xs">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 font-normal">
                <div className="bg-white/5 p-1.5 rounded-md mt-0.5 border border-white/10">
                  <MapPin className="text-amber-400 shrink-0" size={15} />
                </div>
                <span className="text-sm mt-0.5">Kagitumba Road, Rwimiyaga<br />Nyagatare District, Eastern Province, Rwanda</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 font-normal">
                <div className="bg-white/5 p-1.5 rounded-md border border-white/10">
                  <Phone className="text-amber-400 shrink-0" size={15} />
                </div>
                <div className="flex flex-col text-sm">
                  <a href="tel:+250788876479" className="hover:text-white transition-colors">
                    +250 788 876 479
                  </a>
                  <a
                    href="https://wa.me/250788876479"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-400 font-normal">
                <div className="bg-white/5 p-1.5 rounded-md border border-white/10">
                  <Mail className="text-amber-400 shrink-0" size={15} />
                </div>
                <a href="mailto:hollywoodhotel01@gmail.com" className="text-sm hover:text-white transition-colors">
                  hollywoodhotel01@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 font-normal text-xs">
            &copy; {new Date().getFullYear()} Hollywood Hotel. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href={`/${lang}/login`} className="text-gray-400 hover:text-white transition-colors text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              Hotel Control System
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
