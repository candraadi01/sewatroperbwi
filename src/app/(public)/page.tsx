import { NewsTicker } from "@/components/landing/NewsTicker";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { JeepExperience } from "@/components/landing/JeepExperience";
import { TourPackages } from "@/components/landing/TourPackages";
import { Testimonials } from "@/components/landing/Testimonials";
import { ArticleSection } from "@/components/landing/ArticleSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 1. News Ticker Marquee Bar */}
      <NewsTicker />

      {/* 2. Fullscreen Hero Section + Search Form */}
      <HeroSearch />

      {/* 3. Why Choose Us (4 Value Proposition Columns) */}
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
