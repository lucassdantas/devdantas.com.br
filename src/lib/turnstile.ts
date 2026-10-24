/* Cloudflare Turnstile no navegador.
   O script só é baixado quando o visitante vai usar o formulário de e-mail
   (foco no campo) — não pesa no carregamento da página nem no PageSpeed. */

export const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type RenderOptions = {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact";
  appearance?: "always" | "execute" | "interaction-only";
  language?: string;
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
};

export type TurnstileApi = {
  render: (el: HTMLElement, opts: RenderOptions) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | null = null;

export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;
  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = TURNSTILE_SCRIPT;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile ausente")));
    s.onerror = () => {
      loading = null;
      reject(new Error("falha ao carregar o Turnstile"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** Idioma do widget (o Turnstile usa "pt-br" em vez de "pt"). */
export function turnstileLanguage(lang: string): string {
  return lang === "pt" ? "pt-br" : lang;
}
