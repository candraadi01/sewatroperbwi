import { HeroSearch } from "@/components/landing/HeroSearch";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { JeepExperience } from "@/components/landing/JeepExperience";
import { TourPackages } from "@/components/landing/TourPackages";
import { Testimonials } from "@/components/landing/Testimonials";
import { ArticleSection } from "@/components/landing/ArticleSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 1. Fullscreen Hero Section + Integrated Transparant News Ticker + Search Form */}
      <HeroSearch />

      {/* 2. Kenapa Memilih Kami (3 Kolom Sesuai Konsep Brand) */}
      <WhyChooseUs />

      {/* 4. Foto 1: Paket Jeep Experience */}
      <JeepExperience />

      {/* 5. Foto 2: Jeep Wisata Banyuwangi */}
      <TourPackages />

      {/* 6. Foto 3: Review Pelanggan Kami / Testimonial */}
      <div id="testimonial">
        <Testimonials />
      </div>

      {/* 7. Foto 4: Artikel Wisata */}
      <ArticleSection />
    </div>
  );
}
