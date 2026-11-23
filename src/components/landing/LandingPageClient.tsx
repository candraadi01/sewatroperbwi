"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Headphones, Map, ShieldCheck, Users } from "lucide-react";
import { CinematicHero } from "@/components/landing/CinematicHero";
import { Testimonials } from "@/components/landing/Testimonials";
import { ArticleSection } from "@/components/landing/ArticleSection";
import { BookingSteps } from "@/components/landing/BookingSteps";
import { TripGallery } from "@/components/landing/TripGallery";
import { ProductCard } from "@/components/ProductCard";
import { useLanguage } from "@/lib/i18n/context";
import styles from "@/components/landing/cinematic.module.css";
import type { Product } from "@/types/database";
import type { DestinationItem } from "@/lib/services/destinations";
import type { TestimonialItem } from "@/lib/services/testimonials";
import type { ContentRow } from "@/lib/services/content";
import type { GalleryPhoto } from "@/lib/gallery";
import type { FleetSlide } from "@/components/landing/FleetShowcase";

export interface LandingSection {
  id: string;
  section_type: string;
  title: string;
  subtitle: string;
  content: Record<string, unknown>;
}

export function LandingPageClient({
  destinations,
  packages,
  reviews,
  articles,
  sections,
  heroConfig,
  configuredBenefits,
  configuredSteps,
  photos,
  routeIntro,
  featuredTitle,
  featuredSubtitle,
  bookingTitle,
  bookingSubtitle,
}: {
  destinations: DestinationItem[];
  packages: Product[];
  reviews: TestimonialItem[];
  articles: ContentRow[];
  sections: LandingSection[];
  heroConfig: {
    title: string;
    accent: string;
    description: string;
    eyebrow: string;
    backdrop: string;
    fleet: FleetSlide[];
  };
  configuredBenefits: { title: string; copy: string }[];
  configuredSteps: readonly (readonly [string, string])[];
  photos: GalleryPhoto[];
  routeIntro?: { title?: string; subtitle?: string };
  featuredTitle?: string;
  featuredSubtitle?: string;
  bookingTitle?: string;
  bookingSubtitle?: string;
}) {
  const { language, t } = useLanguage();

  const defaultBenefits = [
    { Icon: ShieldCheck, title: t("benefit_1_title", "Armada terawat"), copy: t("benefit_1_copy", "Siap menempuh rute wisata") },
    { Icon: Users, title: t("benefit_2_title", "Driver lokal"), copy: t("benefit_2_copy", "Mengenal medan Banyuwangi") },
    { Icon: Map, title: t("benefit_3_title", "Pilihan destinasi"), copy: t("benefit_3_copy", "Kawah, savana, hutan, dan pantai") },
    { Icon: Headphones, title: t("benefit_4_title", "Bantuan pemesanan"), copy: t("benefit_4_copy", "Koordinasi langsung dengan Admin") },
  ];

  const benefitsToShow = configuredBenefits.length > 0 && language === "id"
    ? configuredBenefits.map((b, i) => ({
        Icon: defaultBenefits[i]?.Icon || ShieldCheck,
        title: b.title,
        copy: b.copy,
      }))
    : defaultBenefits;

  const fleetHeading = language === "id" && featuredTitle && featuredTitle !== "Paket Wisata Populer"
    ? featuredTitle
    : t("section_fleet_title", "Paket Wisata Jeep Trooper");

  const fleetDesc = language === "id" && featuredSubtitle && featuredSubtitle !== "Destinasi favorit wisatawan dengan rute terencana dan sopir berpengalaman."
    ? featuredSubtitle
    : t("section_fleet_desc", "Jelajahi kawah, savana, dan pantai Banyuwangi dengan Jeep Trooper 4×4. Pilih paket sesuai rute dan durasi perjalanan Anda.");

  const routesHeading = language === "id" && routeIntro?.title
    ? routeIntro.title
    : t("section_dest_title", "Destinasi populer");

  const routesDesc = language === "id" && routeIntro?.subtitle
    ? routeIntro.subtitle
    : t("section_dest_desc", "Mulai dari tempat yang ingin Anda jelajahi.");

  return (
    <div className={`min-h-screen ${styles.landing}`}>
      <CinematicHero
        destinations={destinations}
        heading={heroConfig.title}
        accent={heroConfig.accent}
        description={heroConfig.description}
        eyebrow={heroConfig.eyebrow}
        backdrop={heroConfig.backdrop}
        fleet={heroConfig.fleet}
      />

      <div className={`${styles.container} ${styles.assurance}`}>
        {benefitsToShow.map(({ title, copy, Icon }, index) => (
          <div key={`${index}-${title}`}>
            <span className={styles.assuranceIcon}>
              <Icon size={21} aria-hidden="true" />
            </span>
            <div>
              <strong>{title}</strong>
              <span className={styles.assuranceCopy}>{copy}</span>
            </div>
          </div>
        ))}
      </div>

      <section className={`${styles.container} ${styles.section}`} id="armada" aria-labelledby="fleet-heading">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="fleet-heading">{fleetHeading}</h2>
            <p>{fleetDesc}</p>
          </div>
          <Link className={styles.secondary} href="/sewa">
            {t("section_fleet_all", "Lihat semua paket")} <ArrowRight size={16} />
          </Link>
        </div>
        {packages.length ? (
          <div className={`${styles.contentGrid} ${styles.featuredGrid}`}>
            {packages.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        ) : (
          <p>{t("no_packages", "Belum ada paket yang bisa ditampilkan saat ini.")}</p>
        )}
      </section>

      <section className={`${styles.container} ${styles.section}`} id="paket-wisata" aria-labelledby="routes-heading">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="routes-heading">{routesHeading}</h2>
            <p>{routesDesc}</p>
          </div>
          <Link className={styles.secondary} href="/destinasi">
            {t("section_dest_all", "Lihat semua destinasi")} <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.routeGrid}>
          {destinations.slice(0, 3).map((route) => (
            <Link href={`/sewa?destinasi=${encodeURIComponent(route.queryParam)}`} className={styles.route} key={route.id}>
              <Image
                src={route.image}
                alt=""
                fill
                sizes="(max-width: 540px) 92vw, 32vw"
                unoptimized={route.image.startsWith("https://") && !route.image.startsWith("https://res.cloudinary.com/")}
              />
              <div>
                <h3>{route.name}</h3>
                <p>{route.district || route.category}</p>
              </div>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <BookingSteps
        title={bookingTitle}
        subtitle={bookingSubtitle}
        steps={configuredSteps}
        isCustom={configuredSteps.length > 0}
      />

      {sections.filter((section) => section.section_type === "information").map((section) => (
        <section key={section.id} className={`${styles.container} ${styles.section}`}>
          <div className={styles.steps}>
            <h2>{section.title}</h2>
            <p className="mt-2 whitespace-pre-line">{section.subtitle || (typeof section.content?.text === "string" ? section.content.text : "")}</p>
          </div>
        </section>
      ))}

      <Testimonials items={reviews} />
      <TripGallery photos={photos} />
      <ArticleSection articles={articles} />
    </div>
  );
}
