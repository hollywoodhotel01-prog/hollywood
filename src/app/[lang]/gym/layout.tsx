import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isKinyarwanda = lang === "rw";

  const title = isKinyarwanda ? "Gym & Imyitozo Ngororamubiri" : "Modern Fitness Gym";
  const description = isKinyarwanda
    ? "Komeza gukora imyitozo ngororamubiri muri gym igezweho ya Hollywood Hotel i Rwimiyaga. Imashini z'umwimerere n'ahantu hagutse ho gukorera siporo."
    : "Maintain your workout routine at Hollywood Hotel's fitness centre in Rwimiyaga. Complete cardio equipment, strength training machines, and free weights.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/gym`,
    },
    openGraph: {
      title: `${title} | Hollywood Hotel`,
      description,
      url: `https://hollywoodhotel.rw/${lang}/gym`,
      images: [
        {
          url: "/gym.webp",
          width: 1200,
          height: 800,
          alt: "Hollywood Hotel - Fitness Centre & Gym",
        },
      ],
    },
  };
}

export default function GymLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
