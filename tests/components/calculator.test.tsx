import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CalculatorWidget from "@/components/CalculatorWidget";
import MobileBar from "@/components/MobileBar";
import ServiceActions from "@/components/ServiceActions";
import pt from "@/i18n/pt";
import { calcStrings, norm, renderWithQuote } from "./helpers";

function setup() {
  const user = userEvent.setup();
  const utils = renderWithQuote(
    <>
      <ServiceActions id="ecommerce" from={pt.services.from} perHour={pt.services.perHour} perMonth={pt.services.perMonth} simulate={pt.services.simulate} />
      <CalculatorWidget t={calcStrings()} />
      <MobileBar total={pt.calc.total} totalMonthly={pt.calc.totalMonthly} perMonth={pt.calc.perMonth} />
    </>,
  );
  const sum = utils.container.querySelector("aside.sum") as HTMLElement;
  const total = () => norm(sum.querySelector(".tot b")?.textContent);
  const bar = () => norm(utils.container.querySelector(".mbar b")?.textContent);
  const waText = () => decodeURIComponent((within(sum).getByRole("link", { name: /WhatsApp/ }) as HTMLAnchorElement).href.split("text=")[1]);
  return { user, sum, total, bar, waText, ...utils };
}

describe("calculadora", () => {
  it("abre com landing page e total base", () => {
    const { total, bar } = setup();
    expect(screen.getByRole("button", { name: /Landing page/ })).toHaveAttribute("aria-pressed", "true");
    expect(total()).toBe("R$ 1.800");
    expect(bar()).toBe("R$ 1.800");
  });

  it("fluxo completo: e-commerce, 50 produtos, SEO e urgência", async () => {
    const { user, total, bar, sum, waText } = setup();
    await user.click(screen.getByRole("button", { name: /E-commerce/ }));
    expect(total()).toBe("R$ 5.900");

    fireEvent.change(screen.getByLabelText("produtos"), { target: { value: "50" } });
    expect(total()).toBe("R$ 6.500");

    await user.click(screen.getByRole("button", { name: /SEO avançado/ }));
    await user.click(screen.getByRole("button", { name: /Entrega expressa/ }));
    expect(total()).toBe("R$ 9.230");
    expect(bar()).toBe("R$ 9.230");
    expect(screen.getByRole("button", { name: /SEO avançado/ })).toHaveAttribute("aria-pressed", "true");

    const lines = [...sum.querySelectorAll(".line")].map((l) => norm(l.textContent));
    expect(lines).toEqual([
      "Base · E-commerce (30 produtos)R$ 5.900",
      "+20 produtos adicionaisR$ 600",
      "SEO avançadoR$ 600",
      "Entrega expressa +30%R$ 2.130",
    ]);
    expect(norm(sum.querySelector(".meta b")?.textContent)).toBe("~16 dias úteis");
    expect(norm(waText())).toContain("• Estimativa: R$ 9.230 (BRL)");
    expect(norm(waText())).toContain("• Tamanho: 50 produtos");
  });

  it("botões − e + respeitam o passo e os limites", async () => {
    const { user, total } = setup();
    await user.click(screen.getByRole("button", { name: /E-commerce/ }));
    const [less, more] = screen.getAllByRole("button", { name: /Diminuir|Aumentar/ });
    await user.click(more);
    expect(total()).toBe("R$ 6.200");
    for (let i = 0; i < 5; i++) await user.click(less);
    expect(screen.getByLabelText("produtos")).toHaveValue("10");
  });

  it("idiomas extras: +20% cada, até 4", async () => {
    const { user, total } = setup();
    const box = document.querySelector(".langx") as HTMLElement;
    const more = within(box).getByRole("button", { name: "Aumentar" });
    await user.click(more);
    expect(total()).toBe("R$ 2.160");
    for (let i = 0; i < 6; i++) await user.click(more);
    expect(norm(box.querySelector(".stepper b")?.textContent)).toBe("4");
  });

  it("consultoria não tem extras e mostra o aviso", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /Consultoria/ }));
    expect(screen.getByText(pt.calc.none)).toBeInTheDocument();
    expect(document.querySelector(".langx")).toBeNull();
    expect(document.querySelectorAll(".xcard")).toHaveLength(0);
  });

  it("suporte é mensal: rótulo, sufixo e prazo mudam", async () => {
    const { user, sum, bar } = setup();
    await user.click(screen.getByRole("button", { name: "Suporte e backup" }));
    expect(norm(sum.querySelector(".tot small")?.textContent)).toBe("Investimento mensal*");
    expect(norm(sum.querySelector(".tot b")?.textContent)).toBe("R$ 290/mês");
    expect(norm(sum.querySelector(".meta b")?.textContent)).toBe(pt.calc.start);
    expect(bar()).toBe("R$ 290/mês");
  });

  it("\"Simular\" do card seleciona o serviço na calculadora", async () => {
    const { user, total } = setup();
    expect(norm(document.querySelector(".price b")?.textContent)).toBe("R$ 5.900");
    await user.click(screen.getByRole("link", { name: /Simular/ }));
    expect(screen.getByRole("button", { name: /E-commerce/ })).toHaveAttribute("aria-pressed", "true");
    expect(total()).toBe("R$ 5.900");
  });

  it("mostra o aviso de valores fictícios e o asterisco no total", () => {
    const { sum } = setup();
    expect(within(sum).getByText(pt.calc.disc)).toBeInTheDocument();
    expect(norm(sum.querySelector(".tot small")?.textContent)).toMatch(/\*$/);
  });

  it("leitor de tela recebe só o valor final", () => {
    const { sum } = setup();
    const live = sum.querySelector('[aria-live="polite"].sr-only');
    expect(norm(live?.textContent)).toBe("Investimento estimado: R$ 1.800");
  });
});
