"use client";

import { useEffect } from "react";

/** Spotlight que segue o mouse nos cards + fallback da barra de progresso da nav. */
export default function PageEffects() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest?.<HTMLElement>(".scard, .wcard");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    };
    document.addEventListener("pointermove", onMove, { passive: true });

    // Navegadores sem animation-timeline: atualiza a barra via JS.
    let onScroll: (() => void) | undefined;
    const nav = document.querySelector<HTMLElement>(".nav");
    if (nav && !CSS.supports("animation-timeline: scroll()")) {
      let raf = 0;
      onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const max = document.documentElement.scrollHeight - innerHeight;
          nav.style.setProperty("--sp", String(max > 0 ? Math.min(1, scrollY / max) : 0));
        });
      };
      onScroll();
      addEventListener("scroll", onScroll, { passive: true });
    }
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (onScroll) removeEventListener("scroll", onScroll);
    };
  }, []);
  return null;
}
