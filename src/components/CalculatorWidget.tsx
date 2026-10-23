"use client";

import { useState, type FormEvent } from "react";
import { REGIONS, RULES, SERVICE_IDS } from "@/config/pricing";
import { site } from "@/config/site";
import type { Dictionary } from "@/i18n";
import { roundTo } from "@/lib/calc";
import { formatMoney } from "@/lib/format";
import { ICONS } from "@/lib/icons";
import WaIcon, { CheckIcon, PathIcon } from "./Icons";
import { useDisplay, useQuote } from "./QuoteProvider";

export type CalculatorStrings = {
  calc: Dictionary["calc"];
  items: Dictionary["services"]["items"];
  ui: Pick<Dictionary["ui"], "less" | "more">;
};

function Total({ suffix }: { suffix: string }) {
  const { region } = useQuote();
  const { display, flip } = useDisplay();
  return <b className={flip ? "pa" : "pb"}>{formatMoney(display, region)}<span>{suffix}</span></b>;
}

type MailStatus = "idle" | "sending" | "sent" | "error";

function MailForm({ t }: { t: Dictionary["calc"] }) {
  const { lang, region, quote, message } = useQuote();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<MailStatus>("idle");

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get("_gotcha")) { setStatus("sent"); return; } // robô preencheu o campo invisível
    if (email.indexOf("@") < 1 || status === "sending") return;
    if (!site.formspreeId) {
      console.warn("NEXT_PUBLIC_FORMSPREE_ID não configurado");
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("https://formspree.io/f/" + encodeURIComponent(site.formspreeId), {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          _subject: site.quoteMailSubject + " · " + quote.service + " · " + formatMoney(quote.total, region),
          message,
          service: quote.service,
          units: quote.units,
          total: quote.total,
          monthly: quote.monthly,
          currency: REGIONS[region].currency,
          region,
          lang,
          _gotcha: "",
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return <div className="sent" role="status"><CheckIcon size={20} width={2.6} />{t.sent}</div>;
  }
  return (
    <>
      <form className="mail" onSubmit={send}>
        <label className="sr-only" htmlFor="email">{t.emailLabel}</label>
        <input id="email" name="email" type="email" required autoComplete="email" placeholder={t.emailPh} value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="hp" aria-hidden="true">
          <label htmlFor="company-website">Website</label>
          <input id="company-website" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
        <button type="submit" disabled={status === "sending"}>{status === "sending" ? t.sending : t.send}</button>
      </form>
      {status === "error" && <p className="mailerr" role="alert">{t.error}</p>}
    </>
  );
}

export default function CalculatorWidget({ t }: { t: CalculatorStrings }) {
  const { region, service, pick, setUnits, langs, setLangs, extras, toggleExtra, quote, waHref } = useQuote();
  const c = t.calc;
  const R = REGIONS[region];
  const fmt = (v: number) => formatMoney(v, region);
  const sv = quote.rule;
  const tx = t.items[service];
  const per = R.prices[service][1];

  const perLabel = sv.incl === 0
    ? fmt(per) + " " + c.perHour
    : "+" + fmt(per) + " " + c.per + (sv.step > 1 ? " (" + sv.step + ")" : "");
  const inclLabel = sv.incl ? sv.incl + " " + tx.unit + " " + c.incl : "";

  const extrasList = sv.extras.filter((k) => k !== "lang").map((k) => {
    let price: string;
    if (k === "urgency") price = "+" + Math.round(RULES.urgencyPct * 100) + "%";
    else if (k === "care") price = fmt(R.prices.care[0]) + c.perMonth;
    else price = "+" + fmt(R.extras[k as "seo" | "copy" | "cms" | "integrations"]);
    return { id: k as Exclude<typeof k, "lang">, price };
  });
  const noExtras = extrasList.length === 0 && !quote.allowLang;

  const headLabel = quote.isMonthly ? c.totalMonthly : c.total;
  const headSuffix = quote.isMonthly ? c.perMonth : "";

  return (
    <div className="calc">
      <div className="panel">
        <div className="step">
          <div className="stephead"><i>1</i>{c.s1}</div>
          <div className="chips">
            {SERVICE_IDS.map((id) => (
              <button key={id} type="button" className={id === service ? "chip on" : "chip"} aria-pressed={id === service} onClick={() => pick(id)}>
                <PathIcon d={ICONS[id]} size={22} />{t.items[id].name}
              </button>
            ))}
          </div>
        </div>

        <div className="step">
          <div className="stephead"><i>2</i>{c.s2}</div>
          <div className="range">
            <div className="rangetop">
              <b>{quote.units}<span>{tx.unit}</span></b>
              <div className="stepper">
                <button className="sbtn" type="button" aria-label={t.ui.less} onClick={() => setUnits(Math.max(sv.min, quote.units - sv.step))}>−</button>
                <button className="sbtn" type="button" aria-label={t.ui.more} onClick={() => setUnits(Math.min(sv.max, quote.units + sv.step))}>+</button>
              </div>
            </div>
            <label className="sr-only" htmlFor="units">{tx.unit}</label>
            <input id="units" type="range" min={sv.min} max={sv.max} step={sv.step} value={quote.units} onChange={(e) => setUnits(Number(e.target.value))} />
            <div className="rangetop"><small>{inclLabel}</small><small>{perLabel}</small></div>
          </div>
        </div>

        <div className="step">
          <div className="stephead"><i>3</i>{c.s3}</div>
          {noExtras && <div className="empty">{c.none}</div>}
          <div className="xgrid">
            {quote.allowLang && (
              <div className="langx">
                <div><b>{c.x.lang.t}</b><small>{c.x.lang.d} · +{Math.round(RULES.langExtraPct * 100)}%</small></div>
                <div className="stepper">
                  <button className="sbtn" type="button" aria-label={t.ui.less} onClick={() => setLangs(langs - 1)}>−</button>
                  <b style={{ minWidth: 28, textAlign: "center", fontSize: 20 }} aria-live="polite">{quote.langs}</b>
                  <button className="sbtn" type="button" aria-label={t.ui.more} onClick={() => setLangs(langs + 1)}>+</button>
                </div>
              </div>
            )}
            {extrasList.map((x) => {
              const on = !!extras[x.id];
              return (
                <button key={x.id} type="button" className={on ? "xcard on" : "xcard"} aria-pressed={on} onClick={() => toggleExtra(x.id)}>
                  <span className="box"><CheckIcon size={14} width={3.4} /></span>
                  <span><b>{c.x[x.id].t}</b><small>{c.x[x.id].d}</small></span>
                  <em>{x.price}</em>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="sum">
        <div className="sumtop"><b>{c.summary}</b><span className="reg">{c.region} {R.currency}</span></div>
        <div className="tot">
          <small>{headLabel}*</small>
          <Total suffix={headSuffix} />
        </div>
        {/* Leitores de tela ouvem só o valor final, não cada passo da contagem. */}
        <p className="sr-only" aria-live="polite">{headLabel}: {fmt(quote.total)}{headSuffix}</p>
        {quote.monthly > 0 && (
          <div className="mline"><span>+ {c.monthly}</span><span>{fmt(quote.monthly)}{c.perMonth}</span></div>
        )}
        <div className="lines">
          {quote.lines.map((l) => <div className="line" key={l.label}><span>{l.label}</span><b>{fmt(roundTo(l.value))}</b></div>)}
        </div>
        <div className="meta">
          <div><small>{c.delivery}</small><b>{quote.isMonthly ? c.start : "~" + quote.days + " " + c.days}</b></div>
          <div><small>{c.service}</small><b>{tx.name}</b></div>
        </div>
        <div className="paynote"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2"></rect><path d="M3 10h18"></path></svg><span>{c.pay[R.pay]}</span></div>
        <a className="btn btn-wa" href={waHref} target="_blank" rel="noopener noreferrer"><WaIcon />{c.wa}</a>
        <div className="or">{c.or}</div>
        <MailForm t={c} />
        <p className="disc">{c.disc}</p>
      </aside>
    </div>
  );
}
