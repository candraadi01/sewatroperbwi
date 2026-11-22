import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReviewCards } from "@/components/landing/Testimonials";
import { getTestimonials } from "@/lib/services/testimonials";
import styles from "@/components/landing/cinematic.module.css";

export const metadata = { title: "Semua Ulasan Pelanggan | Sewa Trooper Banyuwangi" };

export default async function TestimonialPage() {
  const reviews = await getTestimonials();
  return (
    <div className={`${styles.landing} ${styles.publicPageBackdrop} min-h-screen py-7 md:py-12`}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div><h1 className={styles.pageHeading}>Semua ulasan pelanggan</h1><p>Pengalaman perjalanan yang sudah dipublikasikan.</p></div>
          <Link href="/#testimonial" className={styles.secondary}><ArrowLeft size={16} /> Beranda</Link>
        </div>
        <ReviewCards items={reviews} />
      </div>
    </div>
  );
}
