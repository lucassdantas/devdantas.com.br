import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FaqList from "@/components/FaqList";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import ScanBox from "@/components/ScanBox";
import ServiceActions from "@/components/ServiceActions";
import pt from "@/i18n/pt";
import { norm, renderWithQuote } from "./helpers";

describe("FAQ", () => {
  it("um aberto por vez, com aria-expanded correto", async () => {
    const user = userEvent.setup();
    render(<FaqList items={pt.faq.items} />);
    const buttons = screen.getAllByRole("button");
    const state = () => buttons.map((b) => b.getAttribute("aria-expanded"));
    expect(state()).toEqual(["true", "false", "false", "false", "false", "false"]);
    expect(screen.getByText(pt.faq.items[0].a)).toBeVisible();

    await user.click(buttons[2]);
    expect(state()).toEqual(["false", "false", "true", "false", "false", "false"]);
    expect(screen.getByText(pt.faq.items[0].a)).not.toBeVisible();

    await user.click(buttons[2]);
    expect(state().every((s) => s === "false")).toBe(true);
  });

  it("respostas ficam no HTML (bom para SEO) e ligadas à pergunta", () => {
    render(<FaqList items={pt.faq.items} />);
    const btn = screen.getAllByRole("button")[3];
    const answer = document.getElementById(btn.getAttribute("aria-controls")!);
    expect(answer).toHaveTextContent(pt.faq.items[3].a);
    expect(answer).toHaveAttribute("aria-labelledby", btn.id);
  });
});

describe("checklist de segurança", () => {
  it("com movimento reduzido mostra tudo concluído, sem animação", () => {
    render(<ScanBox title={pt.security.scanTitle} items={pt.security.scan} done={pt.security.scanDone} scanning={pt.security.scanning} />);
    expect(screen.getByText("5/5")).toBeInTheDocument();
    expect(screen.getByText(pt.security.scanDone)).toBeInTheDocument();
    expect(document.querySelectorAll(".scanrow.done")).toHaveLength(5);
  });

  it("anima item a item e recomeça em loop", () => {
    vi.useFakeTimers();
    const mm = window.matchMedia;
    window.matchMedia = ((q: string) => ({ ...mm(q), matches: false })) as typeof window.matchMedia;
    render(<ScanBox title="t" items={pt.security.scan} done="ok" scanning="..." />);
    expect(document.querySelector(".scanrow.active")).toHaveTextContent(pt.security.scan[0]);
    act(() => { vi.advanceTimersByTime(850 * 2); });
    expect(screen.getByText("2/5")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(850 * 3); });
    expect(screen.getByText("ok")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(850 * 5); });
    expect(screen.getByText("0/5")).toBeInTheDocument();
    window.matchMedia = mm;
    vi.useRealTimers();
  });
});

describe("nav", () => {
  const t = { nav: pt.nav, ui: pt.ui };

  it("trocar a moeda atualiza os preços e fica salvo", async () => {
    const user = userEvent.setup();
    renderWithQuote(<><Nav t={t} /><ServiceActions id="landing" from="" perHour="" perMonth="" simulate="" /></>);
    expect(norm(document.querySelector(".price b")?.textContent)).toBe("R$ 1.800");
    await user.selectOptions(screen.getByLabelText(pt.ui.currency), "EU");
    expect(norm(document.querySelector(".price b")?.textContent)).toBe("750 €");
    expect(localStorage.getItem("ds-region")).toBe("EU");
  });

  it("moeda salva é restaurada ao abrir a página", () => {
    localStorage.setItem("ds-region", "UK");
    renderWithQuote(<ServiceActions id="landing" from="" perHour="" perMonth="" simulate="" />);
    expect(norm(document.querySelector(".price b")?.textContent)).toBe("£650");
  });

  it("botão de tema alterna a classe dark e salva", async () => {
    const user = userEvent.setup();
    renderWithQuote(<Nav t={t} />);
    await user.click(screen.getByRole("button", { name: pt.ui.theme }));
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("ds-theme")).toBe("dark");
    await user.click(screen.getByRole("button", { name: pt.ui.theme }));
    expect(localStorage.getItem("ds-theme")).toBe("light");
  });

  it("menu mobile abre e fecha ao escolher um link", async () => {
    const user = userEvent.setup();
    renderWithQuote(<Nav t={t} />);
    const burger = screen.getByRole("button", { name: pt.ui.menu });
    expect(burger).toHaveAttribute("aria-expanded", "false");
    await user.click(burger);
    expect(burger).toHaveAttribute("aria-expanded", "true");
    const menu = document.getElementById("mmenu")!;
    await user.click(menu.querySelector('a[href="#faq"]')!);
    expect(document.getElementById("mmenu")).toBeNull();
  });
});

describe("revelação ao rolar", () => {
  it("só esconde com JS e mostra quando entra na tela", () => {
    let cb: IntersectionObserverCallback = () => {};
    const observe = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(fn: IntersectionObserverCallback) { cb = fn; }
      observe = observe; unobserve = vi.fn(); disconnect = vi.fn();
    });
    render(<><div className="rv" data-testid="card" /><Reveal /></>);
    const card = screen.getByTestId("card");
    expect(document.documentElement).toHaveClass("js-rv");
    expect(observe).toHaveBeenCalledWith(card);
    expect(card).not.toHaveClass("on");
    act(() => cb([{ isIntersecting: true, target: card } as unknown as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(card).toHaveClass("on");
    vi.unstubAllGlobals();
  });
});
