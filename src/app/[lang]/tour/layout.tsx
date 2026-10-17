import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda ? "Umutambagiro w'Amafoto | Hollywood Hotel" : "Tour & Photo Gallery | Hollywood Hotel";
  const description = isKinyarwanda
    ? "Tembera ubusitani bwiza, amariba y'amazi, ibyumba by'akataraboneka, salon ya VIP, n'ahantu hose h'agaciro muri Hollywood Hotel i Rwimiyaga, Nyagatare."
    : "Explore every corner of Hollywood Hotel in Rwimiyaga, Nyagatare. Take a virtual photographic tour through our lush gardens, water fountains, luxury suites, bar, and amenities.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/tour`,
    },
    openGraph: {
      title: `${title} | Hollywood Hotel`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/tour`,
      images: [
        {
          url: "/garden.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel Rwimiyaga - Scenic Gardens and Photo Tour",
        },
      ],
    },
  };
}

export default function TourLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
