"use client";

import { useLanguage } from "@/lib/i18n/context";
import styles from "./cinematic.module.css";

export function BookingSteps({ title, subtitle, steps, isCustom = false }: {
  title?: string;
  subtitle?: string;
  steps?: readonly (readonly [string, string])[];
  isCustom?: boolean;
}) {
  const { language, t } = useLanguage();

  const displayTitle = !isCustom || language !== "id" ? t("booking_steps_title", "Alur booking") : (title || t("booking_steps_title", "Alur booking"));
  const displaySubtitle = !isCustom || language !== "id" ? t("booking_steps_subtitle", "Empat langkah mudah untuk memesan Jeep Trooper Anda.") : (subtitle || t("booking_steps_subtitle", "Empat langkah mudah untuk memesan Jeep Trooper Anda."));

  const localizedDefaultSteps = [
    [t("step_1_title", "Pilih paket"), t("step_1_desc", "Tentukan tanggal, jumlah peserta, dan kebutuhan penjemputan.")],
    [t("step_2_title", "Ajukan booking"), t("step_2_desc", "Admin akan mengecek ketersediaan armada dan mengonfirmasi pengajuan Anda.")],
    [t("step_3_title", "Bayar setelah disetujui"), t("step_3_desc", "Pilih DP atau lunas dari halaman pesanan setelah Admin menyetujui.")],
  ] as const;

  const currentSteps = !isCustom || language !== "id" ? localizedDefaultSteps : (steps && steps.length > 0 ? steps : localizedDefaultSteps);

  return (
    <section className={`${styles.container} ${styles.section}`} aria-labelledby="steps-heading">
      <div className={`${styles.steps} ${styles.bookingGuide}`}>
        <div className={styles.guideIntro}>
          <h2 id="steps-heading">{displayTitle}</h2>
          {displaySubtitle && <p>{displaySubtitle}</p>}
        </div>
        <ol aria-labelledby="steps-heading">
          {currentSteps.map(([heading, copy], index) => (
            <li key={`${index}-${heading}`}>
              <span aria-hidden="true">{index + 1}</span>
              <div>
                <strong>{heading}</strong>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
