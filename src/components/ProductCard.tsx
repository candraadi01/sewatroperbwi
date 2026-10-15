import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, Users } from "lucide-react";
import type { Product } from "@/types/database";
import { formatIDR } from "@/lib/utils/currency";
export const serviceLabels = {
  paket_rute: "Paket rute",
  harian_sopir: "Harian + sopir",
  harian_lepas_kunci: "Lepas kunci",
};
export function ProductCard({ product: p }: { product: Product }) {
  return (
    <Link
      href={"/sewa/" + p.slug}
      className="group overflow-hidden rounded-2xl bg-white border border-neutral-200 transition hover:border-primary-600 focus-visible:outline-2 focus-visible:outline-primary-600"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <Image
          src={p.images?.[0] || "/images/trooper-reference.jpg"}
          alt={p.images?.[0] ? p.name : "Ilustrasi model Jeep Trooper"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-medium">
          {serviceLabels[p.service_type]}
        </span>
        {!p.images?.length && (
          <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-[10px] text-white">
            Foto ilustrasi model
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold tracking-tight">{p.name}</h3>
        <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
          {p.short_description}
        </p>
        <div className="mt-4 flex gap-4 text-xs text-neutral-600">
          <span className="flex items-center gap-1">
            <Clock3 size={14} />
            {p.duration_minutes / 60} jam
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} />
            Maks. {p.passenger_capacity} orang / unit
          </span>
        </div>
        <div className="mt-5 flex items-end justify-between border-t border-neutral-100 pt-4">
          <div>
            <p className="text-xs text-neutral-500">
              {p.is_sample_data ? "Tarif ilustrasi" : "Mulai dari"} / unit
            </p>
            <p className="mt-1 text-lg font-semibold">
              {p.base_price ? formatIDR(p.base_price) : "Hubungi admin"}
            </p>
          </div>
          <ArrowUpRight size={22} className="text-primary-700" />
        </div>
      </div>
    </Link>
  );
}
