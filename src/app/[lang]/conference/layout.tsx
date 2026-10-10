import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda ? "Ibyumba by'Inama n'Ibirori" : "Conference & Event Halls";
  const description = isKinyarwanda
    ? "Tegura inama zikomeye, ubukwe n'ibirori muri salle zigezweho za Hollywood Hotel i Rwimiyaga. Ibyuma bifata amajwi n'amashusho bigezweho hamwe n'abategura amafunguro b'inzobere."
    : "Host successful conferences, executive board meetings, banquets, and weddings at Hollywood Hotel, Rwimiyaga. Modern audiovisual systems, high-speed Wi-Fi, and expert catering.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/conference`,
    },
    openGraph: {
      title: `${title} | Hollywood Hotel`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/conference`,
      images: [
        {
          url: "/salle.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Conference and Event Halls",
        },
      ],
    },
  };
}

export default function ConferenceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
