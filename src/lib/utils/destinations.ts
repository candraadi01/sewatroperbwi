import type { Product } from "@/types/database";

export interface DestinationPoint {
  name: string;
  slug?: string;
}

/**
 * Normalisasi teks untuk deteksi destinasi
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/sukomade/g, "sukamade")
    .replace(/jawatan/g, "djawatan");
}

/**
 * Mencari filter slug destinasi yang cocok dari nama atau teks lokasi
 */
export function matchDestinationSlug(text: string): string | undefined {
  const norm = normalizeText(text);
  if (norm.includes("sukamade")) return "sukamade";
  if (norm.includes("djawatan")) return "djawatan";
  if (norm.includes("baluran")) return "baluran";
  if (norm.includes("ijen")) return "ijen";
  if (norm.includes("wurung")) return "kawah-wurung";
  if (norm.includes("purwo")) return "alas-purwo";
  if (norm.includes("hijau")) return "teluk-hijau";
  return undefined;
}

/**
 * Mendapatkan daftar titik lokasi destinasi nyata untuk setiap produk
 */
export function getProductDestinationPoints(p: Product): DestinationPoint[] {
  const slug = p.slug?.toLowerCase() || "";
  const name = p.name?.toLowerCase() || "";

  // 1. Sukamade Packages
  if (slug.includes("sukamade") || (name.includes("sukamade") && !name.includes("djawatan"))) {
    return [
      { name: "Pantai Sukamade", slug: "sukamade" },
      { name: "TN Meru Betiri (Konservasi Penyu)", slug: "sukamade" },
    ];
  }

  // 2. De Djawatan Packages
  if (slug === "jeep-djawatan" || (name.includes("djawatan") && !name.includes("wurung") && !name.includes("sukamade"))) {
    return [
      { name: "Hutan De Djawatan", slug: "djawatan" },
      { name: "Spot Foto Pohon Trembesi Purba", slug: "djawatan" },
    ];
  }

  // 3. Baluran Packages
  if (slug === "jeep-baluran" || slug === "safari-baluran-fotografer" || (name.includes("baluran") && !name.includes("ijen"))) {
    return [
      { name: "Taman Nasional Baluran", slug: "baluran" },
      { name: "Savana Bekol & Pantai Bama", slug: "baluran" },
    ];
  }

  // 4. Kawah Ijen + Kawah Wurung
  if (slug.includes("ijen") && slug.includes("wurung")) {
    return [
      { name: "Kawah Ijen (Blue Fire)", slug: "ijen" },
      { name: "Kawah Wurung Highland", slug: "kawah-wurung" },
    ];
  }

  // 5. Kawah Ijen + Baluran
  if (slug.includes("ijen") && slug.includes("baluran")) {
    return [
      { name: "Kawah Ijen (Blue Fire)", slug: "ijen" },
      { name: "Taman Nasional Baluran", slug: "baluran" },
    ];
  }

  // 6. De Djawatan + Sukamade
  if (slug.includes("djawatan") && slug.includes("sukamade")) {
    return [
      { name: "Hutan De Djawatan", slug: "djawatan" },
      { name: "Pantai Sukamade & Meru Betiri", slug: "sukamade" },
    ];
  }

  // 7. Kawah Wurung + Djawatan
  if (slug.includes("wurung") && slug.includes("djawatan")) {
    return [
      { name: "Kawah Wurung Highland", slug: "kawah-wurung" },
      { name: "Hutan De Djawatan", slug: "djawatan" },
    ];
  }

  // 8. Sewa Harian Trooper + Sopir
  if (slug.includes("harian") || p.service_type === "harian_sopir") {
    return [
      { name: "Banyuwangi Kota & Sekitarnya", slug: "" },
      { name: "Rute Bebas Pilihan Tamu (Djawatan/Ijen/dll)", slug: "" },
    ];
  }

  // 9. Sewa Lepas Kunci Trooper
  if (slug.includes("lepas-kunci") || p.service_type === "harian_lepas_kunci") {
    return [
      { name: "Area Banyuwangi Raya", slug: "" },
      { name: "Rute Bebas & Fleksibel", slug: "" },
    ];
  }

  // 10. Jika ada destinations eksplisit yang diisi admin
  if (p.destinations && p.destinations.length > 0) {
    return p.destinations.map((d) => ({
      name: d,
      slug: matchDestinationSlug(d),
    }));
  }

  // 11. Fallback dari route_name atau short_description
  if (p.route_name && p.route_name.trim().length > 0) {
    return [
      {
        name: p.route_name,
        slug: matchDestinationSlug(p.route_name),
      },
    ];
  }

  if (p.short_description && p.short_description.trim().length > 0) {
    return [
      {
        name: p.short_description,
        slug: matchDestinationSlug(p.short_description),
      },
    ];
  }

  return [{ name: "Banyuwangi Raya", slug: "" }];
}

export interface PresetCoordinate {
  key: string;
  label: string;
  district: string;
  lat: number;
  lng: number;
}

export const BANYUWANGI_PRESET_COORDS: PresetCoordinate[] = [
  { key: "ijen", label: "Kawah Ijen", district: "Kecamatan Licin", lat: -8.0583, lng: 114.2425 },
  { key: "baluran", label: "Taman Nasional Baluran", district: "Kecamatan Wongsorejo", lat: -7.8389, lng: 114.3833 },
  { key: "djawatan", label: "Hutan De Djawatan", district: "Kecamatan Cluring", lat: -8.4167, lng: 114.2167 },
  { key: "sukamade", label: "Pantai Sukamade (Meru Betiri)", district: "Kecamatan Pesanggaran", lat: -8.5333, lng: 113.8833 },
  { key: "purwo", label: "Taman Nasional Alas Purwo", district: "Kecamatan Tegaldlimo", lat: -8.65, lng: 114.4333 },
  { key: "kota", label: "Kota Banyuwangi / Bandara", district: "Banyuwangi Kota", lat: -8.2192, lng: 114.3692 },
];

/**
 * Mengembalikan koordinat titik lokasi armada di peta Banyuwangi.
 * Prioritas: koordinat kustom yang disimpan Admin/Owner, lalu deteksi otomatis dari nama/slug/rute.
 */
export function resolveProductCoordinates(p: Product): {
  lat: number;
  lng: number;
  label: string;
  destinationKey: string;
} {
  if (
    typeof p.latitude === "number" &&
    typeof p.longitude === "number" &&
    Number.isFinite(p.latitude) &&
    Number.isFinite(p.longitude) &&
    p.latitude !== 0 &&
    p.longitude !== 0
  ) {
    const text = `${p.location_label || ""} ${p.name} ${p.slug} ${p.route_name || ""}`.toLowerCase();
    const matched =
      text.includes("baluran") ? "baluran" :
      text.includes("ijen") || text.includes("wurung") ? "ijen" :
      text.includes("djawatan") ? "djawatan" :
      text.includes("sukamade") || text.includes("meru") ? "sukamade" :
      text.includes("purwo") ? "purwo" :
      "kota";
    return {
      lat: p.latitude,
      lng: p.longitude,
      label: p.location_label?.trim() || p.route_name?.trim() || p.name,
      destinationKey: matched,
    };
  }

  const text = `${p.slug || ""} ${p.name || ""} ${p.route_name || ""} ${(p.destinations || []).join(" ")}`.toLowerCase();

  if (text.includes("baluran") && !text.includes("ijen")) {
    return { lat: -7.8389, lng: 114.3833, label: "TN Baluran", destinationKey: "baluran" };
  }
  if (text.includes("sukamade") || text.includes("meru")) {
    return { lat: -8.5333, lng: 113.8833, label: "Pantai Sukamade", destinationKey: "sukamade" };
  }
  if (text.includes("djawatan") || text.includes("jawatan")) {
    return { lat: -8.4167, lng: 114.2167, label: "Hutan De Djawatan", destinationKey: "djawatan" };
  }
  if (text.includes("purwo")) {
    return { lat: -8.65, lng: 114.4333, label: "TN Alas Purwo", destinationKey: "purwo" };
  }
  if (text.includes("wurung") && !text.includes("ijen")) {
    return { lat: -8.0985, lng: 114.1558, label: "Kawah Wurung", destinationKey: "ijen" };
  }
  if (text.includes("ijen") || text.includes("blue fire")) {
    return { lat: -8.0583, lng: 114.2425, label: "Kawah Ijen", destinationKey: "ijen" };
  }
  if (text.includes("teluk hijau") || text.includes("hijau")) {
    return { lat: -8.5625, lng: 113.9242, label: "Teluk Hijau", destinationKey: "sukamade" };
  }

  return { lat: -8.2192, lng: 114.3692, label: "Kota Banyuwangi", destinationKey: "kota" };
}
