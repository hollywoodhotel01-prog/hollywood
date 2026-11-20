import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda
    ? "Ibikorwaremezo mu Ntara y'Iburasirazuba & Nyagatare"
    : "Hotel Facilities & Amenities in Eastern Province & Nyagatare";
  const description = isKinyarwanda
    ? "Sura ibikorwaremezo byo ku rwego rw'isi bya Hollywood Hotel i Rwimiyaga, Nyagatare mu Ntara y'Iburasirazuba: pisine, spa na sauna, gym igezweho, Hollywood Bar n'ubusitani bwiza."
    : "Explore world-class facilities at Hollywood Hotel in Rwimiyaga, Nyagatare District, Eastern Province, Rwanda: swimming pool, spa & sauna, modern gym, Hollywood Bar, lush gardens, and secure parking.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/facilities`,
      languages: {
        en: "/en/facilities",
        rw: "/rw/facilities",
        "x-default": "/en/facilities",
      },
    },
    openGraph: {
      title: `${title} | Hollywood Hotel — Eastern Province, Rwanda`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/facilities`,
      images: [
        {
          url: "/garden.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Facilities and Grounds in Eastern Province, Rwanda",
        },
      ],
    },
  };
}

export default function FacilitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
