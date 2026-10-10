import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda ? "Ibikorwaremezo n'Ibyiza Byacu" : "Hotel Facilities & Amenities";
  const description = isKinyarwanda
    ? "Sura ibikorwaremezo byo ku rwego rw'isi bya Hollywood Hotel: pisine, spa na sauna, gym igezweho, Baraza Lounge, ubusitani bwiza n'aho guhagarika imodoka hatekanye."
    : "Explore world-class facilities at Hollywood Hotel in Rwimiyaga: swimming pool, full spa & sauna, modern gym, Baraza Lounge, lush gardens, and complimentary secure parking.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/facilities`,
    },
    openGraph: {
      title: `${title} | Hollywood Hotel`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/facilities`,
      images: [
        {
          url: "/garden.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Facilities and Grounds",
        },
      ],
    },
  };
}

export default function FacilitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
