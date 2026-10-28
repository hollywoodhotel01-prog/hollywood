"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ lang, dict }: { lang: string, dict: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {};
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const navLinks = [
    { name: dict.home, href: `/${lang}` },
    { name: dict.rooms === "Rooms & Suites" ? "Rooms" : (dict.rooms || "Rooms"), href: `/${lang}/rooms` },
    { name: dict.tour || "Tour", href: `/${lang}/tour` },
    { name: dict.conference === "Conferences & Events" ? "Events" : (dict.conference || "Events"), href: `/${lang}/conference` },
    { name: dict.dining, href: `/${lang}/dining` },
    { name: dict.facilities || dict.wellness, href: `/${lang}/facilities` },
    { name: dict.sauna || (lang === "rw" ? "Sawuna" : "Sauna"), href: `/${lang}/sauna` },
    { name: dict.contact, href: `/${lang}/contact` },
  ];

  const switchLanguage = () => {
    const newLang = lang === "en" ? "rw" : "en";
    const currentPathWithoutLang = pathname.replace(`/${lang}`, "") || "/";
    router.push(`/${newLang}${currentPathWithoutLang}`);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-black/10 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href={`/${lang}`} className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-sm border border-black/10 bg-white group-hover:scale-105 transition-all shrink-0 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Hollywood Hotel Logo"
                width={48}
                height={48}
                priority
                className="object-cover w-full h-full"
              />
            </div>
            <span className="font-heading font-bold text-xl sm:text-2xl tracking-tight transition-colors text-black">
              Hollywood Hotel
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm xl:text-[15px] transition-colors whitespace-nowrap ${
                  pathname === link.href ? "text-black font-bold" : "text-neutral-600 hover:text-black font-medium"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href={`/${lang}/book`}
              className="bg-black hover:bg-neutral-800 text-white px-5 xl:px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              {dict.bookNow}
            </Link>
            <button
              onClick={switchLanguage}
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-black transition-colors border border-neutral-300 hover:border-black px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer"
            >
              <Globe size={14} />
              {lang === "en" ? "RW" : "EN"}
            </button>
          </nav>

          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={switchLanguage}
              className="flex items-center gap-1 text-xs font-bold text-neutral-700 hover:text-black transition-colors border border-neutral-300 px-2.5 py-1 rounded-full cursor-pointer"
            >
              <Globe size={13} />
              {lang === "en" ? "RW" : "EN"}
            </button>
            <button
              className="p-2 text-black hover:text-neutral-600 transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 pt-2 pb-6 space-y-1 shadow-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-3 py-3 text-base border-b border-gray-100 ${
                    pathname === link.href ? "text-black font-bold" : "text-neutral-600 font-medium"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4">
                <Link href={`/${lang}/book`} className="block w-full text-center bg-black hover:bg-neutral-800 text-white px-6 py-3 rounded-xl font-bold text-base shadow-sm">
                  {dict.bookNow}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
