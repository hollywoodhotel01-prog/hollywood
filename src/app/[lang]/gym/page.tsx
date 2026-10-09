import { redirect } from "next/navigation";

export default async function GymPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/facilities`);
}
