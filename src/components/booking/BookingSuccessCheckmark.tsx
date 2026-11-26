"use client";

import { useEffect, useRef, useState } from "react";

export function BookingSuccessCheckmark({
  size = 56,
}: {
  size?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [popped, setPopped] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [stage, setStage] = useState<"center" | "flying" | "settled">("center");
  const [offset, setOffset] = useState({ dx: 0, dy: 0 });

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;

      // Respect user motion preferences
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setStage("settled");
        setDrawn(true);
        setMounted(true);
        return;
      }

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
      const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);

      setOffset({ dx, dy });
      setMounted(true);
      setPopped(true);
    });

    // Step 2: Draw the checkmark
    const tDraw = setTimeout(() => {
      if (active) setDrawn(true);
    }, 250);

    // Step 3: Fly from center back to card position
    const tFly = setTimeout(() => {
      if (active) setStage("flying");
    }, 1150);

    // Step 4: Settle into position in card
    const tSettle = setTimeout(() => {
      if (active) setStage("settled");
    }, 1850);

    return () => {
      active = false;
      clearTimeout(tDraw);
      clearTimeout(tFly);
      clearTimeout(tSettle);
    };
  }, []);

  const isCenter = stage === "center";
  const isFlying = stage === "flying";
  const isSettled = stage === "settled";

  // Calculate transform
  let transform = "none";
  let transition = "none";

  if (mounted && !isSettled) {
    if (isCenter) {
      const scale = popped ? 1.6 : 0.2;
      transform = `translate3d(${offset.dx}px, ${offset.dy}px, 0) scale(${scale})`;
      transition = "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 250ms ease";
    } else if (isFlying) {
      transform = "translate3d(0, 0, 0) scale(1)";
      transition = "transform 650ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 650ms ease";
    }
  }

  return (
    <>
      {/* Subtle backdrop overlay during center pop-up */}
      {mounted && isCenter && (
        <div
          className={`fixed inset-0 bg-slate-900/20 backdrop-blur-[1.5px] z-40 pointer-events-none transition-opacity duration-500 ${
            popped ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
      )}

      {/* Main Checkmark Container */}
      <div
        ref={containerRef}
        className={`relative inline-flex items-center justify-center ${
          !isSettled ? "z-50" : "z-10"
        }`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transform,
          transition,
          opacity: mounted ? 1 : 0,
        }}
      >
        {/* Glowing pulse ring in center stage */}
        {isCenter && popped && (
          <span
            className="absolute -inset-2 rounded-full bg-emerald-400 animate-ping opacity-30 pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Emerald Check Circle Badge */}
        <div
          className={`w-full h-full rounded-full bg-emerald-500 text-white flex items-center justify-center transition-shadow duration-500 ${
            isCenter
              ? "shadow-2xl shadow-emerald-500/50 ring-4 ring-emerald-300/50"
              : "shadow-md shadow-emerald-500/20"
          }`}
        >
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline
              points="20 6 9 17 4 12"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: drawn ? 0 : 24,
                transition: "stroke-dashoffset 400ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </svg>
        </div>

        {/* Center Popup Label Text */}
        {isCenter && popped && (
          <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none animate-in fade-in zoom-in-95 duration-300">
            <span className="text-xs sm:text-sm font-black text-slate-900 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200/90 inline-block">
              ✓ Booking Berhasil Diajukan!
            </span>
          </div>
        )}
      </div>
    </>
  );
}
