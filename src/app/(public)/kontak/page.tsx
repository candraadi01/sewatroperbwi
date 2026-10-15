import { getSiteSettings, whatsappLink } from "@/lib/services/settings";
export default async function Page() {
  const s = await getSiteSettings(),
    wa = whatsappLink(s.contact_whatsapp);
  return (
    <div className="container-app py-12 md:py-16 max-w-3xl">
      <p className="eyebrow">Bicarakan rencanamu</p>
      <h1 className="section-heading mt-3">Hubungi admin.</h1>
      <p className="mt-4 text-neutral-600">
        Tanyakan rute, titik jemput, atau tindak lanjut pesanan. Sertakan kode
        pesanan jika sudah melakukan booking.
      </p>
      <div className="admin-panel mt-8 space-y-6">
        <div>
          <h2 className="text-sm text-neutral-500">Wilayah layanan</h2>
          <p className="mt-1">{s.service_area}</p>
        </div>
        <div>
          <h2 className="text-sm text-neutral-500">Alamat</h2>
          <p className="mt-1">{s.contact_address}</p>
        </div>
        <div>
          <h2 className="text-sm text-neutral-500">Jam pelayanan</h2>
          <p className="mt-1">{s.office_hours}</p>
        </div>
        {wa && (
          <a
            href={wa}
            className="action-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat WhatsApp
          </a>
        )}
        {s.contact_email && (
          <a href={"mailto:" + s.contact_email} className="block underline">
            {s.contact_email}
          </a>
        )}
        {!wa && !s.contact_email && (
          <p className="notice-warning">
            Kontak usaha belum diterbitkan pengelola.
          </p>
        )}
      </div>
    </div>
  );
}
