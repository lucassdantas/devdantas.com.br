"use client";

import { useEffect, useState } from "react";
import { CheckIcon, ShieldIcon } from "./Icons";

type Props = { title: string; items: string[]; done: string; scanning: string };

/** Checklist do diagnóstico: item a item (spinner → check), barra + contador e selo final, em loop. */
export default function ScanBox({ title, items, done, scanning }: Props) {
  const [scan, setScan] = useState(0);
  const total = items.length;

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setScan(total);
      return;
    }
    // Mesmo ritmo do design: 850 ms por passo, pausa no fim e recomeça.
    const id = setInterval(() => setScan((s) => (s >= total + 4 ? 0 : s + 1)), 850);
    return () => clearInterval(id);
  }, [total]);

  return (
    <div className="scan rv" aria-hidden="true">
      <div className="scanhead">{title}<span className="mono">{Math.min(total, scan) + "/" + total}</span></div>
      <div className="prog"><i style={{ width: Math.min(100, (scan / total) * 100) + "%" }}></i></div>
      {items.map((label, i) => {
        const isDone = i < scan, active = i === scan;
        return (
          <div key={label} className={isDone ? "scanrow done" : active ? "scanrow active" : "scanrow"}>
            <span>{label}</span>
            <span className="st">
              {isDone && <CheckIcon className="ck" size={20} width={2.6} />}
              {active && <span className="spin"></span>}
              {!isDone && !active && <span className="idle"></span>}
            </span>
          </div>
        );
      })}
      {scan >= total
        ? <div className="ok"><ShieldIcon size={22} />{done}</div>
        : <div className="ok wait"><span className="spin"></span>{scanning}</div>}
    </div>
  );
}
