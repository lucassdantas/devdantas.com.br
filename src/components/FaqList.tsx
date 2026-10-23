"use client";

import { useState } from "react";

type Item = { q: string; a: string };

/** Acordeão: um item aberto por vez (o primeiro começa aberto, como no design). */
export default function FaqList({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq">
      {items.map((f, i) => {
        const isOpen = i === open;
        return (
          <div key={f.q} className={isOpen ? "qa open" : "qa"}>
            <button className="qbtn" type="button" id={"faq-q" + i} aria-expanded={isOpen} aria-controls={"faq-a" + i} onClick={() => setOpen(isOpen ? -1 : i)}>
              {f.q}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
            </button>
            <p className="ans" id={"faq-a" + i} role="region" aria-labelledby={"faq-q" + i} hidden={!isOpen}>{f.a}</p>
          </div>
        );
      })}
    </div>
  );
}
