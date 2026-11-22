"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowRight, CalendarDays, MapPin, Search, Users } from "lucide-react";
import type { DateScheduleItem } from "@/lib/services/schedule";
import { HeroDatePicker } from "./HeroDatePicker";
import { FleetShowcase, type FleetSlide } from "./FleetShowcase";
import styles from "./cinematic.module.css";
import { useLanguage } from "@/lib/i18n/context";

import type { DestinationItem } from "@/lib/services/destinations";

export function CinematicHero({ destinations, heading, accent, description, backdrop, eyebrow, fleet }: {
  destinations: DestinationItem[];
  heading: string;
  accent: string;
  description: string;
  backdrop: string;
  eyebrow: string;
  fleet: FleetSlide[];
}) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("");
  const [schedules, setSchedules] = useState<DateScheduleItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const format = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" });
    const start = format.format(new Date());
    const end = format.format(new Date(Date.now() + 35 * 86400000));
    fetch(`/api/schedule/availability?start=${start}&end=${end}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!controller.signal.aborted && result?.success && Array.isArray(result.data)) setSchedules(result.data);
      })
      .catch(() => { /* Date selection remains available without schedule hints. */ });
    return () => controller.abort();
  }, []);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destinasi", destination);
    if (date) params.set("date", date);
    if (passengers) params.set("peserta", passengers);
    const query = params.toString();
    router.push(query ? `/sewa?${query}` : "/sewa");
  }

  return (
    <section className={styles.hero} aria-labelledby="landing-title">
      <div className={styles.scenery} aria-hidden="true">
        <Image src={backdrop} alt="" fill sizes="100vw"
          preload className={styles.sceneryImage} />
      </div>
      <div className={`${styles.container} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="landing-title">{heading} {accent && <em>{accent}</em>}</h1>
          <p className={styles.heroDescription}>{description}</p>
          <div className={styles.heroActions}>
            <a href="#cari-trip" className={styles.primary}>
              <CalendarDays size={18} /> {language === "id" ? "Booking sekarang" : t("btn_book_now")} <ArrowRight size={17} />
            </a>
            <a href="#armada" className={styles.secondary}>Lihat armada <ArrowDown size={17} /></a>
          </div>
        </div>
        <FleetShowcase key={fleet.map(({ name, photo }) => name + photo).join("|")} slides={fleet} />
      </div>
      <div className={`${styles.container} ${styles.searchWrap}`} id="cari-trip">
        <form className={styles.search} onSubmit={search} aria-label="Cari paket sewa Trooper">
          <div className={styles.searchField}>
            <MapPin size={20} aria-hidden="true" />
            <label>
              <span>{t("nav_destinations")}</span>
              <select value={destination} onChange={(event) => setDestination(event.target.value)}>
                <option value="">Semua destinasi</option>
                {destinations.map(({ id, queryParam, name }) => <option value={queryParam} key={id}>{name}</option>)}
              </select>
            </label>
          </div>
          <div className={styles.searchField}>
            <CalendarDays size={20} aria-hidden="true" />
            <div className={styles.dateField}>
              <span>Tanggal sewa</span>
              <HeroDatePicker value={date} onChange={setDate} schedules={schedules} />
            </div>
          </div>
          <div className={styles.searchField}>
            <Users size={20} aria-hidden="true" />
            <label>
              <span>Peserta per Jeep</span>
              <select value={passengers} onChange={(event) => setPassengers(event.target.value)}>
                <option value="">Pilih jumlah</option>
                {Array.from({ length: 7 }, (_, index) => index + 1).map((count) =>
                  <option value={count} key={count}>{count} peserta</option>
                )}
              </select>
            </label>
          </div>
          <button type="submit" className={styles.primary}><Search size={18} /> {language === "id" ? "Cek ketersediaan" : t("search_btn_paket")}</button>
        </form>
      </div>
    </section>
  );
}
