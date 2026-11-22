import { getSiteSettings, whatsappLink } from "@/lib/services/settings";
import { FooterContent } from "./FooterContent";

export async function Footer() {
  const settings = await getSiteSettings();
  return <FooterContent address={settings.contact_address} email={settings.contact_email}
    phone={settings.contact_phone} whatsapp={whatsappLink(settings.contact_whatsapp, "")}
    hours={settings.office_hours} />;
}
