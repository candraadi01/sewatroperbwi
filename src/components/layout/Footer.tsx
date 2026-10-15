import { getMenu } from "@/lib/services/content";
import Link from "next/link";
import { getSiteSettings, whatsappLink } from "@/lib/services/settings";
export async function Footer() {
  const [s, menu] = await Promise.all([getSiteSettings(), getMenu("footer")]);
  const wa = whatsappLink(s.contact_whatsapp);
  return (
    <footer className="bg-[#182922] text-white">
      <div className="container-app py-12 grid sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-9">
        <div>
          <Link href="/" className="text-xl font-semibold">
            {s.site_name}
          </Link>
          <p className="mt-3 text-sm text-white/65 max-w-sm">
            {s.site_tagline}
          </p>
          <p className="mt-5 text-sm text-white/65">{s.contact_address}</p>
          {wa && (
            <a
              className="block mt-3 text-sm underline underline-offset-4"
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp admin
            </a>
          )}
          {s.contact_email && (
            <a
              className="block mt-2 text-sm"
              href={"mailto:" + s.contact_email}
            >
              {s.contact_email}
            </a>
          )}
        </div>
        {[
          [
            "Perjalanan",
            [
              ["Semua layanan", "/sewa"],
              ["Cara pemesanan", "/#cara-booking"],
              ["Pesanan Saya", "/akun/pesanan"],
              ["Artikel", "/artikel"],
              ["FAQ", "/faq"],
            ],
          ],
          [
            "Informasi",
            [
              ["Tentang kami", "/tentang"],
              ["Kontak", "/kontak"],
              ["Syarat & ketentuan", "/syarat-ketentuan"],
              ["Pembatalan & refund", "/kebijakan-pembatalan"],
              ["Privasi", "/kebijakan-privasi"],
            ],
          ],
        ].map(([title, links]) => (
          <div key={title as string}>
            <h2 className="text-sm font-semibold">{title as string}</h2>
            <ul className="mt-4 space-y-2">
              {(title === "Informasi" && menu.length
                ? menu.map((i) => [i.label, i.href])
                : (links as string[][])
              ).map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/65 hover:text-white inline-block py-1"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-app py-5 flex flex-wrap justify-between gap-4 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} {s.site_name}
          </p>
          <p>
            Foto ilustrasi Trooper:{" "}
            <a
              className="underline"
              href="https://commons.wikimedia.org/wiki/File:Isuzu_Trooper_3_Pintu,_Denpasar.jpg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sabung.hamster
            </a>{" "}
            ·{" "}
            <a
              className="underline"
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY-SA 4.0
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
