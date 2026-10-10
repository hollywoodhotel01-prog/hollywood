import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda ? "Amafunguro & Baraza Lounge" : "Fine Dining & Baraza Lounge";
  const description = isKinyarwanda
    ? "Sogongera ku mafunguro meza n'ibinyobwa bidasanzwe muri Baraza Lounge & Bar muri Hollywood Hotel i Rwimiyaga. Resitora nziza n'ibyicaro by'agaciro."
    : "Indulge in culinary excellence at Hollywood Hotel restaurant and unwind at Baraza Lounge & Bar. Exquisite dishes, signature cocktails, and unmatched ambiance in Rwimiyaga.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/dining`,
    },
    openGraph: {
      title: `${title} | Hollywood Hotel`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/dining`,
      images: [
        {
          url: "/baraza.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Dining and Baraza Lounge",
        },
      ],
    },
  };
}

export default function DiningLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
