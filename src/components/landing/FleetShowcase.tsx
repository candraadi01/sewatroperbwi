"use client";

import { type CSSProperties, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./cinematic.module.css";

export type FleetSlide = { name: string; photo: string; wheels?: readonly (readonly [number, number])[] };

const illustrations = [
  { name: "Trooper Olive", photo: "/images/landing/fleet-olive.webp", wheels: [[51, 76], [87, 74]] },
  { name: "Trooper Ivory", photo: "/images/landing/fleet-ivory.webp", wheels: [[47, 77], [83, 75]] },
  { name: "Trooper Ember", photo: "/images/landing/fleet-ember.webp", wheels: [[54, 77], [88, 75]] },
  { name: "Trooper Navy", photo: "/images/landing/fleet-navy.webp", wheels: [[47, 78], [82, 76]] },
] as const;

export function FleetShowcase({ slides }: { slides?: FleetSlide[] }) {
  const fleet: readonly FleetSlide[] = slides?.length ? slides : illustrations;
  const count = fleet.length;
  const [{ active, previous, direction }, setSlide] = useState({
    active: 0,
    previous: -1,
    direction: 1,
  });
  const [firstJeepReady, setFirstJeepReady] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const swipe = useRef<{ x: number; y: number } | null>(null);

  function select(index: number, travel: number) {
    if (index === active) return;
    setSlide({ active: index, previous: active, direction: travel });
    setAnnouncement(`${fleet[index].name}, ${index + 1} dari ${fleet.length}`);
  }

  function step(delta: number) {
    select((active + delta + fleet.length) % fleet.length, delta);
  }

  return (
    <section
      aria-label="Pilihan visual Jeep Trooper"
      aria-roledescription="karusel"
      className={styles.showcase}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          step(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div
        className={styles.stage}
        data-direction={direction > 0 ? "forward" : "reverse"}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          swipe.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
        }}
        onTouchEnd={(event) => {
          const start = swipe.current;
          const touch = event.changedTouches[0];
          swipe.current = null;
          if (!start || !touch) return;
          const horizontal = touch.clientX - start.x;
          if (Math.abs(horizontal) > 42 && Math.abs(horizontal) > Math.abs(touch.clientY - start.y)) {
            step(horizontal < 0 ? 1 : -1);
          }
        }}
      >
        {fleet.map((jeep, index) => {
          const state = index === active
            ? previous >= 0 ? "enter" : firstJeepReady ? "arrival" : "parked"
            : index === previous ? "exit" : "hidden";
          return (
            <div
              key={`${jeep.name}-${index}`}
              className={styles.vehicle}
              data-motion={state}
              aria-hidden={index !== active}
              hidden={state === "hidden"}
            >
              <div className={styles.contactShadow} />
              <div className={styles.suspension}>
                <Image src={jeep.photo} alt={jeep.name} width={768} height={512}
                  sizes="(max-width: 767px) 94vw, (max-width: 1300px) 58vw, 760px"
                  loading="eager"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  onLoad={index === 0 ? () => setFirstJeepReady(true) : undefined}
                  onError={index === 0 ? () => setFirstJeepReady(true) : undefined}
                  draggable={false}
                />
                {jeep.wheels?.map(([x, y]) => (
                  <div key={x} aria-hidden="true" className={styles.wheel}
                    style={{ "--wheel-x": `${x}%`, "--wheel-y": `${y}%` } as CSSProperties}>
                    <Image src={jeep.photo} alt="" width={768} height={512}
                      sizes="(max-width: 767px) 94vw, (max-width: 1300px) 58vw, 760px" draggable={false} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {count > 1 && <div className={styles.fleetControls}>
        <button type="button" className={styles.round} aria-label="Jeep sebelumnya" onClick={() => step(-1)}>
          <ArrowLeft size={19} />
        </button>
        <div className={styles.thumbnails}>
          {fleet.map((jeep, index) => (
            <button type="button" key={`${jeep.name}-${index}`} className={styles.thumbnail}
              aria-label={`Tampilkan ${jeep.name}`} aria-pressed={index === active}
              onClick={() => select(index, index > active ? 1 : -1)}>
              <Image src={jeep.photo} width={96} height={64} sizes="84px" alt="" draggable={false} />
            </button>
          ))}
        </div>
        <button type="button" className={styles.round} aria-label="Jeep berikutnya" onClick={() => step(1)}>
          <ArrowRight size={19} />
        </button>
      </div>}
      <p className={styles.vehicleCaption}>{fleet[active].name}</p>
      <p className="sr-only" role="status">{announcement}</p>
    </section>
  );
}
