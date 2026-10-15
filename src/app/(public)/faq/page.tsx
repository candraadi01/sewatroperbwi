import Link from "next/link";
import { getFaqs } from "@/lib/services/content";
export default async function Page() {
  const rows = await getFaqs();
  return (
    <div className="container-app py-12 md:py-16 max-w-3xl">
      <p className="eyebrow">Sebelum berangkat</p>
      <h1 className="section-heading mt-3">
        Pertanyaan yang sering ditanyakan.
      </h1>
      <div className="mt-8 divide-y divide-neutral-200">
        {rows.map((f) => (
          <details key={f.id} className="py-5">
            <summary className="cursor-pointer font-semibold py-1">
              {f.question}
            </summary>
            <p className="mt-4 whitespace-pre-line text-neutral-600 text-sm leading-relaxed">
              {f.answer}
            </p>
          </details>
        ))}
      </div>
      {!rows.length && (
        <p className="mt-7 text-neutral-600">
          Pertanyaan dan jawaban sedang disiapkan pengelola.
        </p>
      )}
      <Link href="/kontak" className="action-link-secondary mt-8">
        Tanyakan ke admin
      </Link>
    </div>
  );
}
