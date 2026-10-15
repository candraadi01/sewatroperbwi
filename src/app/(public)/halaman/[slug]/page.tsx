import { notFound } from "next/navigation";
import { getContent } from "@/lib/services/content";
import { ContentPage } from "@/components/ContentPage";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [page] = await getContent("pages", slug);
  if (!page) notFound();
  return <ContentPage slug={slug} title={page.title} fallback="" />;
}
