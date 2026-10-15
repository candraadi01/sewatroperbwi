import Link from "next/link";
import { getContent } from "@/lib/services/content";
export default async function Page() {
  const rows = await getContent("articles");
  return (
    <div className="container-app py-12 md:py-16">
      <p className="eyebrow">Catatan perjalanan</p>
      <h1 className="section-heading mt-3">Kenali Banyuwangi lebih dekat.</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {rows.map((a) => (
          <Link
            className="admin-panel block hover:border-primary-600"
            href={"/artikel/" + a.slug}
            key={a.id}
          >
            <p className="text-xs text-neutral-500">
              {a.published_at
                ? new Date(a.published_at).toLocaleDateString("id-ID", {
                    timeZone: "Asia/Jakarta",
                  })
                : ""}
            </p>
            <h2 className="text-xl font-semibold mt-3">{a.title}</h2>
            <p className="text-sm text-neutral-600 mt-4">{a.excerpt}</p>
            <span className="inline-block text-sm text-primary-700 mt-6">
              Baca cerita →
            </span>
          </Link>
        ))}
      </div>
      {!rows.length && (
        <p className="mt-7 text-neutral-600">
          Artikel perjalanan akan hadir di sini.
        </p>
      )}
    </div>
  );
}
