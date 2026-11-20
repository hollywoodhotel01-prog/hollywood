import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda
    ? "Spa & Sauna mu Ntara y'Iburasirazuba & Nyagatare"
    : "Spa & Wellness Centre in Eastern Province & Nyagatare";
  const description = isKinyarwanda
    ? "Ruhuka muri Spa na Sauna ya Hollywood Hotel i Rwimiyaga, Nyagatare mu Ntara y'Iburasirazuba. Masaji ivura umunaniro, sauna nziza, n'ahantu hatuje ho kuruhukira."
    : "Rejuvenate mind and body at Hollywood Hotel Spa & Wellness Centre in Rwimiyaga, Nyagatare District, Eastern Province, Rwanda. Therapeutic massages, traditional sauna, and steam rooms.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/wellness`,
      languages: {
        en: "/en/wellness",
        rw: "/rw/wellness",
        "x-default": "/en/wellness",
      },
    },
    openGraph: {
      title: `${title} | Hollywood Hotel — Eastern Province, Rwanda`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/wellness`,
      images: [
        {
          url: "/massage.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Spa & Wellness Centre in Eastern Province, Rwanda",
        },
      ],
    },
  };
}

export default function WellnessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
