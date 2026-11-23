import { getProducts } from "@/lib/services/catalog";
import { getDestinations } from "@/lib/services/destinations";
import { getTestimonials } from "@/lib/services/testimonials";
import { getContent, getLandingSections } from "@/lib/services/content";
import { gallerySectionType, isGalleryImage, sampleGallery } from "@/lib/gallery";
import { LandingPageClient } from "@/components/landing/LandingPageClient";

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
    <LandingPageClient
      destinations={destinations}
      packages={packages}
      reviews={reviews}
      articles={articles}
      sections={sections}
      heroConfig={{
        title: hero?.title || "Eksplor Banyuwangi dengan",
        accent: text(hero?.content?.accent) || (hero?.title ? "" : "Trooper Tangguh."),
        description: hero?.subtitle || "Jelajahi Banyuwangi dengan Jeep Trooper dan driver lokal yang mengenal medannya.",
        eyebrow: text(hero?.content?.eyebrow) || "SEWA JEEP TROPER DI BANYUWANGI",
        backdrop: publicImage.test(backdrop) ? backdrop : "/images/landing/cinematic-banyuwangi.webp",
        fleet,
      }}
      configuredBenefits={configuredBenefits}
      configuredSteps={configuredSteps}
      photos={photos.length ? photos : sampleGallery}
      routeIntro={routeIntro ? { title: routeIntro.title, subtitle: routeIntro.subtitle } : undefined}
      featuredTitle={featuredTitle}
      featuredSubtitle={featuredSubtitle}
      bookingTitle={booking?.title}
      bookingSubtitle={booking?.subtitle}
    />
  );
}
