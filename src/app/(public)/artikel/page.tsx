import Link from "next/link";
import { getContent } from "@/lib/services/content";
import { ArticleCards } from "@/components/landing/ArticleSection";
import styles from "@/components/landing/cinematic.module.css";

export const metadata = {
  title: "Artikel & Panduan Wisata Banyuwangi | Sewa Trooper BWI",
  description: "Tips perjalanan dan panduan menjelajahi Banyuwangi dengan Jeep Trooper 4x4.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const selectedCategory = typeof kategori === "string" ? kategori : "";
  const articles = await getContent("articles");
  const categories = [...new Set(articles.flatMap((article) => article.category_name ? [article.category_name] : []))];
  const filtered = selectedCategory ? articles.filter((article) => article.category_name === selectedCategory) : articles;

  return (
    <div className={`${styles.landing} ${styles.publicPageBackdrop} min-h-screen py-7 md:py-12`}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div><h1 className={styles.pageHeading}>Artikel Wisata Banyuwangi</h1><p>Tips perjalanan dan panduan memilih destinasi.</p></div>
        </div>
        {categories.length > 0 && <nav className={styles.categoryFilters} aria-label="Kategori artikel">
          <Link href="/artikel" aria-current={!selectedCategory ? "page" : undefined}>Semua</Link>
          {categories.map((category) => (
            <Link key={category} href={`/artikel?kategori=${encodeURIComponent(category)}`} aria-current={selectedCategory === category ? "page" : undefined}>{category}</Link>
          ))}
        </nav>}
        <ArticleCards articles={filtered} />
      </div>
    </div>
  );
}
