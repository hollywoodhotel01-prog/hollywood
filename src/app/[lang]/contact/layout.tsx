import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda
    ? "Twandikire & Aho Duherereye mu Ntara y'Iburasirazuba & Nyagatare"
    : "Location, Directions & Contact in Eastern Province & Nyagatare";
  const description = isKinyarwanda
    ? "Twandikire cyangwa udusure kuri Hollywood Hotel ku Muhanda wa Kagitumba, Rwimiyaga, Nyagatare mu Ntara y'Iburasirazuba, u Rwanda. Telefone / WhatsApp: +250 788 876 479, Imeyili: hollywoodhotel01@gmail.com."
    : "Contact and find Hollywood Hotel on Kagitumba Road, Rwimiyaga, Nyagatare District, Eastern Province, Rwanda. Phone & WhatsApp +250 788 876 479, 24/7 reception, live Google Maps directions & regional routes.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/contact`,
      languages: {
        en: "/en/contact",
        rw: "/rw/contact",
        "x-default": "/en/contact",
      },
    },
    openGraph: {
      title: `${title} | Hollywood Hotel — Eastern Province, Rwanda`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/contact`,
      images: [
        {
          url: "/front.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Reception & Location in Eastern Province, Rwanda",
        },
      ],
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
