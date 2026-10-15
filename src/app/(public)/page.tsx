import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MoveUpRight, MapPin } from "lucide-react";
import { getProducts } from "@/lib/services/catalog";
import { getSiteSettings } from "@/lib/services/settings";
import { ProductCard } from "@/components/ProductCard";
import { getLandingSections } from "@/lib/services/content";
export default async function Home() {
  const [settings, products, sections] = await Promise.all([
    getSiteSettings(),
    getProducts(),
    getLandingSections(),
  ]);
  return (
    <>
      <section className="bg-[#f3f1eb] border-b border-neutral-200">
        <div className="container-app py-8 md:py-12 lg:py-16 grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-14 items-center">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <MapPin size={15} />
              Jawa Timur · Indonesia
            </p>
            <h1 className="mt-5 whitespace-pre-line text-5xl sm:text-6xl xl:text-7xl font-semibold tracking-[-0.055em] leading-[1.04]">
              {settings.hero_title}
            </h1>
            <p className="mt-6 max-w-md text-base md:text-lg leading-relaxed text-neutral-600">
              {settings.hero_description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="action-link" href="/sewa">
                Temukan perjalananmu <ArrowRight size={17} />
              </Link>
              <Link className="action-link-secondary" href="#cara-booking">
                Cara pemesanan
              </Link>
            </div>
            <p className="mt-7 text-xs text-neutral-500">
              Paket rute · Harian dengan sopir · Lepas kunci*
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              *Sesuai layanan yang diterbitkan admin.
            </p>
          </div>
          <figure className="relative">
            <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-neutral-200">
              <Image
                src={settings.hero_image}
                alt="Jeep Trooper, ilustrasi kendaraan untuk perjalanan"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 flex justify-between gap-4 text-xs text-neutral-500">
              <span>Jeep Trooper · foto ilustrasi model</span>
              <span>Rute pilihanmu, perjalanan privat.</span>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="container-app py-12 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div>
            <p className="eyebrow">Mulai dari rutenya</p>
            <h2 className="section-heading mt-2">Mau ke mana kali ini?</h2>
          </div>
          <Link
            href="/sewa"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
          >
            Lihat semua layanan <MoveUpRight size={17} />
          </Link>
        </div>
        {products.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 3).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="admin-panel text-neutral-600">
            Paket sedang disiapkan. Hubungi admin melalui halaman kontak untuk
            rencana perjalananmu.
          </div>
        )}
      </section>
      <section
        id="cara-booking"
        className="scroll-mt-24 border-y border-neutral-200 bg-neutral-50"
      >
        <div className="container-app py-12 md:py-16">
          <p className="eyebrow">Rencanakan dengan jelas</p>
          <h2 className="section-heading mt-2">
            Dari pilih rute sampai berangkat.
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            {[
              [
                "01",
                "Pilih perjalanan",
                "Tentukan paket, tanggal, jumlah peserta, dan titik jemput. Periksa rincian harga sebelum melanjutkan.",
              ],
              [
                "02",
                "Bayar DP atau lunas",
                "Masuk ke akun, lengkapi data, lalu bayar melalui Midtrans. Status pembayaran diperbarui setelah diverifikasi.",
              ],
              [
                "03",
                "Tunggu konfirmasi admin",
                "Admin menghubungi penyedia Trooper dan mengonfirmasi kendaraan. Pantau statusnya dari Pesanan Saya.",
              ],
            ].map(([n, t, d]) => (
              <div key={n} className="border-t border-neutral-300 pt-5">
                <span className="text-sm text-primary-700 font-semibold">
                  {n}
                </span>
                <h3 className="mt-4 text-xl font-semibold">{t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {d}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-neutral-600">
            Pembayaran diterima dan kendaraan terkonfirmasi adalah dua tahap
            berbeda. Jika kendaraan tidak tersedia, admin akan menghubungi
            pemesan untuk penyelesaian sesuai kebijakan yang berlaku.
          </p>
        </div>
      </section>
      {sections.map((s) => (
        <section
          key={s.id}
          className="container-app py-12 border-b border-neutral-200"
        >
          <p className="eyebrow">Informasi perjalanan</p>
          <h2 className="section-heading mt-2">{s.title}</h2>
          {s.subtitle && <p className="mt-3 text-neutral-600">{s.subtitle}</p>}
          {typeof s.content?.text === "string" && (
            <p className="mt-5 whitespace-pre-line max-w-3xl leading-relaxed">
              {s.content.text}
            </p>
          )}
        </section>
      ))}
      <section className="container-app py-12 md:py-16 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="section-heading">Belum yakin dengan rutenya?</h2>
          <p className="mt-3 text-neutral-600">
            Diskusikan kebutuhan dan titik jemput sebelum memesan.
          </p>
        </div>
        <Link href="/kontak" className="action-link-secondary">
          Hubungi admin <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
