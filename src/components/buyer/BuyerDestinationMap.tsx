"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Maximize2,
  Minimize2,
  X,
  MapPin,
  Mountain,
  TreePine,
  Waves,
  Car,
  Compass,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/components/ui";

export interface MapDestination {
  id: string;
  name: string;
  district: string;
  category: string;
  description: string;
  highlights: string[];
  image: string;
  queryKey: string;
  coords: { x: number; y: number }; // Percentage on map canvas
  lat: number;
  lng: number;
}

export const BANYUWANGI_DESTINATIONS: MapDestination[] = [
  {
    id: "baluran",
    name: "Taman Nasional Baluran",
    district: "Kecamatan Wongsorejo",
    category: "Taman Nasional & Savana",
    description: "Africa Van Java di ujung utara Banyuwangi. Savana luas Bekol dan satwa liar banteng & rusa.",
    highlights: ["Savana Bekol", "Pantai Bama", "Safari 4x4"],
    image: "/images/landing/tour-baluran.jpg",
    queryKey: "baluran",
    coords: { x: 72, y: 16 },
    lat: -7.8389,
    lng: 114.3833,
  },
  {
    id: "ijen",
    name: "Kawah Ijen (Blue Fire)",
    district: "Kecamatan Licin",
    category: "Pegunungan & Kawah",
    description: "Kawah vulkanik megah dengan danau toska alami dan fenomena langka Blue Fire dunia.",
    highlights: ["Blue Fire Alami", "Danau Toska", "Sunrise Spektakuler"],
    image: "/images/landing/tour-kawah-ijen.jpg",
    queryKey: "ijen",
    coords: { x: 34, y: 34 },
    lat: -8.0583,
    lng: 114.2425,
  },
  {
    id: "kota",
    name: "Kota Banyuwangi & Bandara",
    district: "Banyuwangi Kota - Rogojampi",
    category: "Titik Kumpul / Meeting Point",
    description: "Pusat penjemputan armada Jeep Trooper dari hotel, stasiun, pelabuhan Ketapang, atau Bandara BWX.",
    highlights: ["Penjemputan Stasiun", "Bandara BWX", "Hotel Kota"],
    image: "/images/landing/tour-kawah-ijen.jpg",
    queryKey: "kota",
    coords: { x: 62, y: 46 },
    lat: -8.2192,
    lng: 114.3692,
  },
  {
    id: "djawatan",
    name: "Hutan De Djawatan",
    district: "Kecamatan Cluring",
    category: "Hutan & Alam Purba",
    description: "Hutan trembesi raksasa berkanopi magis bak latar film The Lord of the Rings.",
    highlights: ["Pohon Raksasa Purba", "Spot Foto Populer", "Wisata Keluarga"],
    image: "/images/landing/tour-djawatan.jpg",
    queryKey: "djawatan",
    coords: { x: 48, y: 64 },
    lat: -8.4167,
    lng: 114.2167,
  },
  {
    id: "sukamade",
    name: "Pantai Sukamade & TN Meru Betiri",
    district: "Kecamatan Pesanggaran",
    category: "Offroad 4x4 & Konservasi",
    description: "Jalur petualangan offroad 4x4 sejati melintasi sungai dan hutan lebat menuju habitat penyu bertelur.",
    highlights: ["Jalur Offroad Sungai", "Konservasi Penyu", "Hutan Tropis Asri"],
    image: "/images/landing/tour-sukamade.jpg",
    queryKey: "sukamade",
    coords: { x: 18, y: 80 },
    lat: -8.5333,
    lng: 113.8833,
  },
  {
    id: "purwo",
    name: "Taman Nasional Alas Purwo",
    district: "Kecamatan Tegaldlimo",
    category: "Taman Nasional & Pantai",
    description: "Semenanjung tertua dengan padang savana Sadengan, ombak legendaris G-Land, dan hutan asri.",
    highlights: ["Savana Sadengan", "Pantai Plengkung", "Hutan Bambu Purwo"],
    image: "/images/landing/tour-baluran.jpg",
    queryKey: "purwo",
    coords: { x: 80, y: 84 },
    lat: -8.65,
    lng: 114.4333,
  },
];

interface BuyerDestinationMapProps {
  selectedDestination: string;
  onSelectDestination: (key: string) => void;
  onClose: () => void;
}

export function BuyerDestinationMap({
  selectedDestination,
  onSelectDestination,
  onClose,
}: BuyerDestinationMapProps) {
  const [activePin, setActivePin] = useState<MapDestination | null>(() => {
    return (
      BANYUWANGI_DESTINATIONS.find((d) => d.queryKey === selectedDestination) ||
      BANYUWANGI_DESTINATIONS[1] // Default Ijen
    );
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  function getPinIcon(category: string) {
    if (category.includes("Pegunungan")) return <Mountain size={13} />;
    if (category.includes("Taman Nasional")) return <TreePine size={13} />;
    if (category.includes("Hutan")) return <TreePine size={13} />;
    if (category.includes("Titik")) return <Car size={13} />;
    return <Waves size={13} />;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs transition-all duration-300",
        isFullscreen && "fixed inset-4 z-50 shadow-2xl flex flex-col",
      )}
    >
      {/* Header Bar — Persis Format Foto Homestay */}
      <div className="p-3.5 sm:p-4 border-b border-[#e4ebef] dark:border-neutral-800 flex items-center justify-between gap-3 bg-white dark:bg-neutral-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#327691] animate-pulse" />
            <h3 className="font-extrabold text-sm sm:text-base text-[#263b46] dark:text-neutral-100 flex items-center gap-1.5">
              <MapPin size={16} className="text-[#327691] dark:text-[#8abbd0]" />
              Peta Sebaran Rute & Destinasi Jeep Trooper Banyuwangi
            </h3>
          </div>
          <p className="text-xs text-[#6e7f8a] dark:text-neutral-400 mt-0.5">
            Menampilkan rute destinasi populer. Klik pin marker untuk melihat info singkat dan memfilter armada.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d8e3e8] dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-[#f3f8fa] text-xs font-bold text-[#3d525e] dark:text-neutral-200 transition cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullscreen ? "Kecilkan" : "Tampilan Penuh"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer"
            title="Tutup Peta"
          >
            <span>Tutup</span>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Map Canvas with Relief Style & Pins */}
      <div
        className={cn(
          "relative w-full bg-[#e8f1f5] dark:bg-neutral-950 overflow-hidden select-none",
          isFullscreen ? "flex-1 min-h-[450px]" : "h-[360px] sm:h-[400px]",
        )}
      >
        {/* Stylized Terrain Map Grid / Texture Background */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* SVG Map of Banyuwangi Region (Topographic Graphic) */}
          <svg
            viewBox="0 0 1000 650"
            className="w-full h-full object-cover opacity-90 dark:opacity-40"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d5e6d6" />
                <stop offset="50%" stopColor="#e3ede3" />
                <stop offset="100%" stopColor="#cce2cd" />
              </linearGradient>
              <linearGradient id="seaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b9d9eb" />
                <stop offset="100%" stopColor="#9fcbe3" />
              </linearGradient>
            </defs>

            {/* Background Sea */}
            <rect width="1000" height="650" fill="url(#seaGrad)" />

            {/* Landmass Contour (Banyuwangi Shape representation) */}
            <path
              d="M 50,0 
                 C 250,20 600,10 750,70 
                 C 820,110 860,200 840,280 
                 C 820,350 830,420 860,490 
                 C 890,560 840,650 720,650 
                 C 550,650 400,640 250,650 
                 C 100,650 50,550 80,450 
                 C 110,350 70,200 50,0 Z"
              fill="url(#landGrad)"
              stroke="#b1cdb3"
              strokeWidth="2"
            />

            {/* Mountain Elevation Areas (Ijen Caldera) */}
            <path
              d="M 280,180 C 350,150 430,220 390,290 C 330,340 250,280 280,180 Z"
              fill="#c3dac1"
              opacity="0.8"
            />
            <circle cx="340" cy="220" r="45" fill="#a8c7a6" opacity="0.6" />

            {/* Forest Area (Meru Betiri / Sukamade) */}
            <path
              d="M 120,460 C 220,440 260,560 180,610 C 110,610 90,520 120,460 Z"
              fill="#b6d4b4"
              opacity="0.7"
            />

            {/* Peninsula (Alas Purwo) */}
            <path
              d="M 720,530 C 860,530 920,590 850,640 C 780,640 700,600 720,530 Z"
              fill="#bed9bc"
              opacity="0.75"
            />

            {/* Roads / Main Trooper 4x4 Corridors */}
            <path
              d="M 620,300 L 720,105"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              opacity="0.7"
            />
            <path
              d="M 620,300 L 340,220"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              opacity="0.7"
            />
            <path
              d="M 620,300 L 480,415"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              opacity="0.7"
            />
            <path
              d="M 480,415 L 180,520"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              opacity="0.7"
            />
            <path
              d="M 480,415 L 800,545"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              opacity="0.7"
            />

            {/* Geographic Labels */}
            <text x="320" y="160" fill="#4d6b4f" fontSize="13" fontWeight="bold">
              Gunung Ijen 2.769m
            </text>
            <text x="740" y="80" fill="#4d6b4f" fontSize="13" fontWeight="bold">
              Selat Bali / Wongsorejo
            </text>
            <text x="640" y="280" fill="#2d4e5f" fontSize="13" fontWeight="bold">
              Banyuwangi Kota
            </text>
            <text x="140" y="440" fill="#4d6b4f" fontSize="13" fontWeight="bold">
              TN Meru Betiri
            </text>
            <text x="760" y="515" fill="#4d6b4f" fontSize="13" fontWeight="bold">
              TN Alas Purwo
            </text>
            <text x="880" y="360" fill="#5b869e" fontSize="14" fontWeight="bold" letterSpacing="2">
              SELAT BALI
            </text>
            <text x="250" y="620" fill="#5b869e" fontSize="14" fontWeight="bold" letterSpacing="2">
              SAMUDERA HINDIA
            </text>
          </svg>

          {/* Interactive Marker Pins (Matches Homestay Foto [ 🏠 ] pins) */}
          {BANYUWANGI_DESTINATIONS.map((dest) => {
            const isCurrent = activePin?.id === dest.id;
            const isFilterActive = selectedDestination === dest.queryKey;

            return (
              <div
                key={dest.id}
                style={{
                  left: `${dest.coords.x}%`,
                  top: `${dest.coords.y}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                onClick={() => {
                  setActivePin(dest);
                  onSelectDestination(dest.queryKey);
                }}
              >
                {/* Marker Pin Circle */}
                <div className="relative flex items-center justify-center">
                  {/* Ping Animation on Selected */}
                  {(isCurrent || isFilterActive) && (
                    <span className="absolute w-10 h-10 rounded-full bg-[#327691]/40 animate-ping" />
                  )}

                  {/* Circular Button */}
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 border-2",
                      isCurrent || isFilterActive
                        ? "bg-[#327691] text-white border-white ring-2 ring-[#327691]"
                        : "bg-white text-[#327691] border-[#327691] hover:bg-[#e9f3f7]",
                    )}
                  >
                    {getPinIcon(dest.category)}
                  </div>

                  {/* Pin Label Tooltip */}
                  <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs text-[#263b46] dark:text-neutral-100 text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-md border border-[#e4ebef] dark:border-neutral-800 pointer-events-none">
                    {dest.name.split(" ")[0]} {dest.name.split(" ")[1] || ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Control Buttons (+ / - / Reset) */}
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xs p-1 rounded-xl border border-[#d8e3e8] dark:border-neutral-800 shadow-md">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.0))}
            className="w-7 h-7 flex items-center justify-center text-[#327691] hover:bg-[#e9f3f7] dark:hover:bg-neutral-800 rounded-lg text-sm font-bold transition cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <div className="h-px bg-neutral-200 dark:bg-neutral-700 mx-1" />
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.9))}
            className="w-7 h-7 flex items-center justify-center text-[#327691] hover:bg-[#e9f3f7] dark:hover:bg-neutral-800 rounded-lg text-sm font-bold transition cursor-pointer"
            title="Zoom Out"
          >
            −
          </button>
        </div>

        {/* Floating Active Info Card (Pojok Bawah Kanan) */}
        {activePin && (
          <div className="absolute bottom-3 right-3 left-3 sm:left-auto sm:w-80 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-2xl border border-[#d8e3e8] dark:border-neutral-800 p-3.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-neutral-200">
                <Image
                  src={activePin.image}
                  alt={activePin.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#327691] dark:text-[#8abbd0] truncate">
                    {activePin.district}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePin(null)}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  >
                    <X size={13} />
                  </button>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[#263b46] dark:text-neutral-100 truncate mt-0.5">
                  {activePin.name}
                </h4>
                <p className="text-[11px] text-[#6b7c87] dark:text-neutral-400 line-clamp-1 mt-0.5">
                  {activePin.description}
                </p>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold text-neutral-500">
                {activePin.highlights[0]} • {activePin.highlights[1]}
              </span>
              <button
                type="button"
                onClick={() => onSelectDestination(activePin.queryKey)}
                className="px-2.5 py-1 rounded-lg bg-[#327691] hover:bg-[#2c6881] text-white font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>Filter Armada</span>
                <ChevronRight size={11} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

