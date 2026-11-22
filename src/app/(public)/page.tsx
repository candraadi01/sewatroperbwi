import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Headphones, Map, ShieldCheck, Users } from "lucide-react";
import { CinematicHero } from "@/components/landing/CinematicHero";
import { Testimonials } from "@/components/landing/Testimonials";
import { ArticleSection } from "@/components/landing/ArticleSection";
import { BookingSteps } from "@/components/landing/BookingSteps";
import { TripGallery } from "@/components/landing/TripGallery";
import styles from "@/components/landing/cinematic.module.css";
import { getProducts } from "@/lib/services/catalog";
import { ProductCard } from "@/components/ProductCard";
import { getDestinations } from "@/lib/services/destinations";
import { getTestimonials } from "@/lib/services/testimonials";
import { getContent, getLandingSections } from "@/lib/services/content";
import { gallerySectionType, isGalleryImage, sampleGallery } from "@/lib/gallery";

const benefits = [
  { Icon: ShieldCheck, title: "Armada terawat", copy: "Siap menempuh rute wisata" },
  { Icon: Users, title: "Driver lokal", copy: "Mengenal medan Banyuwangi" },
  { Icon: Map, title: "Pilihan destinasi", copy: "Kawah, savana, hutan, dan pantai" },
  { Icon: Headphones, title: "Bantuan pemesanan", copy: "Koordinasi langsung dengan Admin" },
];


const bookingSteps = [
  ["Pilih paket", "Tentukan tanggal, jumlah peserta, dan kebutuhan penjemputan."],
  ["Ajukan booking", "Admin akan mengecek ketersediaan armada dan mengonfirmasi pengajuan Anda."],
  ["Bayar setelah disetujui", "Pilih DP atau lunas dari halaman pesanan setelah Admin menyetujui."],
] as const;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

const publicImage = /^(\/images\/|https:\/\/res\.cloudinary\.com\/)/;

function items(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> =>
    item !== null && typeof item === "object" && !Array.isArray(item)) : [];
}

export default async function Home() {
  const [products, destinations, reviews, articles, sections] = await Promise.all([
    getProducts({ sort: "popular" }), getDestinations(), getTestimonials(),
    getContent("articles"), getLandingSections(),
  ]);
  const packages = products.slice(0, 4);
  const hero = sections.find((section) => section.section_type === "hero");
  const featured = sections.find((section) => section.section_type === "featured");
  const featuredTitle = text(featured?.title);
  const featuredSubtitle = text(featured?.subtitle);
  const routeIntro = sections.find((section) => section.section_type === "destinations");
  const booking = sections.find((section) => section.section_type === "howto");
  const features = sections.find((section) => section.section_type === "features");
  const backdrop = text(hero?.content?.image);
  const fleet = items(hero?.content?.fleet).flatMap((item) => {
    const name = text(item.name);
    const photo = text(item.photo);
    return name && publicImage.test(photo) ? [{ name, photo }] : [];
  }).slice(0, 4);
  const configuredSteps = items(booking?.content?.items).flatMap((item) =>
    text(item.title) && text(item.text) ? [[text(item.title), text(item.text)] as const] : [],
  ).slice(0, 6);
  const configuredBenefits = items(features?.content?.items).flatMap((item) =>
    text(item.title) && text(item.text) ? [{ title: text(item.title), copy: text(item.text) }] : [],
  ).slice(0, 4);
  const photos = sections.flatMap((section) => {
    const image = section.content?.image;
    return section.section_type === gallerySectionType && isGalleryImage(image)
      ? [{ id: section.id, title: section.title, caption: section.subtitle, image }]
      : [];
  });
  return (
    <div className={`min-h-screen ${styles.landing}`}>
      <CinematicHero destinations={destinations} heading={hero?.title || "Eksplor Banyuwangi dengan"}
        accent={text(hero?.content?.accent) || (hero?.title ? "" : "Trooper Tangguh.")}
        description={hero?.subtitle || "Jelajahi Banyuwangi dengan Jeep Trooper dan driver lokal yang mengenal medannya."}
        eyebrow={text(hero?.content?.eyebrow) || "SEWA JEEP TROPER DI BANYUWANGI"}
        backdrop={publicImage.test(backdrop) ? backdrop : "/images/landing/cinematic-banyuwangi.webp"}
        fleet={fleet} />
      <div className={`${styles.container} ${styles.assurance}`}>
        {(configuredBenefits.length ? configuredBenefits : benefits).map(({ title, copy }, index) => {
          const Icon = benefits[index].Icon;
          return <div key={`${index}-${title}`}><span className={styles.assuranceIcon}><Icon size={21} aria-hidden="true" /></span><div><strong>{title}</strong><span className={styles.assuranceCopy}>{copy}</span></div></div>;
        })}
      </div>

      <section className={`${styles.container} ${styles.section}`} id="armada" aria-labelledby="fleet-heading">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="fleet-heading">{featuredTitle && featuredTitle !== "Paket Wisata Populer" ? featuredTitle : "Paket Wisata Jeep Trooper"}</h2>
            <p>{featuredSubtitle && featuredSubtitle !== "Destinasi favorit wisatawan dengan rute terencana dan sopir berpengalaman."
              ? featuredSubtitle : "Jelajahi kawah, savana, dan pantai Banyuwangi dengan Jeep Trooper 4×4. Pilih paket sesuai rute dan durasi perjalanan Anda."}</p>
          </div>
          <Link className={styles.secondary} href="/sewa">Lihat semua paket <ArrowRight size={16} /></Link>
        </div>
        {packages.length ? (
          <div className={`${styles.contentGrid} ${styles.featuredGrid}`}>
            {packages.map((product) => <ProductCard key={product.id} product={product} compact />)}
          </div>
        ) : <p>Belum ada paket yang bisa ditampilkan saat ini.</p>}
      </section>

      <section className={`${styles.container} ${styles.section}`} id="paket-wisata" aria-labelledby="routes-heading">
        <div className={styles.sectionHeader}>
          <div><h2 id="routes-heading">{routeIntro?.title || "Destinasi populer"}</h2><p>{routeIntro?.subtitle || "Mulai dari tempat yang ingin Anda jelajahi."}</p></div>
          <Link className={styles.secondary} href="/destinasi">Lihat semua destinasi <ArrowRight size={16} /></Link>
        </div>
        <div className={styles.routeGrid}>
          {destinations.slice(0, 3).map((route) => (
            <Link href={`/sewa?destinasi=${encodeURIComponent(route.queryParam)}`} className={styles.route} key={route.id}>
              <Image src={route.image} alt="" fill sizes="(max-width: 540px) 92vw, 32vw"
                unoptimized={route.image.startsWith("https://") && !route.image.startsWith("https://res.cloudinary.com/")} />
              <div><h3>{route.name}</h3><p>{route.district || route.category}</p></div>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <BookingSteps title={booking?.title || "Alur booking"}
        subtitle={configuredSteps.length > 0 || booking?.subtitle !== "Empat langkah mudah untuk memesan Jeep Trooper Anda." ? booking?.subtitle : undefined}
        steps={configuredSteps.length ? configuredSteps : bookingSteps} />

      {sections.filter((section) => section.section_type === "information").map((section) => (
        <section key={section.id} className={`${styles.container} ${styles.section}`}>
          <div className={styles.steps}><h2>{section.title}</h2><p className="mt-2 whitespace-pre-line">{section.subtitle || text(section.content?.text)}</p></div>
        </section>
      ))}
      <Testimonials items={reviews} />
      <TripGallery photos={photos.length ? photos : sampleGallery} />
      <ArticleSection articles={articles} />
    </div>
  );
}
