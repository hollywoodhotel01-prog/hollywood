import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  colorScheme: "dark light",
};
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda
    ? "Hollywood Hotel Nyagatare | Icumbi ry'Ubwiza i Rwimiyaga, Rwanda"
    : "Hollywood Hotel Nyagatare | Luxury Hotel in Rwimiyaga, Rwanda";

  const description = isKinyarwanda
    ? "Gira ibihe byiza muri Hollywood Hotel ku Muhanda wa Kagitumba, Rwimiyaga, Akarere ka Nyagatare, mu Ntara y'Iburasirazuba. Hoteli y'akataraboneka mu zizwi nka Hollywood muri hoteli z'i Nyagatare (Hollywood in Nyagatare hotels) ifite ibyumba byiza, salle z'inama, Hollywood Bar, pisine, spa na resitora ihebuje."
    : "Experience premier luxury at Hollywood Hotel on Kagitumba Road, Rwimiyaga, Nyagatare District, Eastern Province, Rwanda. The #1 destination for Hollywood in Nyagatare hotels offering luxury suites, conference halls, Hollywood Bar, swimming pool, wellness spa, and exquisite dining.";

  return {
    metadataBase: new URL("https://hollywoodhotel.rw"),
    title: {
      default: title,
      template: "%s | Hollywood Hotel",
    },
    description,
    applicationName: "Hollywood Hotel",
    authors: [{ name: "Hollywood Hotel", url: "https://hollywoodhotel.rw" }],
    creator: "Hollywood Hotel",
    publisher: "Hollywood Hotel",
    category: "travel",
    keywords: [
      "hollywood in nyagatare hotels",
      "hollywood hotel nyagatare",
      "hollywood in nyagatare",
      "Hollywood Hotel",
      "Hollywood Hotel Rwanda",
      "Hollywood Hotel Rwimiyaga",
      "Rwimiyaga hotel",
      "Hotel in Rwimiyaga",
      "Nyagatare hotel Rwanda",
      "Nyagatare hotels",
      "hotels in nyagatare rwanda",
      "best hotel in nyagatare",
      "Kagitumba Road hotel",
      "Kagitumba Road Rwimiyaga Nyagatare District Eastern Province Rwanda",
      "Eastern Province Rwanda hotel",
      "Luxury hotel Rwanda",
      "Rwanda hotel booking",
      "Rwimiyaga accommodation",
      "Hollywood Bar",
      "Hollywood Hotel conference hall",
      "Rwanda luxury suites",
      "Best hotel in Rwimiyaga Nyagatare",
      "Hollywood suites Rwanda",
    ],
    alternates: {
      canonical: `/${lang}`,
      languages: {
        en: "/en",
        rw: "/rw",
        "x-default": "/en",
      },
    },
    openGraph: {
      type: "website",
      locale: isKinyarwanda ? "rw_RW" : "en_US",
      alternateLocale: [isKinyarwanda ? "en_US" : "rw_RW"],
      url: `https://hollywoodhotel.rw/${lang}`,
      siteName: "Hollywood Hotel",
      title,
      description,
      images: [
        {
          url: "/hero.webp",
          width: 1200,
          height: 630,
          alt: "Hollywood Hotel - Premier Luxury Accommodation in Rwimiyaga, Rwanda",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/hero.webp"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/icon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/icon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      shortcut: ["/icon/favicon.ico"],
      apple: [
        { url: "/icon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          rel: "apple-touch-icon-precomposed",
          url: "/icon/apple-touch-icon.png",
        },
      ],
    },
    manifest: "/manifest.webmanifest",
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Hotel",
        "@id": "https://hollywoodhotel.rw/#hotel",
        "name": "Hollywood Hotel",
        "alternateName": [
          "Hollywood in Nyagatare Hotels",
          "Hollywood Hotel Nyagatare",
          "Hollywood Hotel Rwimiyaga"
        ],
        "url": "https://hollywoodhotel.rw",
        "logo": "https://hollywoodhotel.rw/logo.png",
        "image": [
          "https://hollywoodhotel.rw/hero.webp",
          "https://hollywoodhotel.rw/night.webp",
          "https://hollywoodhotel.rw/evening.webp",
          "https://hollywoodhotel.rw/reception.webp",
          "https://hollywoodhotel.rw/bed.webp",
          "https://hollywoodhotel.rw/hollywood-bar.webp",
          "https://hollywoodhotel.rw/garden.webp",
          "https://hollywoodhotel.rw/front.webp"
        ],
        "description":
          "Premier luxury hotel on Kagitumba Road, Rwimiyaga, Nyagatare District, Eastern Province, Rwanda. Top destination among Hollywood in Nyagatare hotels offering luxury accommodations, conference halls, Hollywood Bar, wellness spa, and exquisite dining.",
        "telephone": "+250788876479",
        "email": "hollywoodhotel01@gmail.com",
        "priceRange": "$$",
        "currenciesAccepted": "RWF, USD",
        "paymentAccepted": "Cash, Credit Card, Mobile Money",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Kagitumba Road",
          "addressLocality": "Rwimiyaga",
          "addressRegion": "Nyagatare District, Eastern Province",
          "addressCountry": "RW"
        },
        "keywords": "hollywood in nyagatare hotels, hollywood hotel nyagatare, nyagatare hotels, hotels in nyagatare rwanda, kagitumba road hotel",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": -1.45,
          "longitude": 30.43,
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            "opens": "00:00",
            "closes": "23:59",
          },
        ],
        "amenityFeature": [
          {
            "@type": "LocationFeatureSpecification",
            "name": "Free High-Speed Wi-Fi",
            "value": true,
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Hollywood Bar",
            "value": true,
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Fine Dining Restaurant",
            "value": true,
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Swimming Pool",
            "value": true,
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Full-Service Spa & Sauna",
            "value": true,
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Modern Fitness Gym",
            "value": true,
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Conference & Event Halls",
            "value": true,
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Complimentary Secure Parking",
            "value": true,
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "24/7 Front Desk Concierge",
            "value": true,
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Airport & Bus Park Shuttle Service",
            "value": true,
          },
        ],
        "checkinTime": "14:00",
        "checkoutTime": "11:00",
        "starRating": {
          "@type": "Rating",
          "ratingValue": "4.8",
          "bestRating": "5",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://hollywoodhotel.rw/#website",
        "url": "https://hollywoodhotel.rw",
        "name": "Hollywood Hotel",
        "description": "Official website of Hollywood Hotel in Rwimiyaga, Rwanda",
        "publisher": {
          "@id": "https://hollywoodhotel.rw/#hotel",
        },
        "inLanguage": ["en-US", "rw-RW"],
      },
    ],
  };

  return (
    <html
      lang={lang}
      className={`${inter.variable} ${playfair.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon/android-chrome-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon/apple-touch-icon.png" />
        <link rel="apple-touch-icon-precomposed" sizes="180x180" href="/icon/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-title" content="Hollywood Hotel" />
        <meta name="application-name" content="Hollywood Hotel" />
        <meta name="msapplication-TileColor" content="#0B0B0B" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
