import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface TestimonialItem {
  id: string | number;
  name: string;
  city: string;
  ratingText: string;
  stars: number;
  content: string;
}

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "1",
    name: "Anis Mulan",
    city: "Yogyakarta",
    ratingText: "RATING 5/5",
    stars: 5,
    content:
      "Pelayanan persewaan jeep di Banyuwangi sangat memuaskan. Admin ramah dan responsif saat memberikan informasi maupun membantu proses pemesanan. Driver jeep berpengalaman, tepat waktu, serta mengutamakan keselamatan dan kenyamanan selama perjalanan. Kondisi jeep bersih, terawat, dan nyaman digunakan untuk wisata.",
  },
  {
    id: "2",
    name: "Deki Firmansyah",
    city: "Jakarta",
    ratingText: "RATING 5/5",
    stars: 5,
    content:
      "Pelayanan sewa jeep di Banyuwangi ini benar-benar recommended! Driver ramah, jeep bersih dan nyaman dipakai keliling wisata. Perjalanan ke Baluran dan Kawah Ijen jadi makin seru karena drivernya juga sekalian jadi guide yang informatif. Tepat waktu, harga sesuai, dan dokumentasi fotonya keren banget.",
  },
  {
    id: "3",
    name: "Rina Kusuma Dewi",
    city: "Surabaya",
    ratingText: "RATING 5/5",
    stars: 5,
    content:
      "Pengalaman liburan keluarga yang tak terlupakan naik Jeep Trooper ke Pantai Sukamade dan Hutan De Djawatan. Driver sangat sabar dan mengutamakan keselamatan saat melintasi medan offroad sungai. Anak-anak sangat gembira, unit bersih dan terawat dengan sangat prima!",
  },
  {
    id: "4",
    name: "Aditya Pratama",
    city: "Bandung",
    ratingText: "RATING 5/5",
    stars: 5,
    content:
      "Sewa jeep untuk sunrise Kawah Wurung dan Kawah Ijen luar biasa puas! Penjemputan tepat waktu dini hari, perlengkapan senter dan masker gas bersih. Driver tahu titik spot foto terbaik yang jarang dikunjungi orang lain. Pasti akan sewa lagi di sini!",
  },
];

export async function getTestimonials(): Promise<TestimonialItem[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_TESTIMONIALS;
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("id, name, city, rating_text, stars, content")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_TESTIMONIALS;
    }

    return data.map((t) => ({
      id: t.id,
      name: t.name,
      city: t.city || "Banyuwangi",
      ratingText: t.rating_text || "RATING 5/5",
      stars: t.stars || 5,
      content: t.content,
    }));
  } catch {
    return DEFAULT_TESTIMONIALS;
  }
}
