import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda
    ? "Ibyumba Byiza mu Ntara y'Iburasirazuba & Nyagatare"
    : "Luxury Rooms & Suites in Eastern Province & Nyagatare";
  const description = isKinyarwanda
    ? "Reba ibyumba byiza byo kuraramo muri Hollywood Hotel i Rwimiyaga, Nyagatare mu Ntara y'Iburasirazuba (hotels in Eastern Province, Rwanda). Ibyumba byagutse bifite Wi-Fi yihuta, balcony na serivisi y'icyitegererezo."
    : "Discover luxury rooms and VIP executive suites at Hollywood Hotel in Rwimiyaga, Nyagatare District, Eastern Province, Rwanda — top choice among hotels in Eastern Province with high-speed Wi-Fi, sky views, and 24/7 service.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/rooms`,
      languages: {
        en: "/en/rooms",
        rw: "/rw/rooms",
        "x-default": "/en/rooms",
      },
    },
    openGraph: {
      title: `${title} | Hollywood Hotel — Eastern Province, Rwanda`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/rooms`,
      images: [
        {
          url: "/bed.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Luxury Guest Rooms & Suites in Eastern Province, Rwanda",
        },
      ],
    },
  };
}

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
