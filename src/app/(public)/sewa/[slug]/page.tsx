import styles from "@/components/landing/cinematic.module.css";
import { getBookingDates } from "@/lib/utils/date";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getPickupZones } from "@/lib/services/catalog";
import { BookingWidget } from "./BookingWidget";
import { ProductGallery } from "@/components/ProductGallery";
import { getSiteSettings, siteDefaults, whatsappLink } from "@/lib/services/settings";
import {
  MapPin,
  Clock,
  Users,
  Check,
  Minus,
  ArrowLeft,
  Car,
  ChevronDown,
} from "lucide-react";

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
  const [p, zones, settings] = await Promise.all([
    getProductBySlug(slug),
    getPickupZones(),
    getSiteSettings(),
  ]);
  if (!p) notFound();
  const dates = getBookingDates(p.min_booking_hours);
  const initialDate =
    queryDate && queryDate >= dates.today ? queryDate : dates.initialDate;

  const durationHours = Math.round(p.duration_minutes / 60);
  const facilities = [
    { title: "Termasuk", items: p.included_facilities, Icon: Check },
    { title: "Di luar harga", items: p.excluded_facilities, Icon: Minus },
  ].filter(({ items }) => items?.length);
  const contact = settings.contact_whatsapp !== siteDefaults.contact_whatsapp
    ? whatsappLink(settings.contact_whatsapp) : null;

  return (
    <div className={`${styles.landing} ${styles.publicPageBackdrop} min-h-screen pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-24`}>
      {/* Top Breadcrumb Bar */}
      <div className="bg-[var(--surface)] border-b border-[var(--line)] sticky top-[3.45rem] min-[851px]:top-16 z-30 shadow-xs">
        <div className="container-app py-3 flex items-center justify-between gap-4">
          <Link
            href="/sewa"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-[color:var(--gold)] hover:text-[color:var(--ink)] bg-[var(--raised)] hover:bg-[var(--raised)] px-3.5 py-1.5 rounded-full transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            <span>Semua Paket</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[color:var(--mist)] overflow-hidden text-ellipsis whitespace-nowrap">
            <Link href="/" className="hover:text-[color:var(--ink)] transition">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/sewa" className="hover:text-[color:var(--ink)] transition">
              Katalog Sewa
            </Link>
            <span>/</span>
            <span className="text-[color:var(--ink)] font-semibold truncate max-w-[200px] md:max-w-xs">
              {p.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-app pt-6 md:pt-8">
        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5 lg:gap-10 items-start">
          {/* Sisi Kiri: Konten Utama Produk */}
          <article className="min-w-0 space-y-6 sm:space-y-8">
            <header>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[color:var(--ink)] tracking-tight leading-tight">
                {p.name}
              </h1>
              {p.short_description && p.short_description.trim() !== p.description?.trim() && (
                <p className="mt-2 text-sm sm:text-base text-[color:var(--mist)] leading-relaxed">{p.short_description}</p>
              )}
              <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-[color:var(--ink)]">
                <li className="inline-flex items-center gap-1.5"><Clock size={16} className="text-[color:var(--gold)]" />{p.duration_text || `${durationHours} jam`}</li>
                <li className="inline-flex items-center gap-1.5"><Users size={16} className="text-[color:var(--gold)]" />Maks. {p.passenger_capacity} orang per Jeep</li>
                <li className="inline-flex items-center gap-1.5"><Car size={16} className="text-[color:var(--gold)]" />{p.driver_included ? "Dengan sopir" : "Lepas kunci"}</li>
              </ul>
              {p.destinations && p.destinations.length > 0 && (
                <p className="mt-3 flex items-start gap-1.5 text-sm text-[color:var(--mist)]">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[color:var(--gold)]" />{p.destinations.join(" · ")}
                </p>
              )}
            </header>

            {/* Galeri Foto Mobil Jeep Trooper HD & Destinasi */}
            <ProductGallery images={p.images ?? []} productName={p.name} />

            {(p.description || facilities.length > 0 || p.terms_content) && (
              <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]" aria-labelledby="package-info">
                <div className="p-4 sm:p-6">
                  <h2 id="package-info" className="text-lg font-extrabold tracking-tight text-[color:var(--ink)] sm:text-xl">Informasi paket</h2>
                  {p.description && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[color:var(--mist)]">{p.description}</p>}
                  {facilities.length > 0 && (
                    <div className="mt-4 grid gap-4 border-t border-[var(--line)] pt-4 sm:grid-cols-2">
                      {facilities.map(({ title, items, Icon }) => (
                        <div key={title}>
                          <h3 className="text-sm font-bold text-[color:var(--ink)]">{title}</h3>
                          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[color:var(--mist)]">
                            {items?.map((item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Icon size={15} className="mt-0.5 shrink-0 text-[color:var(--gold)]" aria-hidden="true" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {p.terms_content && (
                  <details className="group border-t border-[var(--line)]">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-bold text-[color:var(--ink)] sm:px-6 [&::-webkit-details-marker]:hidden">
                      Ketentuan sewa
                      <ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                    </summary>
                    <p className="whitespace-pre-line px-4 pb-4 text-sm leading-relaxed text-[color:var(--mist)] sm:px-6">{p.terms_content}</p>
                  </details>
                )}
              </section>
            )}
          </article>

          {/* Sisi Kanan: Modern OTA Booking Card (Sticky) */}
          <BookingWidget
            product={p}
            pickupZones={zones}
            today={dates.today}
            initialDate={initialDate}
            contact={contact}
          />
        </div>
      </div>
    </div>
  );
}
