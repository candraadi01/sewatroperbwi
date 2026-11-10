import Link from "next/link";
import Image from "next/image";
import { getContent } from "@/lib/services/content";
import { Calendar, Tag, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Artikel & Panduan Wisata Banyuwangi | Sewa Trooper BWI",
  description:
    "Baca tips perjalanan, rekomendasi destinasi, dan panduan lengkap menjelajahi Banyuwangi dengan Jeep Trooper 4x4.",
};

const fallbackImages = [
  "/images/landing/article-menjangan.jpg",
  "/images/landing/article-alaspurwo.jpg",
  "/images/landing/article-jagir.jpg",
];

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ kategori?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params?.kategori ? decodeURIComponent(params.kategori) : "";

  const allArticles = await getContent("articles");

  // Extract unique categories from database articles
  const categories = Array.from(
    new Set(allArticles.map((a) => a.category_name).filter(Boolean))
  ) as string[];

  // Filter articles based on selected category
  const filteredArticles = selectedCategory
    ? allArticles.filter((a) => a.category_name === selectedCategory)
    : allArticles;

  return (
    <div className="bg-[#f8fafc] min-h-screen py-12 md:py-18 font-sans">
      <div className="container-app max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <span className="inline-block px-3 py-1 bg-[#e9f3f7] text-[#327691] rounded-full text-xs font-bold uppercase tracking-wider mb-2.5">
            Wawasan &amp; Cerita Perjalanan
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#263b46] tracking-tight">
            Artikel Wisata Banyuwangi
          </h1>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-[#53636d] leading-relaxed">
            Tips, rute tersembunyi, dan pengalaman seru menjelajahi keindahan alam Banyuwangi dengan Jeep Trooper 4x4.
          </p>
        </div>

        {/* Category Filter Pills (Sesuai Database) */}
        {categories.length > 0 && (
          <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
            <Link
              href="/artikel"
              className={`px-4 py-2 rounded-full text-xs font-bold transition shadow-2xs border ${
                !selectedCategory
                  ? "bg-[#327691] text-white border-[#327691] shadow-xs"
                  : "bg-white text-[#53636d] border-[#e4ebef] hover:border-[#327691] hover:text-[#327691]"
              }`}
            >
              Semua Kategori ({allArticles.length})
            </Link>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = allArticles.filter((a) => a.category_name === cat).length;
              return (
                <Link
                  key={cat}
                  href={`/artikel?kategori=${encodeURIComponent(cat)}`}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition shadow-2xs border ${
                    isSelected
                      ? "bg-[#327691] text-white border-[#327691] shadow-xs"
                      : "bg-white text-[#53636d] border-[#e4ebef] hover:border-[#327691] hover:text-[#327691]"
                  }`}
                >
                  {cat} ({count})
                </Link>
              );
            })}
          </div>
        )}

        {/* Selected Category Bar */}
        {selectedCategory && (
          <div className="mb-6 flex items-center justify-between text-xs text-[#53636d] bg-white p-3.5 rounded-2xl border border-[#e4ebef]">
            <span>
              Menampilkan artikel dengan kategori: <strong className="text-[#327691]">{selectedCategory}</strong>
            </span>
            <Link href="/artikel" className="font-bold text-[#327691] hover:underline">
              ✕ Tampilkan Semua
            </Link>
          </div>
        )}

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {filteredArticles.map((a, idx) => {
              const image = a.cover_image_url || fallbackImages[idx % fallbackImages.length];
              const dateStr = a.published_at
                ? new Date(a.published_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Terbaru";

              return (
                <article
                  key={a.id}
                  className="bg-white rounded-3xl border border-[#e4ebef] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  {/* Thumbnail Cover Image */}
                  <Link href={`/artikel/${a.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-[#e9f3f7]">
                    <Image
                      src={image}
                      alt={a.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {a.category_name && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#327691]/90 backdrop-blur-xs text-white text-[11px] font-bold shadow-xs">
                        {a.category_name}
                      </span>
                    )}
                  </Link>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs text-[#8e9da5]">
                        <Calendar size={13} className="text-[#327691]" />
                        <span>{dateStr}</span>
                      </div>

                      <h2 className="text-base sm:text-lg font-extrabold text-[#263b46] leading-snug group-hover:text-[#327691] transition">
                        <Link href={`/artikel/${a.slug}`}>
                          {a.title}
                        </Link>
                      </h2>

                      {a.excerpt && (
                        <p className="text-xs sm:text-sm text-[#53636d] line-clamp-3 leading-relaxed">
                          {a.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#f0f4f6]">
                      <Link
                        href={`/artikel/${a.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#327691] hover:text-[#2c6881] group-hover:translate-x-1 transition"
                      >
                        <span>Baca Selengkapnya</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#e4ebef] max-w-lg mx-auto">
            <Tag size={40} className="mx-auto text-neutral-300 mb-3" />
            <h2 className="text-lg font-bold text-[#263b46]">
              Belum ada artikel dalam kategori ini.
            </h2>
            <p className="mt-2 text-xs text-[#53636d]">
              Silakan pilih kategori lain atau lihat seluruh arsip artikel kami.
            </p>
            <Link
              href="/artikel"
              className="mt-5 inline-block px-5 py-2.5 bg-[#327691] text-white text-xs font-bold rounded-xl hover:bg-[#2c6881] transition shadow-xs"
            >
              Lihat Semua Artikel
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
