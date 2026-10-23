"use client";

import { useEffect, useState } from "react";
import { site } from "@/config/site";

function now(): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: site.timeZone }).format(new Date());
  } catch {
    return "";
  }
}

/** Hora real de São Paulo/Rio, atualizada na virada de cada minuto. */
export default function Clock() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setTime(now());
      timer = setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);
  return <span suppressHydrationWarning>{site.city} · {time} {site.utcLabel}</span>;
}
