# ADR-0003 — Uma rota por idioma, dois root layouts e `global-not-found`

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
Cada idioma precisa de `<html lang>` correto, metadados traduzidos e URL própria para o Google
(hreflang). Um root layout acima de `[lang]` não recebe o parâmetro do idioma.

## Decisão
- `src/app/[lang]/layout.tsx` é o root layout das páginas de idioma (renderiza `<html lang>`).
- `src/app/(root)/` tem o próprio root layout só para `/`, que escolhe o idioma e redireciona
  (script inline + `<meta refresh>` sem JS).
- A 404 usa `src/app/global-not-found.tsx` (flag `experimental.globalNotFound`), pois não existe
  um layout único acima de tudo.

## Consequências
- HTML correto por idioma, sem JavaScript para trocar `lang`.
- Depende de um recurso experimental do Next para a 404; revisar ao atualizar o Next.
- Trocar de idioma recarrega a página (simples e garante `lang` e metadados certos).

## Alternativas consideradas
- **Idioma só no cliente (uma URL)** — ruim para SEO e para compartilhar links.
- **Subdomínios por idioma** — mais DNS e configuração sem ganho.
