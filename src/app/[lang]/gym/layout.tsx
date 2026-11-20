import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda
    ? "Gym & Siporo mu Ntara y'Iburasirazuba & Nyagatare"
    : "Modern Fitness Gym in Eastern Province & Nyagatare";
  const description = isKinyarwanda
    ? "Komeza gukora imyitozo ngororamubiri muri gym igezweho ya Hollywood Hotel i Rwimiyaga, Nyagatare mu Ntara y'Iburasirazuba. Imashini z'umwimerere n'ahantu hagutse ho gukorera siporo."
    : "Maintain your workout routine at Hollywood Hotel's fitness centre in Rwimiyaga, Nyagatare District, Eastern Province, Rwanda. Complete cardio equipment, strength machines, and free weights.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/gym`,
      languages: {
        en: "/en/gym",
        rw: "/rw/gym",
        "x-default": "/en/gym",
      },
    },
    openGraph: {
      title: `${title} | Hollywood Hotel — Eastern Province, Rwanda`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/gym`,
      images: [
        {
          url: "/gym.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Fitness Centre & Gym in Eastern Province, Rwanda",
        },
      ],
    },
  };
}

export default function GymLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
