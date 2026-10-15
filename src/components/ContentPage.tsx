import { getContent } from "@/lib/services/content";
export async function ContentPage({
  slug,
  title,
  fallback,
  useCms=true,
}: {
  slug: string;
  title: string;
  fallback: string;
  useCms?: boolean;
}) {
  const [page] = useCms?await getContent("pages", slug):[];
  return (
    <article className="container-app py-12 md:py-16 max-w-3xl">
      <p className="eyebrow">Informasi layanan</p>
      <h1 className="section-heading mt-3">{page?.title || title}</h1>
      <div className="mt-7 space-y-5 leading-relaxed text-neutral-600">
        {page?.content?.length ? (
          page.content.map((b, i) => (
            <p key={i} className="whitespace-pre-line">
              {b.text || b.content || ""}
            </p>
          ))
        ) : (
          <p className="whitespace-pre-line">{fallback}</p>
        )}
      </div>
    </article>
  );
}
