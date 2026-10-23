import { waLink } from "@/lib/whatsapp";
import WaIcon from "./Icons";

/** Botão flutuante (escondido no celular, onde aparece a MobileBar). */
export default function WhatsAppFloat({ label, waText }: { label: string; waText: string }) {
  return (
    <a className="wa-float" href={waLink(waText)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
      <WaIcon size={24} full /><span>{label}</span>
    </a>
  );
}
