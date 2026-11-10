"use client";

export function WhyChooseUs() {
  return (
    <section className="bg-white py-12 sm:py-16 border-b border-[#e4ebef] font-sans overflow-hidden">
      <div className="container-app max-w-5xl mx-auto px-4 sm:px-6">
        {/* Simple & Calm Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <span className="inline-block px-3 py-1 bg-[#e9f3f7] text-[#327691] rounded-full text-xs font-bold uppercase tracking-wider mb-2.5">
            Layanan Wisata Privat
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#263b46] tracking-tight">
            Jelajahi Banyuwangi Bersama Isuzu Trooper
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#64748b] leading-relaxed">
            Kombinasi ketangguhan mobil offroad 4x4 dan kenyamanan perjalanan keluarga, dipandu sopir lokal yang ramah dan terpercaya.
          </p>
        </div>

        {/* Minimalist Animated Trooper Illustration */}
        <div className="relative max-w-2xl mx-auto my-4 sm:my-6 px-4 flex flex-col items-center select-none">
          <svg
            viewBox="0 0 540 180"
            className="w-full max-w-[500px] h-auto drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Headlight beam gradient */}
              <linearGradient id="headlight-beam" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
              </linearGradient>

              {/* Body gradient */}
              <linearGradient id="trooper-body" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3c86a3" />
                <stop offset="100%" stopColor="#2c6881" />
              </linearGradient>

              {/* Glass gradient */}
              <linearGradient id="glass-tint" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#bae6fd" />
              </linearGradient>

              <style>{`
                @keyframes suspension-bounce {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-2.5px); }
                }
                @keyframes wheel-rotate {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes road-run {
                  from { stroke-dashoffset: 0; }
                  to { stroke-dashoffset: -32; }
                }
                @keyframes dust-puff {
                  0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
                  50% { opacity: 0.5; }
                  100% { opacity: 0; transform: translate(-25px, -8px) scale(1.3); }
                }
                .anim-chassis {
                  animation: suspension-bounce 2.2s ease-in-out infinite;
                  transform-origin: center bottom;
                }
                .anim-wheel-f {
                  animation: wheel-rotate 1.6s linear infinite;
                  transform-origin: 395px 138px;
                }
                .anim-wheel-r {
                  animation: wheel-rotate 1.6s linear infinite;
                  transform-origin: 165px 138px;
                }
                .anim-road {
                  stroke-dasharray: 8 8;
                  animation: road-run 0.8s linear infinite;
                }
                .anim-dust-1 {
                  animation: dust-puff 1.6s ease-out infinite;
                  transform-origin: 120px 145px;
                }
                .anim-dust-2 {
                  animation: dust-puff 1.6s ease-out infinite 0.8s;
                  transform-origin: 110px 148px;
                }
              `}</style>
            </defs>

            {/* Headlight Projection */}
            <polygon points="460,118 535,108 535,150 460,132" fill="url(#headlight-beam)" />

            {/* Road Ground Line */}
            <line x1="20" y1="158" x2="520" y2="158" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="40" y1="158" x2="500" y2="158" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" className="anim-road" />

            {/* Dust Particles behind rear tire */}
            <circle cx="118" cy="146" r="5" fill="#cbd5e1" className="anim-dust-1" />
            <circle cx="106" cy="150" r="4" fill="#cbd5e1" className="anim-dust-2" />

            {/* Bouncing Vehicle Chassis & Body */}
            <g className="anim-chassis">
              {/* Roof Rack & Adventure Luggage */}
              <rect x="180" y="28" width="180" height="7" rx="2" fill="#334155" />
              <line x1="205" y1="35" x2="205" y2="44" stroke="#334155" strokeWidth="3" />
              <line x1="270" y1="35" x2="270" y2="44" stroke="#334155" strokeWidth="3" />
              <line x1="335" y1="35" x2="335" y2="44" stroke="#334155" strokeWidth="3" />
              {/* Roof cargo box */}
              <rect x="210" y="16" width="115" height="13" rx="4" fill="#475569" />
              <rect x="240" y="13" width="50" height="4" rx="1.5" fill="#327691" />

              {/* Spare Wheel Mounted at the Back */}
              <rect x="110" y="70" width="14" height="46" rx="6" fill="#1e293b" />
              <rect x="113" y="78" width="8" height="30" rx="3" fill="#64748b" />

              {/* Main Trooper Boxy Body */}
              {/* Lower body */}
              <path
                d="M 120 128 L 120 68 L 175 44 L 375 44 L 400 68 L 452 72 L 460 120 L 450 128 Z"
                fill="url(#trooper-body)"
                stroke="#1f4e61"
                strokeWidth="2"
              />

              {/* Front hood & bumper extension */}
              <path d="M 452 72 L 460 120 L 462 132 L 445 132" fill="#2c6881" />
              {/* Front Bullbar / Offroad Bumper */}
              <rect x="455" y="118" width="14" height="18" rx="3" fill="#0f172a" />
              <line x1="462" y1="108" x2="462" y2="120" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />

              {/* Windows Area (Classic Trooper 3-Window Profile) */}
              <path d="M 180 50 L 225 50 L 225 78 L 180 78 Z" fill="url(#glass-tint)" stroke="#1e293b" strokeWidth="2" />
              <path d="M 235 50 L 315 50 L 315 78 L 235 78 Z" fill="url(#glass-tint)" stroke="#1e293b" strokeWidth="2" />
              <path d="M 325 50 L 370 50 L 392 78 L 325 78 Z" fill="url(#glass-tint)" stroke="#1e293b" strokeWidth="2" />

              {/* Door Panel Lines */}
              <line x1="230" y1="50" x2="230" y2="126" stroke="#1f4e61" strokeWidth="2" />
              <line x1="320" y1="50" x2="320" y2="126" stroke="#1f4e61" strokeWidth="2" />

              {/* Door Handles */}
              <rect x="238" y="86" width="11" height="3.5" rx="1.5" fill="#0f172a" />
              <rect x="328" y="86" width="11" height="3.5" rx="1.5" fill="#0f172a" />

              {/* Headlight & Indicator */}
              <circle cx="454" cy="92" r="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
              <rect x="455" y="103" width="4" height="6" rx="1" fill="#f97316" />

              {/* Taillight */}
              <rect x="120" y="88" width="3" height="14" rx="1" fill="#ef4444" />

              {/* Side Body Trim & 4WD Badge */}
              <rect x="126" y="100" width="324" height="5" fill="#1e293b" opacity="0.6" />
              <text x="245" y="118" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="sans-serif" letterSpacing="2">
                TROOPER 4WD
              </text>

              {/* Snorkel on A-Pillar */}
              <path d="M 396 74 L 396 46 L 388 42" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />

              {/* Wheel Arches / Fenders */}
              <path d="M 135 132 A 32 32 0 0 1 195 132" stroke="#0f172a" strokeWidth="5" fill="none" />
              <path d="M 365 132 A 32 32 0 0 1 425 132" stroke="#0f172a" strokeWidth="5" fill="none" />
            </g>

            {/* Rear Rotating Offroad Wheel */}
            <g className="anim-wheel-r">
              <circle cx="165" cy="138" r="23" fill="#0f172a" stroke="#334155" strokeWidth="3" />
              <circle cx="165" cy="138" r="13" fill="#64748b" />
              <circle cx="165" cy="138" r="5" fill="#0f172a" />
              {/* Rim spokes */}
              <line x1="165" y1="126" x2="165" y2="150" stroke="#cbd5e1" strokeWidth="2.5" />
              <line x1="153" y1="138" x2="177" y2="138" stroke="#cbd5e1" strokeWidth="2.5" />
            </g>

            {/* Front Rotating Offroad Wheel */}
            <g className="anim-wheel-f">
              <circle cx="395" cy="138" r="23" fill="#0f172a" stroke="#334155" strokeWidth="3" />
              <circle cx="395" cy="138" r="13" fill="#64748b" />
              <circle cx="395" cy="138" r="5" fill="#0f172a" />
              {/* Rim spokes */}
              <line x1="395" y1="126" x2="395" y2="150" stroke="#cbd5e1" strokeWidth="2.5" />
              <line x1="383" y1="138" x2="407" y2="138" stroke="#cbd5e1" strokeWidth="2.5" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
