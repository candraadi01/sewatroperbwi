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
  const route = p.route_name?.toLowerCase() || "";

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
