import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/services/content";
import { Calendar, ArrowLeft, Tag, Share2, Compass } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [a] = await getContent("articles", slug);
  if (!a) return { title: "Artikel Tidak Ditemukan" };
  return {
    title: `${a.title} | Sewa Trooper BWI`,
    description: a.excerpt || "Baca artikel wisata dan panduan Jeep Trooper Banyuwangi.",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [a] = await getContent("articles", slug);
  if (!a) notFound();

  const allArticles = await getContent("articles");
  const relatedArticles = allArticles.filter((item) => item.slug !== slug).slice(0, 3);

  const dateStr = a.published_at
    ? new Date(a.published_at).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Terbaru";

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 md:py-16 font-sans">
      <div className="container-app max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#327691] hover:underline"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Semua Artikel</span>
          </Link>
        </div>

        {/* Article Container */}
        <article className="bg-white rounded-3xl border border-[#e4ebef] p-6 sm:p-10 shadow-xs space-y-6">
          {/* Header & Meta */}
          <div className="space-y-3 pb-6 border-b border-[#f0f4f6]">
            {a.category_name && (
              <Link
                href={`/artikel?kategori=${encodeURIComponent(a.category_name)}`}
                className="inline-block px-3 py-1 rounded-full bg-[#e9f3f7] text-[#327691] text-xs font-bold hover:bg-[#d5e9f1] transition"
              >
                {a.category_name}
              </Link>
            )}

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#263b46] tracking-tight leading-tight">
              {a.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-[#8e9da5] pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#327691]" />
                <span>{dateStr}</span>
              </span>
            </div>
          </div>

          {/* Cover Image */}
          {a.cover_image_url && (
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-xs border border-[#e4ebef]">
              <Image
                src={a.cover_image_url}
                alt={a.title}
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          )}

          {/* Excerpt Lead */}
          {a.excerpt && (
            <p className="text-base sm:text-lg font-medium text-[#43545f] leading-relaxed italic bg-[#f8fafc] p-4 sm:p-5 rounded-2xl border-l-4 border-l-[#327691]">
              &ldquo;{a.excerpt}&rdquo;
            </p>
          )}

          {/* Content Body */}
          <div className="pt-2 text-sm sm:text-base text-[#334155] leading-relaxed space-y-5">
            {a.content && a.content.length > 0 ? (
              a.content.map((b, i) => {
                const text = b.text || b.content || "";
                if (!text) return null;

                if (b.type === "heading" || b.type === "h1" || b.type === "h2") {
                  return (
                    <h2 key={i} className="text-xl sm:text-2xl font-black text-[#263b46] pt-4 pb-1">
                      {text}
                    </h2>
                  );
                }
                if (b.type === "h3" || b.type === "subheading") {
                  return (
                    <h3 key={i} className="text-lg sm:text-xl font-bold text-[#263b46] pt-3 pb-1">
                      {text}
                    </h3>
                  );
                }
                if (b.type === "blockquote") {
                  return (
                    <blockquote key={i} className="border-l-4 border-[#327691] pl-4 italic text-[#475569] my-4">
                      {text}
                    </blockquote>
                  );
                }
                return (
                  <p key={i} className="whitespace-pre-line">
                    {text}
                  </p>
                );
              })
            ) : (
              <p className="text-neutral-500 italic">Konten artikel sedang disiapkan.</p>
            )}
          </div>

          {/* Call to Action: Booking Tour */}
          <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-[#f4f9fb] border border-[#d2e4ec] flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <span className="text-xs font-bold text-[#327691] uppercase tracking-wider">
                Rencanakan Petualangan Anda
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#263b46] mt-0.5">
                Ingin Mengunjungi Destinasi Ini dengan Jeep Trooper?
              </h3>
              <p className="text-xs text-[#53636d] mt-1 max-w-lg">
                Pilih paket tour lengkap atau sewa harian dengan driver lokal berpengalaman rute Banyuwangi.
              </p>
            </div>
            <Link
              href="/sewa"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
            >
              <Compass size={16} />
              <span>Lihat Paket Tour</span>
            </Link>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 space-y-5">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#263b46]">
              Artikel Lainnya dari Kami
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/artikel/${rel.slug}`}
                  className="bg-white rounded-2xl border border-[#e4ebef] p-4 hover:border-[#327691] hover:shadow-xs transition group block"
                >
                  <span className="text-[10px] font-bold text-[#327691] uppercase block truncate mb-1">
                    {rel.category_name || "Wisata"}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#263b46] group-hover:text-[#327691] line-clamp-2 transition">
                    {rel.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
