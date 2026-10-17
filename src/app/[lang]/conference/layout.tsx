import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda
    ? "Inama, Ubukwe n'Ibirori | Hollywood Hotel"
    : "Conferences, Weddings & Events | Hollywood Hotel";
  const description = isKinyarwanda
    ? "Tegura inama zikomeye, ubukwe bw'akataraboneka mu ihema rinini (Tent) ryo mu busitani n'ibirori bitandukanye muri salle nshya za Hollywood Hotel i Rwimiyaga."
    : "Host conferences, corporate meetings, dream weddings under our grand garden marquee tent, and celebration parties at Hollywood Hotel, Rwimiyaga. Modern audiovisual systems, luxury tent setup, and expert catering.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/conference`,
    },
    openGraph: {
      title,
      description,
      url: `https://hollywoodhotel.rw/${lang}/conference`,
      images: [
        {
          url: "/weed.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Grand Wedding & Party Marquee Tent",
        },
        {
          url: "/salle.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Modern Conference & Event Hall",
        },
      ],
    },
  };
}

export default function ConferenceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
