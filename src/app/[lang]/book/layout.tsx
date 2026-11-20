import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda
    ? "Gufata Icyumba i Nyagatare & Intara y'Iburasirazuba"
    : "Book Your Stay | Hotels in Eastern Province & Nyagatare";
  const description = isKinyarwanda
    ? "Fata icyumba online muri Hollywood Hotel i Rwimiyaga, Nyagatare mu Ntara y'Iburasirazuba, u Rwanda. Ibiciro byiza, kwemeza ako kanya n'ubwuzu bwa Kinyarwanda."
    : "Reserve your luxury room or VIP suite at Hollywood Hotel in Rwimiyaga, Nyagatare District, Eastern Province, Rwanda. Best direct rates among hotels in Eastern Province with instant confirmation.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/book`,
      languages: {
        en: "/en/book",
        rw: "/rw/book",
        "x-default": "/en/book",
      },
    },
    openGraph: {
      title: `${title} | Hollywood Hotel — Eastern Province, Rwanda`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/book`,
      images: [
        {
          url: "/bed.webp",
          width: 1200,
          height: 800,
          alt: "Book a Room at Hollywood Hotel in Eastern Province, Rwanda",
        },
      ],
    },
  };
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
