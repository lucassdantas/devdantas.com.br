# ADR-0011 — Ajustes intencionais em relação ao design

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
Regra: não "melhorar" o design. Algumas exigências do briefing (contraste AA, 360px sem rolagem,
alvos de 44px) e um erro de lógica obrigaram exceções mínimas.

## Decisão
| Ajuste | Motivo |
| ------ | ------ |
| Verde do WhatsApp `#128C4A → #11854A` | Branco sobre o verde original: 4,3:1 (abaixo do AA, 4,5:1) → 4,7:1 |
| Nomes da faixa de clientes com opacidade 0,88 no celular | Em 18px o texto não conta como "grande"; 0,75 dava 3,7:1 |
| Botão de WhatsApp do resumo pode quebrar linha ≤ 400px; `.calc` com `minmax(0,1fr)` | Em 360px o botão (sem quebra) criava 23px de rolagem horizontal |
| Botão de tema com área de toque de 48px (pseudo-elemento) e visual de 40px | Alvos ≥ 44px sem mudar o desenho |
| Idiomas extras só somam dias se o serviço aceita idiomas | No design, somavam dias mesmo em serviços sem idiomas |
| `aria-live` só com o valor final (região escondida) | Com `aria-live` no resumo inteiro, o leitor de tela leria cada passo da contagem |
| `color-scheme: dark` no tema escuro | As listas nativas dos `<select>` ficavam claras no modo escuro |
| FAQ com todas as respostas no HTML (`hidden`) | No design só a aberta existia; assim o Google lê todas |
| ✓ dos extras só aparece quando marcado | No tema escuro o ✓ desmarcado ficava visível (cor escura sobre fundo escuro) e parecia marcado |
| Campo de e-mail com `flex: none` no celular | Com o formulário em coluna, o `flex: 1` do design achatava o campo e cortava o texto |

## Consequências
Diferenças visuais imperceptíveis; ganhos de acessibilidade e correção. Todas estão comentadas no fim
do `globals.css` ou no componente.
