"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Maximize2,
  Minimize2,
  X,
  MapPin,
  Mountain,
  TreePine,
  Waves,
  Car,
  ExternalLink,
  ArrowRight,
  Globe,
  Layers,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "@/components/ui";
import type { Product } from "@/types/database";
import { formatIDR } from "@/lib/utils/currency";
import { resolveProductCoordinates } from "@/lib/utils/destinations";
import "leaflet/dist/leaflet.css";

export interface MapDestination {
  id: string;
  name: string;
  district: string;
  category: string;
  queryKey: string;
  lat: number;
  lng: number;
}

export const BANYUWANGI_DESTINATIONS: MapDestination[] = [
  {
    id: "baluran",
    name: "TN Baluran",
    district: "Kecamatan Wongsorejo",
    category: "Taman Nasional & Savana",
    queryKey: "baluran",
    lat: -7.8389,
    lng: 114.3833,
  },
  {
    id: "ijen",
    name: "Kawah Ijen",
    district: "Kecamatan Licin",
    category: "Pegunungan & Kawah",
    queryKey: "ijen",
    lat: -8.0583,
    lng: 114.2425,
  },
  {
    id: "kota",
    name: "Kota Banyuwangi",
    district: "Banyuwangi Kota - Bandara",
    category: "Titik Kumpul / Meeting Point",
    queryKey: "kota",
    lat: -8.2192,
    lng: 114.3692,
  },
  {
    id: "djawatan",
    name: "Hutan De Djawatan",
    district: "Kecamatan Cluring",
    category: "Hutan & Alam Purba",
    queryKey: "djawatan",
    lat: -8.4167,
    lng: 114.2167,
  },
  {
    id: "sukamade",
    name: "Pantai Sukamade",
    district: "Kecamatan Pesanggaran",
    category: "Offroad 4x4 & Konservasi",
    queryKey: "sukamade",
    lat: -8.5333,
    lng: 113.8833,
  },
  {
    id: "purwo",
    name: "TN Alas Purwo",
    district: "Kecamatan Tegaldlimo",
    category: "Taman Nasional & Pantai",
    queryKey: "purwo",
    lat: -8.65,
    lng: 114.4333,
  },
];

interface PlottedProduct {
  product: Product;
  lat: number;
  lng: number;
  label: string;
  destinationKey: string;
}

interface BuyerDestinationMapProps {
  products?: Product[];
  selectedDestination: string;
  onSelectDestination: (key: string) => void;
  onClose: () => void;
}

export function BuyerDestinationMap({
  products = [],
  selectedDestination,
  onSelectDestination,
  onClose,
}: BuyerDestinationMapProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const tileLayerRef = useRef<import("leaflet").TileLayer | null>(null);
  const markersLayerRef = useRef<import("leaflet").LayerGroup | null>(null);

  // Hitung koordinat setiap produk Trooper dengan sedikit offset jika ada yang bertumpuk di titik yang sama
  const plottedProducts = useMemo<PlottedProduct[]>(() => {
    const coordCounts = new Map<string, number>();
    return products.map((product) => {
      const resolved = resolveProductCoordinates(product);
      const key = `${resolved.lat.toFixed(3)},${resolved.lng.toFixed(3)}`;
      const index = coordCounts.get(key) ?? 0;
      coordCounts.set(key, index + 1);

      let lat = resolved.lat;
      let lng = resolved.lng;
      if (index > 0) {
        const angle = (index * 137.5 * Math.PI) / 180;
        const radius = 0.015 + Math.floor(index / 6) * 0.012;
        lat += Math.sin(angle) * radius;
        lng += Math.cos(angle) * radius;
      }

      return {
        product,
        lat,
        lng,
        label: resolved.label,
        destinationKey: resolved.destinationKey,
      };
    });
  }, [products]);

  const activePlotted = useMemo(() => {
    if (selectedProductId) {
      return plottedProducts.find((p) => p.product.id === selectedProductId) || plottedProducts[0] || null;
    }
    return plottedProducts[0] || null;
  }, [plottedProducts, selectedProductId]);

  function getPinIcon(category: string) {
    if (category.includes("Pegunungan")) return <Mountain size={13} />;
    if (category.includes("Taman Nasional")) return <TreePine size={13} />;
    if (category.includes("Hutan")) return <TreePine size={13} />;
    if (category.includes("Titik")) return <Car size={13} />;
    return <Waves size={13} />;
  }

  // Initialize Leaflet Map with Google Maps Tiles
  useEffect(() => {
    let isMounted = true;
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    async function initMap() {
      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [-8.22, 114.23],
        zoom: 10,
        zoomControl: true,
      });

      const tileUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
      const tileLayer = L.tileLayer(tileUrl, {
        attribution: "&copy; Google Maps",
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      tileLayerRef.current = tileLayer;
      markersLayerRef.current = markersLayer;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Switch Roadmap / Satellite Google Maps Layer
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const lyrs = mapType === "satellite" ? "y" : "m";
    tileLayerRef.current.setUrl(`https://mt1.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}`);
  }, [mapType]);

  // Update Trooper Markers whenever products or selectedProductId changes
  useEffect(() => {
    let cancelled = false;
    async function renderMarkers() {
      const map = mapInstanceRef.current;
      const layer = markersLayerRef.current;
      if (!map || !layer) return;

      const L = (await import("leaflet")).default;
      if (cancelled) return;

      layer.clearLayers();

      plottedProducts.forEach((item) => {
        const isActive = activePlotted?.product.id === item.product.id;

        const iconHtml = `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:40px;cursor:pointer;">
            ${isActive ? '<span style="position:absolute;bottom:0;left:50%;transform:translate(-50%,50%);width:16px;height:8px;border-radius:50%;background:rgba(244,189,66,0.6);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>' : ""}
            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 4px 6px rgba(0,0,0,0.38));transform:${isActive ? "scale(1.25)" : "scale(1)"};transform-origin:bottom center;transition:transform 0.18s cubic-bezier(0.34,1.56,0.64,1);">
              <path d="M16 1C7.71573 1 1 7.71573 1 16C1 26.2 14.3 38.3 15.3 39.2C15.7 39.6 16.3 39.6 16.7 39.2C17.7 38.3 31 26.2 31 16C31 7.71573 24.2843 1 16 1Z" fill="#F4BD42" stroke="#192127" stroke-width="2.5" stroke-linejoin="round"/>
              <circle cx="16" cy="15" r="5.5" fill="#192127"/>
              <circle cx="17.5" cy="13.5" r="1.8" fill="#F4BD42"/>
            </svg>
          </div>
        `;

        const divIcon = L.divIcon({
          className: "trooper-map-marker",
          html: iconHtml,
          iconSize: [32, 40],
          iconAnchor: [16, 40],
        });

        const marker = L.marker([item.lat, item.lng], {
          icon: divIcon,
          zIndexOffset: isActive ? 500 : 100,
        });

        marker.on("click", () => {
          setSelectedProductId(item.product.id);
          map.setView([item.lat, item.lng], Math.max(map.getZoom(), 11), { animate: true });
        });

        marker.addTo(layer);
      });
    }

    renderMarkers();
    return () => {
      cancelled = true;
    };
  }, [plottedProducts, activePlotted]);

  // Pan map when user clicks destination filter pill
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (!selectedDestination) {
      map.setView([-8.22, 114.23], 10, { animate: true });
      return;
    }
    const dest = BANYUWANGI_DESTINATIONS.find((d) => d.queryKey === selectedDestination);
    if (dest) {
      map.setView([dest.lat, dest.lng], 12, { animate: true });
    }
  }, [selectedDestination]);

  // Invalidate map size when fullscreen toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  const activeProductUrl = activePlotted ? `/sewa/${activePlotted.product.slug}` : "/sewa";
  const activeGoogleMapsUrl = activePlotted
    ? `https://www.google.com/maps/search/?api=1&query=${activePlotted.lat},${activePlotted.lng}`
    : "https://www.google.com/maps/place/Banyuwangi,+Kabupaten+Banyuwangi,+Jawa+Timur";

  const activeImage =
    activePlotted?.product.images?.[0] || "/images/landing/tour-trooper-baluran-savana.jpg";

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#dbe0e4] bg-white overflow-hidden shadow-xs transition-all duration-300",
        isFullscreen && "fixed inset-4 z-50 shadow-2xl flex flex-col"
      )}
    >
      {/* Header Bar */}
      <div className="p-3 sm:p-4 border-b border-[#dbe0e4] flex items-center justify-between gap-3 bg-white">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f4bd42] animate-pulse shrink-0" />
            <h3 className="font-extrabold text-xs sm:text-base text-[#192127] flex items-center gap-1.5 truncate">
              <MapPin size={15} className="text-[#8a510b] shrink-0" />
              <span>Peta Sebaran Armada Trooper</span>
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-[#52606b] mt-0.5 hidden xs:block">
            Menampilkan <strong>{plottedProducts.length}</strong> armada Trooper di titik lokasi masing-masing.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setMapType((prev) => (prev === "roadmap" ? "satellite" : "roadmap"))}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#dbe0e4] bg-white hover:bg-[#faefd9] text-xs font-bold text-[#8a510b] transition cursor-pointer"
          >
            <Layers size={13} />
            <span>{mapType === "roadmap" ? "Mode Satelit" : "Mode Peta"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#dbe0e4] bg-white hover:bg-[#f6f6f3] text-xs font-bold text-[#192127] transition cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullscreen ? "Kecilkan" : "Tampilan Penuh"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 transition cursor-pointer"
            title="Tutup Peta"
          >
            <span>Tutup</span>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Quick Destination Filter Bar (Scrollable tanpa teks terpotong / shrink-0) */}
      <div className="px-3 py-2 bg-[#f8faf9] border-b border-[#dbe0e4] flex items-center gap-2 overflow-x-auto scroll-smooth no-scrollbar">
        <button
          type="button"
          onClick={() => {
            onSelectDestination("");
            setSelectedProductId(null);
          }}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border shrink-0",
            !selectedDestination
              ? "bg-[#f4bd42] border-[#f4bd42] text-[#151510] shadow-2xs"
              : "bg-white border-[#dbe0e4] text-[#52606b] hover:bg-[#faefd9] hover:text-[#8a510b]"
          )}
        >
          <Globe size={13} className="shrink-0" />
          <span>Seluruh Banyuwangi</span>
        </button>

        {BANYUWANGI_DESTINATIONS.map((dest) => {
          const isCurrent = selectedDestination === dest.queryKey;
          return (
            <button
              key={dest.id}
              type="button"
              onClick={() => {
                onSelectDestination(dest.queryKey);
                setSelectedProductId(null);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border shrink-0",
                isCurrent
                  ? "bg-[#f4bd42] border-[#f4bd42] text-[#151510] shadow-2xs"
                  : "bg-white border-[#dbe0e4] text-[#52606b] hover:bg-[#faefd9] hover:text-[#8a510b]"
              )}
            >
              {getPinIcon(dest.category)}
              <span>{dest.name}</span>
            </button>
          );
        })}
      </div>

      {/* Google Maps Canvas with Multiple Trooper Pins */}
      <div
        className={cn(
          "relative w-full bg-[#e8f1f5] overflow-hidden",
          isFullscreen ? "flex-1 min-h-[450px]" : "h-[340px] sm:h-[440px] md:h-[480px]"
        )}
      >
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Active Trooper Product Card (Pojok Bawah Kiri, Responsif Mobile) */}
        {activePlotted && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:right-auto sm:left-3 sm:bottom-3 sm:w-[340px] z-[400] bg-white/95 backdrop-blur-md rounded-2xl border border-[#dbe0e4] p-3 sm:p-3.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex gap-2.5 sm:gap-3">
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 bg-neutral-200">
                <Image
                  src={activeImage}
                  alt={activePlotted.product.name}
                  fill
                  className="object-cover"
                  unoptimized={
                    activeImage.startsWith("https://") &&
                    !activeImage.startsWith("https://res.cloudinary.com/")
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#8a510b] bg-[#faefd9] px-2 py-0.5 rounded-md truncate">
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">{activePlotted.label}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProductId(null)}
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer shrink-0"
                    aria-label="Tutup kartu detail"
                  >
                    <X size={13} />
                  </button>
                </div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#192127] line-clamp-1 mt-1">
                  {activePlotted.product.name}
                </h4>
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-[#52606b] mt-0.5">
                  <span className="inline-flex items-center gap-0.5">
                    <Clock size={11} className="text-[#8a510b] shrink-0" />
                    <span>{activePlotted.product.duration_text || "12 Jam"}</span>
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-0.5">
                    <Users size={11} className="text-[#8a510b] shrink-0" />
                    <span>Max {activePlotted.product.passenger_capacity || 6} Org</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
              <div>
                <span className="block text-[9px] sm:text-[10px] text-[#52606b]">Mulai dari</span>
                <strong className="text-xs sm:text-sm font-black text-[#192127]">
                  {formatIDR(activePlotted.product.base_price || 750000)}
                </strong>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={activeGoogleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded-lg border border-[#dbe0e4] text-[10px] sm:text-[11px] font-bold text-[#8a510b] hover:bg-[#faefd9] flex items-center gap-1 transition"
                >
                  <span>Maps</span>
                  <ExternalLink size={10} />
                </a>
                <Link
                  href={activeProductUrl}
                  className="px-2.5 py-1 rounded-lg bg-[#f4bd42] hover:bg-[#ffd276] text-[#151510] font-extrabold text-[10px] sm:text-[11px] transition flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <span>Booking</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
