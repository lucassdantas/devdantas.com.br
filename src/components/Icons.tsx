/** Balão do WhatsApp (traço). `full` inclui o telefone dentro, como no hero e no botão flutuante. */
export default function WaIcon({ size = 20, full = false, stroke = "currentColor" }: { size?: number; full?: boolean; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 20.5l1.3-4A8.5 8.5 0 1 1 8 19.6z"></path>
      {full && <path d="M9 9.5c.3 2.2 2.3 4.3 4.6 4.8l1.2-1.2 1.9.9-.4 1.6c-3.6.4-7.6-3.4-7.3-7.1l1.6-.4.9 1.9z"></path>}
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
  );
}

export function CheckIcon({ size = 18, width = 2.4, className }: { size?: number; width?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
  );
}

export function ShieldIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={size > 20 ? 2.2 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"></path><path d="M8.5 12l2.5 2.5 4.5-5"></path></svg>
  );
}

export function PathIcon({ d, size = 24, width = 1.9 }: { d: string; size?: number; width?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d}></path></svg>
  );
}
