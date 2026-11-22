"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { TrooperBrand } from "./TrooperBrand";
import styles from "@/components/landing/cinematic.module.css";

const copy = {
  id: ["Jelajahi Banyuwangi bersama Jeep Trooper dan driver lokal.", "Jelajahi", "Kontak", "Syarat & Ketentuan", "Privasi", "Pertanyaan umum"],
  en: ["Explore Banyuwangi in a Jeep Trooper with a local driver.", "Explore", "Contact", "Terms & Conditions", "Privacy", "FAQ"],
  zh: ["搭乘越野吉普，与当地司机一起探索外南梦。", "探索", "联系方式", "条款与条件", "隐私政策", "常见问题"],
  fr: ["Explorez Banyuwangi en Jeep Trooper avec un chauffeur local.", "Explorer", "Contact", "Conditions générales", "Confidentialité", "FAQ"],
  de: ["Entdecken Sie Banyuwangi im Jeep Trooper mit einem lokalen Fahrer.", "Entdecken", "Kontakt", "Nutzungsbedingungen", "Datenschutz", "Häufige Fragen"],
  it: ["Esplora Banyuwangi in Jeep Trooper con un autista locale.", "Esplora", "Contatti", "Termini e condizioni", "Privacy", "Domande frequenti"],
  ms: ["Terokai Banyuwangi dengan Jeep Trooper dan pemandu tempatan.", "Terokai", "Hubungi kami", "Terma dan Syarat", "Privasi", "Soalan lazim"],
  pt: ["Explore Banyuwangi num Jeep Trooper com um motorista local.", "Explorar", "Contacto", "Termos e condições", "Privacidade", "Perguntas frequentes"],
  ru: ["Исследуйте Баньюванги на Jeep Trooper с местным водителем.", "Маршруты", "Контакты", "Условия использования", "Конфиденциальность", "Частые вопросы"],
  es: ["Explora Banyuwangi en Jeep Trooper con un conductor local.", "Explorar", "Contacto", "Términos y condiciones", "Privacidad", "Preguntas frecuentes"],
};

export function FooterContent({ address, email, phone, whatsapp, hours }: {
  address: string; email: string; phone: string; whatsapp: string | null; hours: string;
}) {
  const { language, t } = useLanguage();
  const [intro, explore, contact, terms, privacy, faq] = copy[language];
  const links = [["/sewa", "nav_tour"], ["/destinasi", "nav_destinations"], ["/#testimonial", "nav_testimonial"], ["/artikel", "nav_articles"]];

  return (
    <footer className={`${styles.landing} ${styles.darkBand} border-t border-white/10`}>
      <div className={`${styles.container} pb-20 pt-7 sm:pt-10`}>
        <div className="grid gap-6 border-b border-white/10 pb-6 sm:grid-cols-[1.2fr_.8fr_1fr] sm:gap-5 lg:gap-12">
          <div className="space-y-3">
            <Link href="/" className="inline-flex min-h-11 items-center"><TrooperBrand /></Link>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--mist)]">{intro}</p>
            {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-3 text-sm font-semibold hover:border-[var(--gold)] hover:text-[var(--gold)]">
              <MessageCircle size={16} aria-hidden="true" /> WhatsApp <ArrowUpRight size={14} aria-hidden="true" />
            </a>}
          </div>
          <nav aria-label={explore}>
            <h2 className="mb-2 font-bold text-white">{explore}</h2>
            <ul className="grid grid-cols-2 gap-x-2 text-sm text-[var(--mist)] sm:grid-cols-1">
              {links.map(([path, key]) => <li key={path}><Link className="inline-flex min-h-9 items-center hover:text-[var(--gold)]" href={path}>{t(key)}</Link></li>)}
            </ul>
          </nav>
          <div className="min-w-0">
            <h2 className="mb-3 font-bold text-white">{contact}</h2>
            <ul className="space-y-3 text-sm text-[var(--mist)] [&_svg]:mt-0.5 [&_svg]:shrink-0 [&_svg]:text-[var(--gold)] [&>li]:flex [&>li]:gap-2">
              {address && <li><MapPin size={16} aria-hidden="true" /><span>{address}</span></li>}
              {phone && <li><Phone size={16} aria-hidden="true" /><a className="hover:text-white" href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a></li>}
              {email && <li><Mail size={16} aria-hidden="true" /><a className="wrap-anywhere hover:text-white" href={`mailto:${email}`}>{email}</a></li>}
              {hours && <li><Clock size={16} aria-hidden="true" /><span>{hours}</span></li>}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-x-5 gap-y-2 pt-4 text-xs text-[var(--mist)]">
          <p>© {new Date().getFullYear()} Sewa Trooper Banyuwangi</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link className="hover:text-white" href="/syarat-ketentuan">{terms}</Link>
            <Link className="hover:text-white" href="/kebijakan-privasi">{privacy}</Link>
            <Link className="hover:text-white" href="/faq">{faq}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
