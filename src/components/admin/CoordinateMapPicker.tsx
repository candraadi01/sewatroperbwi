"use client";

import { useEffect, useRef } from "react";
import { MapPin, Compass } from "lucide-react";
import { BANYUWANGI_PRESET_COORDS } from "@/lib/utils/destinations";
import "leaflet/dist/leaflet.css";

interface CoordinateMapPickerProps {
  latitude: string;
  longitude: string;
  locationLabel: string;
  onChange: (coords: { lat: string; lng: string; label: string }) => void;
}

export function CoordinateMapPicker({
  latitude,
  longitude,
  locationLabel,
  onChange,
}: CoordinateMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);

  const parsedLat = Number(latitude);
  const parsedLng = Number(longitude);
  const currentLat = Number.isFinite(parsedLat) && latitude !== "" ? parsedLat : -8.2192;
  const currentLng = Number.isFinite(parsedLng) && longitude !== "" ? parsedLng : 114.3692;

  const onChangeRef = useRef(onChange);
  const labelRef = useRef(locationLabel);
  const initialCoordsRef = useRef({ lat: currentLat, lng: currentLng });

  useEffect(() => {
    onChangeRef.current = onChange;
    labelRef.current = locationLabel;
  }, [onChange, locationLabel]);

  useEffect(() => {
    let isMounted = true;
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const { lat: initLat, lng: initLng } = initialCoordsRef.current;

    async function initMap() {
      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [initLat, initLng],
        zoom: 10,
        zoomControl: true,
      });

      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        attribution: "&copy; Google Maps",
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "custom-trooper-pin-picker",
        html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:#f4bd42;border:3px solid #192127;box-shadow:0 4px 12px rgba(0,0,0,0.35);font-size:16px;">🚙</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([initLat, initLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChangeRef.current({
          lat: pos.lat.toFixed(6),
          lng: pos.lng.toFixed(6),
          label: labelRef.current,
        });
      });

      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current({
          lat: e.latlng.lat.toFixed(6),
          lng: e.latlng.lng.toFixed(6),
          label: labelRef.current,
        });
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Sync marker position when inputs or presets change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && Number.isFinite(currentLat) && Number.isFinite(currentLng)) {
      markerRef.current.setLatLng([currentLat, currentLng]);
      mapInstanceRef.current.setView([currentLat, currentLng], mapInstanceRef.current.getZoom(), {
        animate: true,
      });
    }
  }, [currentLat, currentLng]);

  function handlePresetClick(preset: (typeof BANYUWANGI_PRESET_COORDS)[number]) {
    onChange({
      lat: String(preset.lat),
      lng: String(preset.lng),
      label: preset.label,
    });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([preset.lat, preset.lng], 12, { animate: true });
    }
  }

  return (
    <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-[#f8fafc] dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={14} className="text-[#8a510b]" />
            <span>Titik Koordinat Lokasi Armada di Peta Banyuwangi</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Pilih wilayah preset atau klik/geser pin mobil di Google Maps agar armada ini tampil di lokasi yang tepat pada Katalog Buyer.
          </p>
        </div>
      </div>

      {/* Preset Lokasi Banyuwangi */}
      <div className="flex flex-wrap gap-1.5">
        {BANYUWANGI_PRESET_COORDS.map((preset) => {
          const isSelected =
            Math.abs(currentLat - preset.lat) < 0.005 && Math.abs(currentLng - preset.lng) < 0.005;
          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                isSelected
                  ? "bg-[#f4bd42] border-[#8a510b] text-[#192127] shadow-2xs"
                  : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 hover:bg-[#faefd9]"
              }`}
            >
              <Compass size={11} />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Google Maps Picker */}
      <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-300 dark:border-neutral-700 shadow-inner z-10">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Inputs: Label, Latitude, Longitude */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-neutral-300">
            Label Lokasi Peta
          </label>
          <input
            type="text"
            value={locationLabel}
            onChange={(e) =>
              onChange({
                lat: latitude,
                lng: longitude,
                label: e.target.value,
              })
            }
            placeholder="Contoh: TN Baluran / Kawah Ijen"
            className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691]"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-neutral-300">
            Latitude
          </label>
          <input
            type="text"
            value={latitude}
            onChange={(e) =>
              onChange({
                lat: e.target.value,
                lng: longitude,
                label: locationLabel,
              })
            }
            placeholder="-8.0583"
            className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691]"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-neutral-300">
            Longitude
          </label>
          <input
            type="text"
            value={longitude}
            onChange={(e) =>
              onChange({
                lat: latitude,
                lng: e.target.value,
                label: locationLabel,
              })
            }
            placeholder="114.2425"
            className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691]"
          />
        </div>
      </div>
    </div>
  );
}

