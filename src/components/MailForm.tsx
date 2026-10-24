"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { REGIONS } from "@/config/pricing";
import { site } from "@/config/site";
import type { Dictionary } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { loadTurnstile, turnstileLanguage, type TurnstileApi } from "@/lib/turnstile";
import { CheckIcon } from "./Icons";
import { useQuote } from "./QuoteProvider";

type MailStatus = "idle" | "sending" | "sent" | "error";
const TOKEN_TIMEOUT = 20_000;

/**
 * Turnstile invisível: só aparece um desafio se a Cloudflare desconfiar do visitante.
 * O script é carregado no primeiro foco/hover do formulário.
 */
function useTurnstile(lang: string) {
  const box = useRef<HTMLDivElement>(null);
  const api = useRef<TurnstileApi | null>(null);
  const widget = useRef<string | undefined>(undefined);
  const token = useRef<string | null>(null);
  const waiting = useRef<((t: string | null) => void)[]>([]);
  const started = useRef(false);
  const failed = useRef(false);

  const settle = (t: string | null) => {
    token.current = t;
    failed.current = t === null;
    waiting.current.splice(0).forEach((fn) => fn(t));
  };

  const warmUp = useCallback(() => {
    if (started.current || !box.current) return;
    started.current = true;
    loadTurnstile()
      .then((ts) => {
        if (!box.current) return;
        api.current = ts;
        widget.current = ts.render(box.current, {
          sitekey: site.turnstileSiteKey,
          theme: "dark",
          appearance: "interaction-only",
          size: matchMedia("(max-width: 400px)").matches ? "compact" : "flexible",
          language: turnstileLanguage(lang),
          callback: (t) => settle(t),
          "error-callback": () => settle(null),
          "expired-callback": () => { token.current = null; },
        });
      })
      .catch(() => {
        started.current = false;
        settle(null);
      });
  }, [lang]);

  const getToken = useCallback((): Promise<string | null> => {
    if (token.current) return Promise.resolve(token.current);
    return new Promise((resolve) => {
      waiting.current.push(resolve);
      // Se o widget já falhou (rede, bloqueio), tenta de novo em vez de esperar à toa.
      if (failed.current && api.current && widget.current) {
        failed.current = false;
        api.current.reset(widget.current);
      }
      warmUp();
      setTimeout(() => resolve(null), TOKEN_TIMEOUT);
    });
  }, [warmUp]);

  // Cada token vale para um envio só.
  const reset = useCallback(() => {
    token.current = null;
    if (api.current && widget.current) api.current.reset(widget.current);
  }, []);

  useEffect(() => () => {
    if (api.current && widget.current) api.current.remove(widget.current);
  }, []);

  return { box, warmUp, getToken, reset };
}

export default function MailForm({ t }: { t: Dictionary["calc"] }) {
  const { lang, region, quote, message } = useQuote();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<MailStatus>("idle");
  const ts = useTurnstile(lang);

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get("_gotcha")) { setStatus("sent"); return; } // robô preencheu o campo invisível
    if (email.indexOf("@") < 1 || status === "sending") return;
    setStatus("sending");
    const token = await ts.getToken();
    if (!token) { setStatus("error"); return; }
    try {
      const res = await fetch(site.quoteEndpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          subject: site.quoteMailSubject + " · " + quote.service + " · " + formatMoney(quote.total, region),
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
      ts.reset();
      setStatus("error");
    }
  };

  if (status === "sent") {
    return <div className="sent" role="status"><CheckIcon size={20} width={2.6} />{t.sent}</div>;
  }
  return (
    <>
      {/* Um item só no flex do resumo: o container do Turnstile não cria espaço extra. */}
      <div>
        <form className="mail" onSubmit={send} onPointerEnter={ts.warmUp} onFocus={ts.warmUp}>
          <label className="sr-only" htmlFor="email">{t.emailLabel}</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder={t.emailPh} value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="hp" aria-hidden="true">
            <label htmlFor="company-website">Website</label>
            <input id="company-website" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
          <button type="submit" disabled={status === "sending"}>{status === "sending" ? t.sending : t.send}</button>
        </form>
        <div className="ts" ref={ts.box}></div>
        {/* Aviso exigido pela LGPD/GDPR: o Turnstile processa dados do visitante (IP, navegador). */}
        <p className="disc tsnote">
          {t.captcha}{" "}
          <a href={t.captchaUrl} target="_blank" rel="noopener noreferrer">{t.captchaLink}</a>
        </p>
      </div>
      {status === "error" && <p className="mailerr" role="alert">{t.error}</p>}
    </>
  );
}
