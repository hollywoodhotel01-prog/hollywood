import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda ? "Twandikire & Aho Duherereye" : "Contact & Location";
  const description = isKinyarwanda
    ? "Twandikire cyangwa udusure kuri Hollywood Hotel iherereye i Rwimiyaga, Nyagatare mu Ntara y'Iburasirazuba. Telefone / WhatsApp: +250 788 876 479, Imeyili: hollywoodhotel01@gmail.com."
    : "Contact Hollywood Hotel in Rwimiyaga, Eastern Province, Rwanda. Phone & WhatsApp +250 788 876 479, email hollywoodhotel01@gmail.com, 24/7 reception desk, and directions.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/contact`,
    },
    openGraph: {
      title: `${title} | Hollywood Hotel`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/contact`,
      images: [
        {
          url: "/front.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Reception & Location",
        },
      ],
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
