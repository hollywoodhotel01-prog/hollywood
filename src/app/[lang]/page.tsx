import { getDictionary, Locale } from "@/dictionaries";
import HomePageClient from "@/components/HomePageClient";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return <HomePageClient lang={lang} dict={dict.home} />;
}
