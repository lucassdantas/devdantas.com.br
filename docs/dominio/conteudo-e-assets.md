# Conteúdo e assets

Tudo é gerado por `npm run assets` (`scripts/generate-assets.mjs`) e **vai para o Git** — o build
não depende do script ([ADR-0010](../decisoes/0010-assets-gerados-por-script.md)).

| Saída                                   | Fonte                                                    |
| --------------------------------------- | -------------------------------------------------------- |
| `src/assets/projects/*.webp`            | `dantas-studio-handoff/assets/projects/*.jpg` (prints dos cases) |
| `public/lucas-400/800.avif` e `.webp`   | `dantas-studio-handoff/assets/lucas.jpg` (sua foto, se existir) |
| `public/favicon.svg`, `favicon.ico`, `icon-16/32/512.png`, `apple-touch-icon.png` | símbolo da marca (quadrado `#0B6CB5`, "d" branco, ponto `#5CB8F2`) |
| `public/og/og-<idioma>.png` (1200×630)  | wordmark + título do hero (`t1` + `t2`) + eyebrow de cada idioma |

Os textos dos ícones e das imagens OG viram **vetor** (via `opentype.js`, com as fontes reais da
marca), então o resultado não depende das fontes instaladas no computador.

## Foto do "Sobre"

1. Salve como `dantas-studio-handoff/assets/lucas.jpg` (ou `.png`/`.webp`).
2. `npm run assets` → gera 4 arquivos: 400 e 800 px, AVIF e WebP, no corte 4:5, sem metadados
   (GPS etc.). Uma foto de 2,5 MB vira ~23 KB (celular) e ~63 KB (desktop retina).
3. Em `src/config/site.ts`: `photo: "/lucas"`. `photoFocus` controla o ponto que fica sempre visível
   (no celular o quadro é horizontal; `"50% 30%"` mantém o rosto).
4. Sem foto (`photo: null`), aparecem as iniciais.

O navegador escolhe sozinho o menor arquivo que serve para a tela (`<picture>` + `srcset`) e só
baixa quando a seção está chegando (`loading="lazy"`).

## Novo case

1. Print em `dantas-studio-handoff/assets/projects/<nome>.jpg` (800 px de largura basta).
2. `npm run assets`.
3. Em `src/components/Work.tsx`, importe o `.webp` e adicione na lista `WORK` com uma chave nova.
4. Em cada `src/i18n/*.ts`, adicione `work.items.<chave>` com `tag`, `place` e `desc`.
5. Atualize o teste "todas as seções do design" (`tests/integration/static-site.test.ts`: são 4 cases hoje).

## Marcas da faixa e tecnologias

`site.clients` e `site.facts` em `src/config/site.ts`.
