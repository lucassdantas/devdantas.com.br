"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DEFAULT_SERVICE, REGION_IDS, RULES, SERVICES, type ExtraId, type RegionId, type ServiceId } from "@/config/pricing";
import { site, type Locale } from "@/config/site";
import { calculateQuote, type ExtrasState, type Quote, type QuoteStrings } from "@/lib/calc";
import { buildQuoteMessage, waLink, type MessageStrings } from "@/lib/whatsapp";

/** Estado compartilhado entre nav (moeda), serviços (Simular), calculadora e barra mobile. */

export type ProviderStrings = QuoteStrings & MessageStrings;

type QuoteCtx = {
  lang: Locale;
  region: RegionId;
  setRegion: (r: RegionId) => void;
  service: ServiceId;
  pick: (id: ServiceId) => void;
  setUnits: (u: number) => void;
  langs: number;
  setLangs: (n: number) => void;
  extras: ExtrasState;
  toggleExtra: (k: Exclude<ExtraId, "lang">) => void;
  quote: Quote;
  message: string;
  waHref: string;
};

const Ctx = createContext<QuoteCtx | null>(null);
const DisplayCtx = createContext<{ display: number; flip: boolean }>({ display: 0, flip: false });

export const REGION_KEY = "ds-region";

function readStoredRegion(): RegionId | null {
  try {
    const v = localStorage.getItem(REGION_KEY);
    return v && (REGION_IDS as readonly string[]).includes(v) ? (v as RegionId) : null;
  } catch {
    return null;
  }
}

/** Contagem animada do total (650 ms, ease-out), como no design. */
function useCountUp(target: number) {
  const [display, setDisplay] = useState(target);
  const [flip, setFlip] = useState(false);
  const shown = useRef(target);
  const last = useRef(target);
  const raf = useRef(0);

  useEffect(() => {
    if (last.current === target) return;
    last.current = target;
    cancelAnimationFrame(raf.current);
    const from = shown.current;
    setFlip((f) => !f);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || from === target) {
      shown.current = target;
      setDisplay(target);
      return;
    }
    const t0 = performance.now(), dur = 650;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      shown.current = Math.round(from + (target - from) * e);
      setDisplay(shown.current);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [target]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { display, flip };
}

export default function QuoteProvider({ lang, strings, children }: { lang: Locale; strings: ProviderStrings; children: ReactNode }) {
  const [region, setRegionState] = useState<RegionId>(site.langToRegion[lang]);
  const [service, setService] = useState<ServiceId>(DEFAULT_SERVICE);
  const [units, setUnitsState] = useState<number>(SERVICES[DEFAULT_SERVICE].def);
  const [langs, setLangsState] = useState(0);
  const [extras, setExtras] = useState<ExtrasState>({});

  // Moeda escolhida antes (lida só depois da hidratação para não divergir do HTML estático).
  useEffect(() => {
    const stored = readStoredRegion();
    if (stored) setRegionState(stored);
  }, []);

  const setRegion = useCallback((r: RegionId) => {
    setRegionState(r);
    try { localStorage.setItem(REGION_KEY, r); } catch {}
  }, []);

  const pick = useCallback((id: ServiceId) => {
    setService(id);
    setUnitsState(SERVICES[id].def);
  }, []);

  const setUnits = useCallback((u: number) => {
    if (Number.isFinite(u)) setUnitsState(u);
  }, []);

  const setLangs = useCallback((n: number) => setLangsState(Math.min(RULES.langExtraMax, Math.max(0, n))), []);
  const toggleExtra = useCallback((k: Exclude<ExtraId, "lang">) => setExtras((e) => ({ ...e, [k]: !e[k] })), []);

  const quote = useMemo(() => calculateQuote(service, units, extras, langs, region, strings), [service, units, extras, langs, region, strings]);
  const message = useMemo(() => buildQuoteMessage(quote, region, strings), [quote, region, strings]);

  const value = useMemo<QuoteCtx>(
    () => ({ lang, region, setRegion, service, pick, setUnits, langs, setLangs, extras, toggleExtra, quote, message, waHref: waLink(message) }),
    [lang, region, setRegion, service, pick, setUnits, langs, setLangs, extras, toggleExtra, quote, message],
  );

  const display = useCountUp(quote.total);

  return (
    <Ctx.Provider value={value}>
      <DisplayCtx.Provider value={display}>{children}</DisplayCtx.Provider>
    </Ctx.Provider>
  );
}

export function useQuote(): QuoteCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useQuote fora do QuoteProvider");
  return c;
}

/** Valor exibido durante a contagem animada + flag que alterna a cada mudança (pulse). */
export function useDisplay() {
  return useContext(DisplayCtx);
}
