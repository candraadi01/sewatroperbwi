"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  message?: string;
}

export function FloatingWhatsApp({
  phoneNumber = "6285186815863",
  message = "Halo Sewa Trooper Banyuwangi, saya ingin tanya info paket sewa jeep dan ketersediaan unit.",
}: FloatingWhatsAppProps) {
  const [showTooltip, setShowTooltip] = useState(true);

  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Pop-up bubble */}
      {showTooltip && (
        <div className="mb-2 bg-white text-neutral-800 text-xs py-2 px-3.5 rounded-2xl shadow-xl border border-neutral-200 flex items-center gap-2 animate-bounce transition-all">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span className="font-medium">Butuh Bantuan Cepat? Chat WhatsApp kami</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowTooltip(false);
            }}
            className="text-neutral-400 hover:text-neutral-600 ml-1 p-0.5 rounded-full"
            aria-label="Tutup pesan"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp Admin Sewa Jeep"
        className="relative group flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
      >
        {/* Pulsing effect ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-ping -z-10" />

        {/* WhatsApp Icon */}
        <MessageCircle size={30} className="fill-current text-white" />

        {/* Hover Label */}
        <span className="absolute right-16 bg-neutral-900 text-white text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-none">
          Hubungi Admin Sekarang
        </span>
      </a>
    </div>
  );
}
