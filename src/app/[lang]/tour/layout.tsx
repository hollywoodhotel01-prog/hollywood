import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda
    ? "Umutambagiro w'Amafoto mu Ntara y'Iburasirazuba & Nyagatare"
    : "Tour & Photo Gallery in Eastern Province & Nyagatare";
  const description = isKinyarwanda
    ? "Tembera ubusitani bwiza, amariba y'amazi, ibyumba by'akataraboneka, salon ya VIP, n'ahantu hose h'agaciro muri Hollywood Hotel i Rwimiyaga, Nyagatare mu Ntara y'Iburasirazuba."
    : "Explore every corner of Hollywood Hotel in Rwimiyaga, Nyagatare District, Eastern Province, Rwanda. Virtual photographic tour of our lush gardens, water fountains, luxury suites, bar, and amenities.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/tour`,
      languages: {
        en: "/en/tour",
        rw: "/rw/tour",
        "x-default": "/en/tour",
      },
    },
    openGraph: {
      title: `${title} | Hollywood Hotel — Eastern Province, Rwanda`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/tour`,
      images: [
        {
          url: "/garden.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel Rwimiyaga Nyagatare - Scenic Gardens in Eastern Province, Rwanda",
        },
      ],
    },
  };
}

export default function TourLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
