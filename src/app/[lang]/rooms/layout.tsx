import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda ? "Ibyumba Byiza by'Ubwiza" : "Luxury Rooms & Suites";
  const description = isKinyarwanda
    ? "Reba ibyumba byiza byo kuraramo muri Hollywood Hotel i Rwimiyaga. Ibyumba byagutse bifite ibikoresho bigezweho, interineti yihuta na serivisi y'icyitegererezo."
    : "Discover luxurious rooms and executive suites at Hollywood Hotel, Rwimiyaga. Featuring premium bedding, climate control, smart bathrooms, high-speed Wi-Fi, and 24/7 service.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/rooms`,
    },
    openGraph: {
      title: `${title} | Hollywood Hotel`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/rooms`,
      images: [
        {
          url: "/bed.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Luxury Guest Rooms & Suites",
        },
      ],
    },
  };
}

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
