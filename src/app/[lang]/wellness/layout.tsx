import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda ? "Spa & Ikigo cy'Ubuzima Bwiza" : "Spa & Wellness Centre";
  const description = isKinyarwanda
    ? "Ruhuka muri Spa na Sauna ya Hollywood Hotel i Rwimiyaga. Masaji ivura umunaniro, sauna nziza, n'ahantu hatuje ho kuruhukira."
    : "Rejuvenate mind and body at Hollywood Hotel Spa & Wellness Centre in Rwimiyaga. Therapeutic massages, traditional sauna, steam rooms, and calming relaxation.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/wellness`,
    },
    openGraph: {
      title: `${title} | Hollywood Hotel`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/wellness`,
      images: [
        {
          url: "/massage.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Spa & Wellness Centre",
        },
      ],
    },
  };
}

export default function WellnessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
