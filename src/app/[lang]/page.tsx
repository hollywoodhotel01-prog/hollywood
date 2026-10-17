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
    ? "Hollywood in Nyagatare Hotels | Hollywood Hotel - Kagitumba Road, Rwimiyaga, Eastern Province"
    : "Hollywood in Nyagatare Hotels | Hollywood Hotel - Kagitumba Road, Rwimiyaga, Eastern Province, Rwanda";

  const description = isKinyarwanda
    ? "Hitamo Hollywood Hotel, iyoboye mu zizwi nka Hollywood muri hoteli z'i Nyagatare (Hollywood in Nyagatare hotels). Duherereye ku Muhanda wa Kagitumba, Rwimiyaga, Akarere ka Nyagatare, Intara y'Iburasirazuba, u Rwanda. Tubafitiye ibyumba byiza, salle z'inama, Hollywood Bar, spa na pisine."
    : "Looking for Hollywood in Nyagatare hotels? Hollywood Hotel on Kagitumba Road, Rwimiyaga, Nyagatare District, Eastern Province, Rwanda is the top luxury hotel in Nyagatare. Book premium suites, conference halls, Hollywood Bar, wellness spa & dining.";

  const keywords = [
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
    "kagitumba road rwimiyaga nyagatare district rwanda",
    "kagitumba road nyagatare",
    "eastern province rwanda hotels",
    "hotels in eastern province rwanda",
    "rwimiyaga hotel",
    "hotel in rwimiyaga nyagatare",
    "hollywood hotel rwanda",
    "luxury hotel nyagatare",
    "nyagatare accommodations",
    "cheap and luxury hotels in nyagatare",
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

  const homeFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where is Hollywood Hotel located in Nyagatare, Eastern Province?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hollywood Hotel is located along Kagitumba Road, Rwimiyaga, Nyagatare District, Eastern Province, Rwanda."
        }
      },
      {
        "@type": "Question",
        "name": "Why is Hollywood Hotel the top choice among Hollywood in Nyagatare hotels in Eastern Province?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hollywood Hotel on Kagitumba Road, Rwimiyaga, Nyagatare District, Eastern Province is recognized as the leading destination among Hollywood in Nyagatare hotels, featuring 100+ luxury rooms and suites, executive conference and event halls, the famous Hollywood Bar, full wellness spa, sauna, and swimming pool."
        }
      },
      {
        "@type": "Question",
        "name": "How do I get to Hollywood Hotel on Kagitumba Road, Rwimiyaga, Eastern Province?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The hotel is easily accessible along the main Kagitumba Road in Rwimiyaga, Nyagatare District, Eastern Province, Rwanda, with complimentary secure on-site parking and 24/7 reception desk assistance."
        }
      }
    ]
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
