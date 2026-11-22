import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ContentRow } from "@/lib/services/content";
import styles from "./cinematic.module.css";

export function ArticleCards({ articles }: { articles: ContentRow[] }) {
  if (!articles.length) return <p className={styles.emptyContent}>Belum ada artikel yang dipublikasikan.</p>;
  return (
    <div className={styles.contentGrid}>
      {articles.map((article) => {
        const image = article.cover_image_url || "/images/landing/article-menjangan.jpg";
        return (
          <article key={article.id} className={styles.compactCard}>
            <Link href={`/artikel/${article.slug}`} aria-label={article.title} className={styles.compactPhoto}>
              <Image src={image} alt="" fill sizes="(max-width: 600px) 34vw, 33vw" className="object-cover"
                unoptimized={image.startsWith("https://") && !image.startsWith("https://res.cloudinary.com/")} />
            </Link>
            <div className={styles.compactBody}>
              {article.category_name && <p className={styles.categoryLabel}>{article.category_name}</p>}
              <h3><Link href={`/artikel/${article.slug}`}>{article.title}</Link></h3>
              {article.excerpt && <p className={styles.compactDescription}>{article.excerpt}</p>}
              <Link href={`/artikel/${article.slug}`} className={styles.textAction}>Baca artikel <ArrowRight size={14} /></Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function ArticleSection({ articles }: { articles: ContentRow[] }) {
  return (
    <section className={`${styles.container} ${styles.section}`}>
      <div className={styles.sectionHeader}>
        <div><h2>Artikel wisata</h2><p>Panduan singkat sebelum berangkat.</p></div>
        <Link href="/artikel" className={styles.secondary}>Semua artikel <ArrowRight size={16} /></Link>
      </div>
      <ArticleCards articles={articles.slice(0, 3)} />
    </section>
  );
}
