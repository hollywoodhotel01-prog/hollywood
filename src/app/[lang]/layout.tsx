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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda
    ? "Hollywood Hotel | Icumbi ry'Ubwiza n'Umutuzo i Rwimiyaga, Rwanda"
    : "Hollywood Hotel | Luxury Hotel & Suites in Rwimiyaga, Rwanda";

  const description = isKinyarwanda
    ? "Gira ibihe byiza muri Hollywood Hotel i Rwimiyaga, mu Ntara y'Iburasirazuba. Tubafitiye ibyumba byiza byo kuraramo, salle z'inama ziteguye neza, Baraza Lounge & Bar, pisine, spa na resitora ihebuje."
    : "Experience luxury and elegance at Hollywood Hotel in Rwimiyaga, Eastern Province, Rwanda. Offering premium suites, state-of-the-art conference halls, Baraza Lounge & Bar, swimming pool, wellness spa, and exquisite dining.";

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
      "Hollywood Hotel",
      "Hollywood Hotel Rwanda",
      "Hollywood Hotel Rwimiyaga",
      "Rwimiyaga hotel",
      "Hotel in Rwimiyaga",
      "Nyagatare hotel Rwanda",
      "Eastern Province Rwanda hotel",
      "Luxury hotel Rwanda",
      "Rwanda hotel booking",
      "Rwimiyaga accommodation",
      "Baraza Lounge & Bar",
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
      icon: [{ url: "/favicon.ico" }],
      shortcut: ["/favicon.ico"],
      apple: [{ url: "/favicon.ico" }],
    },
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
        "alternateName": "Hollywood Hotel Rwimiyaga",
        "url": "https://hollywoodhotel.rw",
        "logo": "https://hollywoodhotel.rw/hero.webp",
        "image": [
          "https://hollywoodhotel.rw/hero.webp",
          "https://hollywoodhotel.rw/night.webp",
          "https://hollywoodhotel.rw/evening.webp",
          "https://hollywoodhotel.rw/bed.webp",
          "https://hollywoodhotel.rw/baraza.webp",
          "https://hollywoodhotel.rw/garden.webp",
          "https://hollywoodhotel.rw/front.webp",
        ],
        "description":
          "Premier luxury hotel in Rwimiyaga, Eastern Province, Rwanda offering luxury accommodations, conference halls, Baraza Lounge & Bar, wellness spa, and exquisite dining.",
        "telephone": "+250788876479",
        "email": "hollywoodhotel01@gmail.com",
        "priceRange": "$$",
        "currenciesAccepted": "RWF, USD",
        "paymentAccepted": "Cash, Credit Card, Mobile Money",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Rwimiyaga Center",
          "addressLocality": "Rwimiyaga",
          "addressRegion": "Eastern Province",
          "addressCountry": "RW",
        },
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
            "name": "Baraza Lounge & Bar",
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
