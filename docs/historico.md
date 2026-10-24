# Histórico

Linha do tempo das entregas. O detalhe de cada mudança está no `git log`; o porquê, em [decisoes/](decisoes/README.md).

## 2026-10-23

### 1. Primeira versão do site
- Design aprovado (`dantas-studio-handoff/`) portado para Next.js estático em 5 idiomas
  (ADR-0001, 0002, 0003, 0006).
- Calculadora como função pura com testes (ADR-0005); moeda independente do idioma (ADR-0004);
  estado com Context (ADR-0007).
- Favicon, ícones, imagens OG e WebP gerados por script (ADR-0010).
- Headers de segurança e CSP com hash por página (ADR-0008); deploy estático na Vercel (ADR-0009).
- Ajustes de contraste, 360px e prazo dos idiomas (ADR-0011).
- Lighthouse: 100 / 100 / 100 / 100 (celular e desktop).

### 2. SEO
- Títulos com palavra-chave separados do título de compartilhamento (ADR-0012).
- JSON-LD com WebSite, WebPage, ProfessionalService (8 serviços), Person e FAQPage; manifest.

### 3. Formulário por e-mail
- Formspree configurado direto do navegador (versão inicial).
- Trocado por **função na Vercel + Cloudflare Turnstile** para esconder o ID e barrar spam
  (ADR-0013), com o Turnstile carregado só ao usar o formulário (ADR-0014).
- ⚠️ O ID inicial do Formspree ficou no histórico do Git: criar um formulário novo se o repositório for público.

### 4. Testes, documentação e foto
- Quatro camadas de testes (~220 testes) + GitHub Actions (ADR-0015).
- Pasta `docs/` com arquitetura, domínios, operação e ADRs.
- `inlineCss` testado e rejeitado por piorar o PageSpeed (ADR-0016).
- Pipeline da foto do "Sobre" em AVIF/WebP responsivo (ADR-0017) — aguardando o arquivo da foto.

## Pendências

- [ ] Foto do Lucas em `dantas-studio-handoff/assets/lucas.jpg` → `npm run assets` → `site.photo = "/lucas"`.
- [ ] WhatsApp real, revisão de preços e das garantias ("100% no prazo", "30 dias de ajustes", "Figma").
- [ ] Turnstile + Formspree (ID novo) + variáveis na Vercel — [operacao/deploy.md](operacao/deploy.md).
- [ ] Primeiro deploy e checklist pós-deploy (PageSpeed real, securityheaders, Rich Results).
