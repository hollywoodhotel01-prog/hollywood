"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Hotel, Globe } from "lucide-react";
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
    { name: dict.rooms, href: `/${lang}/rooms` },
    { name: dict.conference, href: `/${lang}/conference` },
    { name: dict.dining, href: `/${lang}/dining` },
    { name: dict.wellness, href: `/${lang}/wellness` },
    { name: dict.contact, href: `/${lang}/contact` },
  ];

  const switchLanguage = () => {
    const newLang = lang === "en" ? "rw" : "en";
    const currentPathWithoutLang = pathname.replace(`/${lang}`, "") || "/";
    router.push(`/${newLang}${currentPathWithoutLang}`);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-black backdrop-blur-md shadow-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href={`/${lang}`} className="flex items-center gap-2 group">
            <div className="bg-gold p-2 rounded-lg text-black group-hover:bg-gold-light transition-colors">
              <Hotel size={24} />
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight transition-colors text-white">
              Hollywood Hotel
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-gold ${
                  pathname === link.href ? "text-gold" : "text-gray-200"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href={`/${lang}/login`}
              className="text-sm font-medium text-gray-400 hover:text-gold transition-colors border border-white/10 px-3 py-1.5 rounded-lg"
            >
              {dict.dashboard || "Staff Login"}
            </Link>
            <Link
              href={`/${lang}/book`}
              className="bg-gold hover:bg-gold-light text-black px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {dict.bookNow}
            </Link>
            <button
              onClick={switchLanguage}
              className="flex items-center gap-2 text-sm font-medium text-gray-200 hover:text-gold transition-colors border border-white/20 px-3 py-1.5 rounded-full"
            >
              <Globe size={16} />
              {lang === "en" ? "RW" : "EN"}
            </button>
          </nav>

          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={switchLanguage}
              className="flex items-center gap-1 text-sm font-medium text-gray-200 hover:text-gold transition-colors border border-white/20 px-2 py-1 rounded-full"
            >
              <Globe size={14} />
              {lang === "en" ? "RW" : "EN"}
            </button>
            <button
              className="p-2 text-white hover:text-gold transition-colors"
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
            className="md:hidden bg-black border-t border-gray-800"
          >
            <div className="px-4 pt-2 pb-6 space-y-1 shadow-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-3 py-4 text-base font-medium border-b border-gray-800 ${
                    pathname === link.href ? "text-gold" : "text-gray-300"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link href={`/${lang}/login`} className="block px-3 py-4 text-base font-medium border-b border-gray-800 text-gray-500">
                {dict.dashboard || "Staff Login"}
              </Link>
              <div className="pt-4">
                <Link href={`/${lang}/book`} className="block w-full text-center bg-gold text-black px-6 py-3 rounded-lg font-bold shadow-md">
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
