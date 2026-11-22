"use client";

import { useState } from "react";
import styles from "./cinematic.module.css";

export function BookingSteps({ title, subtitle, steps }: {
  title: string;
  subtitle?: string;
  steps: readonly (readonly [string, string])[];
}) {
  const [active, setActive] = useState(0);

  return (
    <section className={`${styles.container} ${styles.section}`} aria-labelledby="steps-heading">
      <div className={`${styles.steps} ${styles.bookingGuide}`}>
        <div className={styles.guideIntro}>
          <h2 id="steps-heading">{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <ol tabIndex={0} aria-labelledby="steps-heading" onScroll={({ currentTarget: list }) => {
          const first = list.firstElementChild;
          const second = first?.nextElementSibling;
          if (!first || !second) return;
          const stride = second.getBoundingClientRect().left - first.getBoundingClientRect().left;
          if (stride > 0) setActive(Math.min(steps.length - 1, Math.round(list.scrollLeft / stride)));
        }}>
          {steps.map(([heading, copy], index) => (
            <li key={`${index}-${heading}`} aria-current={index === active ? "step" : undefined}>
              <span aria-hidden="true">{index + 1}</span><div><strong>{heading}</strong><p>{copy}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
