import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import { BookingProvider } from "@/context/BookingContext";
import { FinanceProvider } from "@/context/FinanceContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDictionary, Locale } from "@/dictionaries";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Midland Hotel | Premium Accommodation in Kayonza",
  description: "Experience comfort and elegance at Midland Hotel, located just minutes from Kayonza Bus Park. Offering premium rooms, conference halls, and exquisite dining.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang} className={`${inter.variable} ${playfair.variable} h-full antialiased scroll-smooth`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LanguageProvider lang={lang as Locale} dict={dict}>
          <BookingProvider>
            <FinanceProvider>
              <Navbar lang={lang} dict={dict.navigation} />
              <main className="flex-1">{children}</main>
              <Footer lang={lang} dict={dict.navigation} />
            </FinanceProvider>
          </BookingProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
