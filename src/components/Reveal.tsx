"use client";

import { useEffect } from "react";

/**
 * Revelação ao rolar: adiciona "js-rv" no <html> (só com JS — sem JS tudo fica visível)
 * e marca cada .rv com "on" quando entra na tela. Anima uma vez só.
 * Com prefers-reduced-motion o CSS já desliga as animações.
 */
export default function Reveal() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js-rv");
    const els = document.querySelectorAll<HTMLElement>(".rv:not(.on)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("on"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.add("on");
            io.unobserve(en.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
