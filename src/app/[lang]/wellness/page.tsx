import { redirect } from "next/navigation";

export default async function WellnessPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/facilities`);
}
