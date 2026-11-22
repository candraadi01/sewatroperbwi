"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import type { GalleryPhoto } from "@/lib/gallery";
import styles from "./cinematic.module.css";

export function TripGallery({ photos }: { photos: GalleryPhoto[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);
  if (!photos.length) return null;

  return (
    <section className={`${styles.container} ${styles.section}`} aria-labelledby="trip-gallery-heading">
      <div className={styles.sectionHeader}>
        <h2 id="trip-gallery-heading">Dokumentasi foto</h2>
      </div>
      <div className={styles.tripGallery}>
        {photos.map((photo) => (
          <button type="button" key={photo.id} className={styles.tripPhoto} aria-haspopup="dialog"
            aria-label={`Perbesar foto ${photo.title}`} onClick={() => { setSelected(photo); dialog.current?.showModal(); }}>
            <Image src={photo.image} alt="" fill sizes="(max-width: 550px) 53vw, (max-width: 850px) 42vw, 30vw" />
            <span className={styles.tripPhotoLabel}><strong>{photo.title}</strong><Maximize2 size={17} aria-hidden="true" /></span>
          </button>
        ))}
      </div>
      <dialog ref={dialog} className={styles.photoDialog} aria-label={selected?.title ?? "Foto perjalanan"} onClose={() => setSelected(null)}>
        <form method="dialog"><button className={styles.closePhoto} aria-label="Tutup foto"><X size={22} /></button></form>
        {selected && <figure>
          <div className={styles.fullPhoto}><Image src={selected.image} alt={selected.title} fill sizes="(max-width: 760px) 96vw, 80vw" /></div>
          <figcaption><strong>{selected.title}</strong>{selected.caption && <span>{selected.caption}</span>}</figcaption>
        </figure>}
      </dialog>
    </section>
  );
}
