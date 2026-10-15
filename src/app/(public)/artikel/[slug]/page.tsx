import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/services/content";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [a] = await getContent("articles", slug);
  if (!a) notFound();
  return (
    <article className="container-app py-12 max-w-3xl">
      <Link href="/artikel" className="text-sm text-neutral-500">
        ← Semua artikel
      </Link>
      <h1 className="section-heading mt-6">{a.title}</h1>
      {a.excerpt && (
        <p className="mt-5 text-lg text-neutral-600">{a.excerpt}</p>
      )}
      <div className="mt-8 space-y-5 leading-relaxed">
        {a.content?.map((b, i) => (
          <p key={i} className="whitespace-pre-line">
            {b.text || b.content || ""}
          </p>
        ))}
      </div>
    </article>
  );
}
