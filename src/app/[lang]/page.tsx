import type { Metadata } from "next";
import { getDictionary, Locale } from "@/dictionaries";
import HomePageClient from "@/components/HomePageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda
    ? "Hoteli ya Mbere i Nyagatare (Best Hotel in Nyagatare) & Mu Ntara y'Iburasirazuba | Hollywood Hotel"
    : "Best Hotel in Nyagatare & Hotels in Eastern Province, Rwanda | Hollywood Hotel (Rwimiyaga)";

  const description = isKinyarwanda
    ? "Ushaka hoteli ya mbere i Nyagatare (best hotel in Nyagatare, Hollywood in Nyagatare hotels) no mu Ntara y'Iburasirazuba (hotels in Eastern Province, Rwanda)? Hitamo Hollywood Hotel ku Muhanda wa Kagitumba, Rwimiyaga, hafi ya Pariki y'Akagera."
    : "Looking for the best hotel in Nyagatare or top hotels in Eastern Province, Rwanda? Hollywood Hotel on Kagitumba Road, Rwimiyaga is the flagship choice among Hollywood in Nyagatare hotels and Eastern Province accommodations — luxury suites, conference halls, wedding marquee, Hollywood Bar & spa.";

  const keywords = [
    "hotels in eastern province",
    "hotels in eastern province rwanda",
    "best hotels in eastern province rwanda",
    "eastern province rwanda hotels",
    "luxury hotel in eastern province rwanda",
    "hoteli mu ntara y'iburasirazuba",
    "hotels near akagera national park",
    "hotels in nyagatare eastern province",
    "gatsibo kayonza rwamagana hotels",
    "hollywood in nyagatare hotels",
    "hollywood in nyagatare",
    "hollywood hotel nyagatare",
    "hollywood hotel rwimiyaga",
    "nyagatare hotels",
    "hotels in nyagatare",
    "hotels in nyagatare rwanda",
    "best hotel in nyagatare",
    "kagitumba road hotel",
    "kagitumba road rwimiyaga nyagatare district eastern province rwanda",
    "rwimiyaga hotel",
    "hotel in rwimiyaga nyagatare",
    "hollywood hotel rwanda",
    "luxury hotel nyagatare",
    "nyagatare accommodations",
  ];

  return {
    title,
    description,
    keywords,
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
      url: `https://hollywoodhotel.rw/${lang}`,
      siteName: "Hollywood Hotel",
      title,
      description,
      images: [
        {
          url: "/hero.webp",
          width: 1200,
          height: 630,
          alt: "Hollywood in Nyagatare Hotels - Hollywood Hotel, Kagitumba Road, Rwimiyaga, Nyagatare District, Eastern Province, Rwanda",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/hero.webp"],
    },
  };
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const faqItems = dict.home?.easternProvinceHub?.faqs || [
    {
      question: "Why is Hollywood Hotel rated the best hotel in Nyagatare and among hotels in Eastern Province, Rwanda?",
      answer: "Hollywood Hotel in Rwimiyaga, Nyagatare District is widely recognized as the best hotel in Nyagatare and the flagship luxury destination among hotels in Eastern Province, Rwanda — combining 100+ modern rooms and VIP suites, executive conference halls, a 500+ guest wedding marquee, Hollywood Bar, fine dining, fitness gym, sauna, and wellness spa."
    },
    {
      question: "Where is Hollywood Hotel located in Eastern Province, Rwanda?",
      answer: "Hollywood Hotel is ideally situated directly along Kagitumba Road in Rwimiyaga, Nyagatare District, Eastern Province, Rwanda — easily reachable from Kigali, Rwamagana, Kayonza, Gatsibo, Nyagatare Town, and the Kagitumba One-Stop Border Post."
    },
    {
      question: "How far is Hollywood Hotel from Akagera National Park, Nyagatare Town, Gatsibo, Kayonza, and Kagitumba Border?",
      answer: "Located in the strategic Eastern Province corridor along the paved Kagitumba highway, Hollywood Hotel offers fast direct driving access to Nyagatare Town, Gabiro & Gatsibo, Kayonza & Rwamagana, Kagitumba Border Post, and the northern/eastern safari routes to Akagera National Park."
    },
    {
      question: "What room categories and prices does Hollywood Hotel offer in Eastern Province?",
      answer: "We offer four luxury room classes with transparent RWF rates: Standard Rooms (from 50,000 RWF/night), Superior Sky-View Rooms (from 80,000 RWF/night), Deluxe Balcony & Office Rooms (from 120,000 RWF/night), and Executive VIP Suites (from 200,000 RWF/night), all including high-speed Wi-Fi and 24/7 concierge care."
    },
    {
      question: "Does Hollywood Hotel host conferences, government summits, and weddings in Eastern Province?",
      answer: "Yes. Hollywood Hotel is a premier Eastern Province event venue featuring an air-conditioned indoor Executive Conference Hall (150+ guests with 4K screens and fiber Wi-Fi) and a Grand Outdoor Garden Wedding & Party Marquee Tent (500+ guests)."
    },
    {
      question: "How can I book a room or reserve an event at Hollywood Hotel in Eastern Province, Rwanda?",
      answer: "You can reserve online 24/7 via hollywoodhotel.rw/en/book or connect instantly with our front desk via phone/WhatsApp on +250 788 876 479 or email hollywoodhotel01@gmail.com."
    }
  ];

  const homeFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((item: { question: string; answer: string }) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />
      <HomePageClient lang={lang} dict={dict.home} />
    </>
  );
}
