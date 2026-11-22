"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import type { TestimonialItem } from "@/lib/services/testimonials";
import styles from "./cinematic.module.css";

export function ReviewCards({ items }: { items: TestimonialItem[] }) {
  if (!items.length) return <p className={styles.emptyContent}>Belum ada ulasan yang dipublikasikan.</p>;

  return (
    <div className={styles.reviewGrid}>
      {items.map((review) => {
        const stars = Math.min(5, Math.max(0, review.stars));
        return (
          <article key={review.id} className={styles.reviewCard} onPointerDown={(event) => {
            if (event.pointerType !== "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            event.currentTarget.animate(
              [{ scale: 1 }, { scale: 1.025, offset: 0.45 }, { scale: 1 }],
              { duration: 360, easing: "ease-out" },
            );
          }}>
            <header>
              <span className={styles.reviewAvatar} aria-hidden="true">{review.name.trim().slice(0, 1).toUpperCase()}</span>
              <div><h3>{review.name}</h3><p>{review.city}</p></div>
            </header>
            <div className={styles.reviewStars} aria-label={`${stars} dari 5 bintang`}>
              {Array.from({ length: stars }, (_, index) => <Star key={index} size={14} fill="currentColor" aria-hidden="true" />)}
            </div>
            <blockquote>{review.content}</blockquote>
          </article>
        );
      })}
    </div>
  );
}

export function Testimonials({ items }: { items: TestimonialItem[] }) {
  const { language, t } = useLanguage();
  return (
    <section id="testimonial" className={`${styles.container} ${styles.section}`}>
      <div className={styles.sectionHeader}>
        <div><h2>{language === "id" ? "Ulasan pelanggan" : t("testimonials_title")}</h2><p>{language === "id" ? "Pengalaman wisatawan saat menjelajahi Banyuwangi bersama kami." : t("testimonials_subtitle")}</p></div>
        <Link className={styles.secondary} href="/testimonial">{language === "id" ? "Lihat semua ulasan" : t("nav_testimonial")} <ArrowRight size={16} /></Link>
      </div>
      <ReviewCards items={items.slice(0, 3)} />
    </section>
  );
}
