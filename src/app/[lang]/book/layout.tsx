import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda ? "Gufata Icyumba (Booking)" : "Book Your Stay | Online Reservations";
  const description = isKinyarwanda
    ? "Saba cyangwa fatira icyumba muri Hollywood Hotel i Rwimiyaga. Guhitamo koroheje, ibiciro byiza, no kwakira ubutumwa bw'ibyemezo ako kanya."
    : "Reserve your luxury room or suite at Hollywood Hotel Rwimiyaga. Guaranteed best rates, seamless online booking, and exceptional hospitality.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/book`,
    },
    openGraph: {
      title: `${title} | Hollywood Hotel`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/book`,
      images: [
        {
          url: "/bed.webp",
          width: 1200,
          height: 800,
          alt: "Book a Room at Hollywood Hotel",
        },
      ],
    },
  };
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
