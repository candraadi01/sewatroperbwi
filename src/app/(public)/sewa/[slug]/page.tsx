import { getBookingDates } from "@/lib/utils/date";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getPickupZones } from "@/lib/services/catalog";
import { BookingWidget } from "./BookingWidget";
import { serviceLabels } from "@/components/ProductCard";
import { MapPin } from "lucide-react";
export default async function Detail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const queryDate = typeof sp.date === "string" ? sp.date : "";
  const [p, zones] = await Promise.all([
    getProductBySlug(slug),
    getPickupZones(),
  ]);
  if (!p) notFound();
  const dates = getBookingDates(p.min_booking_hours);
  const initialDate = queryDate && queryDate >= dates.today ? queryDate : dates.initialDate;
  return (
    <div className="container-app py-7 md:py-12">
      <Link href="/sewa" className="text-sm text-neutral-600 hover:underline">
        ← Semua layanan
      </Link>
      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-12 mt-7 items-start">
        <article>
          <p className="eyebrow">{serviceLabels[p.service_type]}</p>
          <h1 className="section-heading mt-3">{p.name}</h1>
          <p className="mt-4 text-neutral-600">{p.short_description}</p>
          {p.destinations && p.destinations.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3.5">
              <span className="text-xs font-bold text-neutral-500 flex items-center gap-1">
                <MapPin size={13} className="text-[#327691]" /> Titik Destinasi:
              </span>
              {p.destinations.map((dest, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#e9f3f7] text-[#2c6881] border border-[#ccd8de]"
                >
                  <MapPin size={11} className="text-[#327691]" />
                  {dest}
                </span>
              ))}
            </div>
          )}
          <figure className="mt-7">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100">
              <Image
                src={p.images?.[0] || "/images/trooper-reference.jpg"}
                alt={p.images?.[0] ? p.name : "Ilustrasi model Jeep Trooper"}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
            </div>
            {!p.images?.length && (
              <figcaption className="text-xs text-neutral-500 mt-2">
                Foto ilustrasi model. Unit perjalanan dikonfirmasi oleh admin.
              </figcaption>
            )}
          </figure>
          <div className="flex flex-wrap gap-3 mt-6 text-sm">
            <span className="rounded-full bg-neutral-100 px-4 py-2">
              {p.duration_minutes / 60} jam
            </span>
            <span className="rounded-full bg-neutral-100 px-4 py-2">
              Maks. {p.passenger_capacity} peserta / unit
            </span>
            <span className="rounded-full bg-neutral-100 px-4 py-2">
              {p.driver_included ? "Dengan sopir" : "Tanpa sopir"}
            </span>
          </div>
          <section className="mt-9">
            <h2 className="text-xl font-semibold">Tentang layanan</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-600">
              {p.description}
            </p>
          </section>
          <div className="grid sm:grid-cols-2 gap-7 mt-9">
            {[
              ["Termasuk", p.included_facilities],
              ["Di luar harga", p.excluded_facilities],
            ].map(([title, items]) => (
              <section key={title as string}>
                <h2 className="font-semibold text-lg">{title as string}</h2>
                <ul className="mt-4 list-disc pl-5 space-y-2 text-sm text-neutral-600">
                  {(items as string[]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          {p.terms_content && (
            <section className="mt-9 border-t pt-7 border-neutral-200">
              <h2 className="font-semibold text-lg">Ketentuan layanan</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                {p.terms_content}
              </p>
            </section>
          )}
          <p className="mt-8 text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
            ℹ Pemesanan minimal {p.min_booking_hours} jam sebelum keberangkatan.
            Pengajuan sewa diajukan terlebih dahulu tanpa biaya. Admin akan memeriksa ketersediaan armada Trooper sebelum pembayaran dibuka.
          </p>
        </article>
        <BookingWidget
          product={p}
          pickupZones={zones}
          today={dates.today}
          initialDate={initialDate}
        />
      </div>
    </div>
  );
}
