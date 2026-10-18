import React from "react";
import { Language } from "@/lib/i18n/translations";

export function FlagIcon({
  code,
  className = "w-6 h-4",
}: {
  code: Language;
  className?: string;
}) {
  const baseClasses = `inline-block rounded-xs overflow-hidden shadow-xs shrink-0 ${className}`;

  switch (code) {
    case "id":
      // Indonesia: Red top, White bottom
      return (
        <svg viewBox="0 0 640 480" className={baseClasses}>
          <g fillRule="evenodd" strokeWidth="1pt">
            <path fill="#e70011" d="M0 0h640v240H0z" />
            <path fill="#ffffff" d="M0 240h640v240H0z" />
          </g>
        </svg>
      );

    case "en":
      // United Kingdom: Union Jack
      return (
        <svg viewBox="0 0 640 480" className={baseClasses}>
          <path fill="#012169" d="M0 0h640v480H0z" />
          <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-179L0 64V0h75z" />
          <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-208-82L0 40V0l271 200h-55zM640 0v3L391 191l2-31L599 0h41zM0 480v-4l249-187-2 31L41 480H0z" />
          <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
          <path fill="#C8102E" d="M267 0v480h106V0H267zM0 187v106h640V187H0z" />
        </svg>
      );

    case "zh":
      // China: Red with 5 yellow stars
      return (
        <svg viewBox="0 0 640 480" className={baseClasses}>
          <path fill="#ee1c25" d="M0 0h640v480H0z" />
          {/* Big star */}
          <polygon
            fill="#ffff00"
            points="100,50 112,86 150,86 119,109 131,145 100,123 69,145 81,109 50,86 88,86"
          />
          {/* 4 small stars */}
          <polygon
            fill="#ffff00"
            points="200,40 204,52 216,52 206,60 210,72 200,64 190,72 194,60 184,52 196,52"
            transform="scale(0.8) translate(50, 10)"
          />
          <polygon
            fill="#ffff00"
            points="240,80 244,92 256,92 246,100 250,112 240,104 230,112 234,100 224,92 236,92"
            transform="scale(0.8) translate(50, 10)"
          />
          <polygon
            fill="#ffff00"
            points="240,140 244,152 256,152 246,160 250,172 240,164 230,172 234,160 224,152 236,152"
            transform="scale(0.8) translate(50, 10)"
          />
          <polygon
            fill="#ffff00"
            points="200,180 204,192 216,192 206,200 210,212 200,204 190,212 194,200 184,192 196,192"
            transform="scale(0.8) translate(50, 10)"
          />
        </svg>
      );

    case "fr":
      // France: Blue, White, Red vertical
      return (
        <svg viewBox="0 0 640 480" className={baseClasses}>
          <g fillRule="evenodd" strokeWidth="1pt">
            <path fill="#002654" d="M0 0h213.3v480H0z" />
            <path fill="#ffffff" d="M213.3 0h213.4v480H213.3z" />
            <path fill="#ce1126" d="M426.7 0H640v480H426.7z" />
          </g>
        </svg>
      );

    case "de":
      // Germany: Black, Red, Gold horizontal
      return (
        <svg viewBox="0 0 640 480" className={baseClasses}>
          <path fill="#000" d="M0 0h640v160H0z" />
          <path fill="#dd0000" d="M0 160h640v160H0z" />
          <path fill="#ffce00" d="M0 320h640v160H0z" />
        </svg>
      );

    case "it":
      // Italy: Green, White, Red vertical
      return (
        <svg viewBox="0 0 640 480" className={baseClasses}>
          <g fillRule="evenodd" strokeWidth="1pt">
            <path fill="#009246" d="M0 0h213.3v480H0z" />
            <path fill="#ffffff" d="M213.3 0h213.4v480H213.3z" />
            <path fill="#ce2b37" d="M426.7 0H640v480H426.7z" />
          </g>
        </svg>
      );

    case "ms":
      // Malaysia: Red/White stripes, blue canton, crescent & star
      return (
        <svg viewBox="0 0 640 480" className={baseClasses}>
          {/* 14 Stripes */}
          <path fill="#cc0000" d="M0 0h640v480H0z" />
          <path fill="#fff" d="M0 34.3h640v34.3H0zM0 102.9h640v34.3H0zM0 171.4h640v34.3H0zM0 240h640v34.3H0zM0 308.6h640v34.3H0zM0 377.1h640v34.3H0zM0 445.7h640v34.3H0z" />
          {/* Blue canton */}
          <path fill="#000066" d="M0 0h320v274.3H0z" />
          {/* Crescent & Star */}
          <circle cx="140" cy="137" r="75" fill="#ffcc00" />
          <circle cx="160" cy="137" r="65" fill="#000066" />
          <polygon
            fill="#ffcc00"
            points="200,137 206,120 220,128 217,112 233,115 224,101 240,97 228,87 242,77 227,73 236,60 220,64 223,48 209,58 205,42 196,55 186,41 184,57 170,49 174,65 158,62 168,75 152,79 166,89 154,99 170,103 162,117 177,113 175,129 188,120"
            transform="scale(0.7) translate(80, 55)"
          />
        </svg>
      );

    case "pt":
      // Portugal: Green & Red with shield
      return (
        <svg viewBox="0 0 640 480" className={baseClasses}>
          <path fill="#ff0000" d="M0 0h640v480H0z" />
          <path fill="#006600" d="M0 0h256v480H0z" />
          <circle cx="256" cy="240" r="80" fill="#ffff00" stroke="#000" strokeWidth="3" />
          <rect x="236" y="210" width="40" height="50" rx="8" fill="#fff" stroke="#ff0000" strokeWidth="4" />
        </svg>
      );

    case "ru":
      // Russia: White, Blue, Red horizontal
      return (
        <svg viewBox="0 0 640 480" className={baseClasses}>
          <path fill="#fff" d="M0 0h640v160H0z" />
          <path fill="#0039a6" d="M0 160h640v160H0z" />
          <path fill="#d52b1e" d="M0 320h640v160H0z" />
        </svg>
      );

    case "es":
      // Spain: Red, Yellow (double height), Red
      return (
        <svg viewBox="0 0 640 480" className={baseClasses}>
          <path fill="#aa151b" d="M0 0h640v120H0zM0 360h640v120H0z" />
          <path fill="#f1bf00" d="M0 120h640v240H0z" />
          {/* Coat of arms silhouette */}
          <rect x="120" y="190" width="50" height="60" rx="8" fill="#aa151b" stroke="#000" strokeWidth="2" />
        </svg>
      );

    default:
      return null;
  }
}
