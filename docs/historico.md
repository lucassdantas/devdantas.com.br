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

### 5. Configuração mais simples
- WhatsApp e Site Key do Turnstile saem das variáveis e vão para `site.ts` (são públicos);
  na Vercel ficam só os 2 segredos (ADR-0018). Passo a passo da Vercel e da Cloudflare em `operacao/deploy.md`.

### 6. Turnstile configurado
- Site Key real no código; aviso "Protegido pelo Cloudflare Turnstile" com link da política de privacidade (5 idiomas).
- Corrigido o campo de e-mail achatado no celular (bug do CSS do design; ADR-0011).

### 7. Foto no ar
- Foto do Lucas no "Sobre": 187 KB → 20 KB (celular, AVIF) / 49 KB (desktop retina), lazy, sem metadados.
- Domínio principal `devdantas.com.br` (o `www` redireciona); variáveis da função configuradas na Vercel.

## 2026-10-24

### Preços coerentes
- Uma tabela em real; dólar, euro e libra pelo câmbio + 8% (ADR-0019). Região LatAm removida.
- Landing: R$ 1.800 · US$ 380 · 340 € · £290.

## Pendências

- [ ] WhatsApp real, revisão de preços e das garantias ("100% no prazo", "30 dias de ajustes", "Figma").
- [ ] Gerar nova Secret Key do Turnstile (a atual foi exposta no chat) e cadastrar na Vercel + Formspree (ID novo) — [operacao/deploy.md](operacao/deploy.md).
- [ ] Primeiro deploy e checklist pós-deploy (PageSpeed real, securityheaders, Rich Results).
