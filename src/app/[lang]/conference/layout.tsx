import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda
    ? "Inama, Ubukwe n'Ibirori mu Ntara y'Iburasirazuba & Nyagatare"
    : "Conferences, Weddings & Events in Eastern Province & Nyagatare";
  const description = isKinyarwanda
    ? "Tegura inama zikomeye, ubukwe bw'akataraboneka mu ihema rinini (Tent) ryo mu busitani n'ibirori bitandukanye muri salle nshya za Hollywood Hotel i Rwimiyaga, Nyagatare mu Ntara y'Iburasirazuba."
    : "Host conferences, government summits, corporate workshops, and dream weddings under our 500+ guest marquee tent at Hollywood Hotel in Rwimiyaga, Nyagatare District, Eastern Province, Rwanda.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/conference`,
      languages: {
        en: "/en/conference",
        rw: "/rw/conference",
        "x-default": "/en/conference",
      },
    },
    openGraph: {
      title: `${title} | Hollywood Hotel — Eastern Province, Rwanda`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/conference`,
      images: [
        {
          url: "/weed.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Grand Wedding & Party Marquee Tent in Eastern Province, Rwanda",
        },
        {
          url: "/salle.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Modern Conference & Event Hall in Nyagatare, Eastern Province",
        },
      ],
    },
  };
}

export default function ConferenceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
