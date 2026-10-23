/* Caminhos SVG (viewBox 24×24) usados nos cards, chips e garantias — iguais ao design. */
import type { ServiceId } from "@/config/pricing";

export const ICONS: Record<ServiceId | "lock" | "clock" | "tag" | "heart", string> = {
  landing: "M4 4h16v16H4z M4 9h16 M8 13h8 M8 16.5h5",
  site: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M3 12h18 M12 3c3 3.5 3 14.5 0 18 M12 3c-3 3.5-3 14.5 0 18",
  ecommerce: "M5 8h14l-1.2 12H6.2z M9 8V6.5a3 3 0 0 1 6 0V8",
  system: "M3 5h18v11H3z M8 20h8 M12 16v4 M7 9l2 1.75L7 12.5 M11.5 12.5h4",
  design: "M12 3l9 5-9 5-9-5z M3 13l9 5 9-5",
  consulting: "M4 5h16v11H9l-5 4z M8 9h8 M8 12h5",
  security: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z M8.5 12l2.5 2.5 4.5-5",
  care: "M20 12a8 8 0 1 1-2.34-5.66 M20 4v5h-5",
  lock: "M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4",
  clock: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M12 7v5l3 2",
  tag: "M3 12V4h8l10 10-8 8z M7.5 8.5h.01",
  heart: "M12 20s-8-4.6-8-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 8 2.4C20 15.4 12 20 12 20z",
};

/** Ícones dos 3 cards de problema (lento, inseguro, não converte). */
export const PAIN_ICONS = ["M12 14l-4-4 M3.5 17a9 9 0 1 1 17 0", "M5 11h14v10H5z M8 11V7a4 4 0 0 1 7.6-1.7", "M9 4H5v16h4 M15 8l4 4-4 4 M19 12H9"];

/** Ícones das 4 garantias. */
export const GUARANTEE_ICONS = [ICONS.tag, ICONS.lock, ICONS.clock, ICONS.heart];
