import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MailForm from "@/components/MailForm";
import pt from "@/i18n/pt";
import type { TurnstileApi } from "@/lib/turnstile";
import { renderWithQuote } from "./helpers";

/** Turnstile falso: entrega um token (ou erro) assim que é desenhado. */
function fakeTurnstile(mode: "ok" | "error" = "ok") {
  let fire = () => {};
  const api: TurnstileApi = {
    render: vi.fn((_el, opts) => {
      fire = () => queueMicrotask(() => (mode === "ok" ? opts.callback?.("tok-123") : opts["error-callback"]?.()));
      fire();
      return "w1";
    }),
    // como o real: reset gera um novo desafio (token ou erro)
    reset: vi.fn(() => fire()),
    remove: vi.fn(),
  };
  window.turnstile = api;
  return api;
}

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete window.turnstile;
});

async function fillAndSend(email = "cliente@exemplo.com") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(pt.calc.emailLabel), email);
  await user.click(screen.getByRole("button", { name: pt.calc.send }));
}

describe("envio por e-mail", () => {
  it("carrega o Turnstile só quando o visitante usa o formulário", async () => {
    const ts = fakeTurnstile();
    renderWithQuote(<MailForm t={pt.calc} />);
    expect(ts.render).not.toHaveBeenCalled();
    await userEvent.setup().click(screen.getByLabelText(pt.calc.emailLabel));
    await waitFor(() => expect(ts.render).toHaveBeenCalledTimes(1));
    expect(vi.mocked(ts.render).mock.calls[0][1]).toMatchObject({ appearance: "interaction-only", language: "pt-br", theme: "dark" });
  });

  it("envia para a nossa função com token e resumo, e mostra sucesso", async () => {
    fakeTurnstile();
    fetchMock.mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    renderWithQuote(<MailForm t={pt.calc} />);
    await fillAndSend();

    expect(await screen.findByRole("status")).toHaveTextContent(pt.calc.sent);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/orcamento");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ email: "cliente@exemplo.com", token: "tok-123", service: "landing", total: 1800, currency: "BRL", lang: "pt", _gotcha: "" });
    expect(body.message).toContain("Olá, Lucas!");
    expect(JSON.stringify(body)).not.toMatch(/formspree/i);
  });

  it("erro do servidor: mostra o alerta e gera um token novo", async () => {
    const ts = fakeTurnstile();
    fetchMock.mockResolvedValue(new Response("{}", { status: 502 }));
    renderWithQuote(<MailForm t={pt.calc} />);
    await fillAndSend();
    expect(await screen.findByRole("alert")).toHaveTextContent(pt.calc.error);
    expect(ts.reset).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: pt.calc.send })).toBeEnabled();
  });

  it("Turnstile falhou: não chama o servidor", async () => {
    fakeTurnstile("error");
    renderWithQuote(<MailForm t={pt.calc} />);
    await fillAndSend();
    // falha rápido (não espera os 20 s) e tenta um desafio novo
    expect(await screen.findByRole("alert", {}, { timeout: 1000 })).toBeInTheDocument();
    expect(window.turnstile!.reset).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("robô que preenche o campo invisível não envia nada", async () => {
    fakeTurnstile();
    const { container } = renderWithQuote(<MailForm t={pt.calc} />);
    (container.querySelector('input[name="_gotcha"]') as HTMLInputElement).value = "spam";
    await fillAndSend();
    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("e-mail inválido não é enviado", async () => {
    fakeTurnstile();
    renderWithQuote(<MailForm t={pt.calc} />);
    await fillAndSend("invalido");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("aviso do Turnstile", () => {
  it("mostra o aviso com o link da política de privacidade da Cloudflare", () => {
    renderWithQuote(<MailForm t={pt.calc} />);
    const link = screen.getByRole("link", { name: pt.calc.captchaLink });
    expect(link).toHaveAttribute("href", "https://www.cloudflare.com/pt-br/turnstile-privacy-policy/");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText(pt.calc.captcha, { exact: false })).toBeInTheDocument();
  });
});
