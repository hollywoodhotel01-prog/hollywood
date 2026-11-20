import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda
    ? "Amafunguro & Hollywood Bar mu Ntara y'Iburasirazuba"
    : "Fine Dining & Hollywood Bar in Eastern Province & Nyagatare";
  const description = isKinyarwanda
    ? "Sogongera ku mafunguro meza n'ibinyobwa bidasanzwe muri Hollywood Bar muri Hollywood Hotel i Rwimiyaga, Nyagatare mu Ntara y'Iburasirazuba, u Rwanda."
    : "Indulge in culinary excellence at Hollywood Hotel restaurant and unwind at Hollywood Bar in Rwimiyaga, Nyagatare District, Eastern Province, Rwanda. Exquisite dining and cocktails.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/dining`,
      languages: {
        en: "/en/dining",
        rw: "/rw/dining",
        "x-default": "/en/dining",
      },
    },
    openGraph: {
      title: `${title} | Hollywood Hotel — Eastern Province, Rwanda`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/dining`,
      images: [
        {
          url: "/bar.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Dining and Hollywood Bar in Eastern Province, Rwanda",
        },
      ],
    },
  };
}

export default function DiningLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
