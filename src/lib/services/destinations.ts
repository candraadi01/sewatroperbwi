import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface DestinationItem {
  id: string;
  name: string;
  category: "Semua" | "Gunung" | "Taman Nasional" | "Hutan & Alam" | "Pantai & Bahari" | "Air Terjun" | string;
  district: string;
  description: string;
  highlights: string[];
  image: string;
  queryParam: string;
}

export const DEFAULT_DESTINATIONS: DestinationItem[] = [
  {
    id: "kawah-ijen",
    name: "Kawah Ijen",
    category: "Gunung",
    district: "Kecamatan Licin",
    description:
      "Kawah vulkanik kaldera Ijen dengan danau asam toska terbesar di dunia, fenomena langka Blue Fire (Api Biru), dan panorama sunrise spektakuler di bibir kawah.",
    highlights: ["Blue Fire Alami", "Danau Kawah Toska", "Sunrise Spektakuler"],
    image: "/images/landing/tour-kawah-ijen.jpg",
    queryParam: "ijen",
  },
  {
    id: "baluran",
    name: "Taman Nasional Baluran",
    category: "Taman Nasional",
    district: "Kecamatan Wongsorejo",
    description:
      "Africa Van Java di ujung timur Jawa dengan padang Savana Bekol yang membentang luas, kawanan banteng jawa, rusa, monyet ekor panjang, dan Pantai Bama asri.",
    highlights: ["Savana Bekol Luas", "Pantai Bama & Mangrove", "Safari Satwa Liar"],
    image: "/images/landing/tour-baluran.jpg",
    queryParam: "baluran",
  },
  {
    id: "de-djawatan",
    name: "Hutan De Djawatan",
    category: "Hutan & Alam",
    district: "Kecamatan Cluring",
    description:
      "Hutan trembesi purba berkanopi magis bak latar film The Lord of the Rings. Suasana teduh asri dengan sorot sinar matahari alami menembus pepohonan raksasa.",
    highlights: ["Pohon Trembesi Raksasa", "Spot Foto Lord of the Rings", "Wisata Keluarga Asri"],
    image: "/images/landing/tour-djawatan.jpg",
    queryParam: "djawatan",
  },
  {
    id: "pantai-sukamade",
    name: "Pantai Sukamade",
    category: "Pantai & Bahari",
    district: "Kecamatan Pesanggaran",
    description:
      "Konservasi penyu bertelur legendaris di kawasan Taman Nasional Meru Betiri. Menawarkan petualangan offroad ekstrem melintasi sungai berbatu dan rimba pesisir.",
    highlights: ["Konservasi Penyu Hijau", "Trek Offroad Sungai", "Pelepasan Tukik"],
    image: "/images/landing/tour-sukamade.jpg",
    queryParam: "sukamade",
  },
  {
    id: "teluk-hijau",
    name: "Teluk Hijau (Green Bay)",
    category: "Pantai & Bahari",
    district: "Kecamatan Pesanggaran",
    description:
      "Surga tersembunyi berpasir putih bersih dengan gradasi air laut hijau toska menakjubkan yang dikelilingi tebing hutan tropis rimbun.",
    highlights: ["Air Laut Hijau Toska", "Air Terjun Tepi Pantai", "Pasir Putih Bersih"],
    image: "/images/landing/tour-teluk-hijau.jpg",
    queryParam: "teluk-hijau",
  },
  {
    id: "kawah-wurung",
    name: "Kawah Wurung",
    category: "Gunung",
    district: "Kecamatan Ijen",
    description:
      "Hamparan perbukitan hijau meliuk-liuk bagaikan Bukit Teletubbies di ketinggian pegunungan Ijen. Udara sejuk dengan pemandangan 360 derajat.",
    highlights: ["Bukit Teletubbies Hijau", "Spot Foto 360 Derajat", "Trek Offroad Rerumputan"],
    image: "/images/landing/tour-kawah-ijen.jpg",
    queryParam: "kawah-wurung",
  },
];

export async function getDestinations(): Promise<DestinationItem[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_DESTINATIONS;
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("destinations")
      .select("id, slug, name, category, district, description, highlights, image_url, query_param")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_DESTINATIONS;
    }

    return data.map((d) => ({
      id: d.slug || d.id,
      name: d.name,
      category: d.category || "Gunung",
      district: d.district || "",
      description: d.description || "",
      highlights: Array.isArray(d.highlights) && d.highlights.length > 0 ? d.highlights : ["Wisata Alam Banyuwangi"],
      image: d.image_url || "/images/landing/tour-kawah-ijen.jpg",
      queryParam: d.query_param || d.slug || "",
    }));
  } catch {
    return DEFAULT_DESTINATIONS;
  }
}
