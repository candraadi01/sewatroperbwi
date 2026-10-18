"use client";

import { useLanguage } from "@/lib/i18n/context";

export function WhyChooseUs() {
  const { t } = useLanguage();

  const features = [
    {
      title: t("feat_local_title"),
      description: t("feat_local_desc"),
      // Driver cartoon SVG matching Foto 1
      icon: (
        <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Driver head & hair */}
          <circle cx="40" cy="30" r="14" fill="#fed7aa" />
          <path d="M26 26c1-9 10-14 18-12 5 1 9 6 10 11-3-2-8-3-13-2-5 1-11 1-15 3z" fill="#1e293b" />
          {/* Eyes & smile */}
          <circle cx="35" cy="30" r="1.8" fill="#1e293b" />
          <circle cx="45" cy="30" r="1.8" fill="#1e293b" />
          <path d="M37 35c1.5 2 4.5 2 6 0" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
          {/* Clothes */}
          <path d="M22 62c0-10 8-16 18-16s18 6 18 16v4H22v-4z" fill="#f43f5e" />
          <path d="M35 46h10v18H35z" fill="#ffffff" />
          {/* Steering wheel */}
          <circle cx="40" cy="62" r="13" stroke="#0f172a" strokeWidth="4" />
          <path d="M27 62h26M40 62v13" stroke="#0f172a" strokeWidth="3" />
        </svg>
      ),
    },
    {
      title: t("feat_vehicle_title"),
      description: t("feat_vehicle_desc"),
      // Red 4x4 Jeep illustration matching Foto 1
      icon: (
        <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Roof rack */}
          <path d="M28 22h24M31 22v4M49 22v4" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          {/* Jeep body */}
          <rect x="22" y="26" width="36" height="24" rx="4" fill="#ef4444" />
          {/* Windshield */}
          <rect x="27" y="29" width="26" height="11" rx="2" fill="#bae6fd" />
          {/* Grille */}
          <rect x="33" y="42" width="14" height="6" rx="1" fill="#f8fafc" />
          <path d="M36 42v6M40 42v6M44 42v6" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Headlights */}
          <circle cx="28" cy="45" r="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="52" cy="45" r="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          {/* Bumper */}
          <rect x="18" y="50" width="44" height="5" rx="2" fill="#1e293b" />
          {/* Tires */}
          <rect x="16" y="53" width="8" height="12" rx="3" fill="#0f172a" />
          <rect x="56" y="53" width="8" height="12" rx="3" fill="#0f172a" />
        </svg>
      ),
    },
    {
      title: t("feat_service_title"),
      description: t("feat_service_desc"),
      // Customer Service Agent with Headset matching Foto 1
      icon: (
        <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Head & hair */}
          <circle cx="40" cy="32" r="13" fill="#fed7aa" />
          <path d="M28 28c1-8 9-13 18-11 5 1 8 5 9 10-3-2-7-3-12-2-6 1-10 1-15 3z" fill="#1e293b" />
          {/* Face */}
          <circle cx="36" cy="32" r="1.8" fill="#1e293b" />
          <circle cx="44" cy="32" r="1.8" fill="#1e293b" />
          <path d="M37 37c1.5 2 4.5 2 6 0" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
          {/* Headset */}
          <path d="M26 31c0-9 6-15 14-15s14 6 14 15" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
          <rect x="23" y="28" width="4" height="8" rx="2" fill="#2563eb" />
          <path d="M25 36c0 6 5 8 11 8" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="38" cy="44" r="2.5" fill="#1d4ed8" />
          {/* Shirt */}
          <path d="M22 62c0-9 8-15 18-15s18 6 18 15v4H22v-4z" fill="#2563eb" />
          <path d="M37 47l3 5 3-5" fill="#ffffff" />
        </svg>
      ),
    },
    {
      title: t("feat_flexible_title"),
      description: t("feat_flexible_desc"),
      // Calendar & Clock Gear illustration matching Foto 1
      icon: (
        <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Calendar */}
          <rect x="20" y="24" width="32" height="34" rx="4" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
          <path d="M20 34h32" stroke="#0f172a" strokeWidth="2" />
          {/* Calendar rings */}
          <path d="M28 19v8M44 19v8" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          {/* Calendar dates dots */}
          <circle cx="28" cy="41" r="1.8" fill="#0f172a" />
          <circle cx="36" cy="41" r="1.8" fill="#0f172a" />
          <circle cx="44" cy="41" r="1.8" fill="#0f172a" />
          <circle cx="28" cy="48" r="1.8" fill="#0f172a" />
          <circle cx="36" cy="48" r="1.8" fill="#0f172a" />
          {/* Clock Gear */}
          <circle cx="53" cy="53" r="11" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
          {/* Clock hands */}
          <path d="M53 53l-3-4M53 53h4" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Gear teeth */}
          <path d="M53 39v3M53 64v3M39 53h3M64 53h3" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-white py-12 md:py-16 border-b border-neutral-200 font-sans">
      <div className="container-app">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-5 rounded-2xl bg-neutral-50 hover:bg-white hover:shadow-lg transition-all duration-300 border border-neutral-200/80 group"
            >
              <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h2 className="text-base font-extrabold text-[#0284c7] mb-2 leading-tight">
                {f.title}
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
