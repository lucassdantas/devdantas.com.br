# Deploy (Vercel + Cloudflare)

O domínio `devdantas.com.br` está na Cloudflare (DNS). O site roda na Vercel.

## 1. Cloudflare Turnstile (anti-spam do formulário)

1. Painel da Cloudflare → **Turnstile** → **Add widget**.
2. Nome: "Dantas Studio – orçamento". **Hostnames**: `devdantas.com.br` (e `www.devdantas.com.br`
   se for usar). Para testar previews da Vercel, adicione também o domínio `*.vercel.app` do projeto.
3. **Widget mode: Invisible** (ou Managed — o site usa `appearance: interaction-only`, que só mostra
   algo se a Cloudflare desconfiar).
4. Copie a **Site Key** e a **Secret Key**.

## 2. Formspree

1. Em [formspree.io](https://formspree.io), crie um formulário **novo** e copie o ID (final de
   `https://formspree.io/f/SEU_ID`).
   > O ID usado no começo do projeto ficou no histórico do Git. Se o repositório for público, use um novo.
2. Nas configurações do formulário, deixe o reCAPTCHA do Formspree **desligado** (a proteção agora é o Turnstile).

## 3. Vercel

1. **Add New → Project → Import** o repositório `lucassdantas/devdantas.com.br`.
   O `vercel.json` já define tudo (build `npm run build`, saída `out/`, função `api/orcamento.ts`).
2. **Settings → Environment Variables** (ambiente *Production*; repita em *Preview* se quiser testar lá):

   | Nome                             | Valor                       |
   | -------------------------------- | --------------------------- |
   | `NEXT_PUBLIC_WHATSAPP`           | ex.: `5521999999999`        |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site Key do passo 1         |
   | `TURNSTILE_SECRET_KEY`           | Secret Key do passo 1       |
   | `FORMSPREE_FORM_ID`              | ID do passo 2               |

3. **Deployments → Redeploy** (variáveis só valem num deploy novo).

> Plano: o Hobby (grátis) da Vercel é, pelos termos deles, para uso **não comercial**. Um site que
> vende serviços provavelmente precisa do **Pro**. Confira os termos atuais.

## 4. Domínio

1. Vercel → **Settings → Domains** → adicione `devdantas.com.br` (e `www`, redirecionando para o principal).
2. Na Cloudflare → **DNS**, crie os registros que a Vercel mostrar (normalmente `A` para o domínio
   raiz e `CNAME` para `www`).
3. **Deixe os registros como "DNS only" (nuvem cinza)**, não "Proxied" (laranja). Com o proxy da
   Cloudflare na frente, a Vercel tem problemas para emitir o certificado e o cache fica em dobro.
4. Confira se `site.domain` em `src/config/site.ts` é `https://devdantas.com.br` (já está).

## 5. Conferir depois do deploy

- [ ] `https://devdantas.com.br` redireciona para `/pt` (ou o idioma do navegador).
- [ ] Console do navegador sem erros nem avisos de CSP.
- [ ] Um envio pelo formulário chega no e-mail (e "Responder" vai para o visitante).
- [ ] [PageSpeed Insights](https://pagespeed.web.dev) celular e desktop — [performance.md](../dominio/performance.md).
- [ ] [securityheaders.com](https://securityheaders.com) — [seguranca.md](../dominio/seguranca.md).
- [ ] [Rich Results Test](https://search.google.com/test/rich-results) e Search Console com o sitemap.
- [ ] Prévia do link no WhatsApp.

## Travar o deploy quando o CI falha

A Vercel faz deploy a cada push, independente do GitHub Actions. Para que só código testado vá
para o ar:

1. GitHub → repositório → **Settings → Branches → Add rule** para `main`: marque
   *Require status checks to pass* e escolha o check **CI / test**.
2. Trabalhe em branches e faça merge por Pull Request: o merge só libera com o CI verde.
   (Cada PR também ganha um deploy de *preview* na Vercel para você ver antes.)

## Problemas comuns

| Sintoma                               | Causa provável                                        |
| ------------------------------------- | ----------------------------------------------------- |
| Formulário sempre dá erro             | Faltam variáveis secretas (função responde `not_configured`) ou Site Key de teste em produção. Veja os logs da função na Vercel (**Logs**). |
| Erro só em previews `*.vercel.app`    | Hostname do preview não está no widget do Turnstile.  |
| Certificado não emite / redirecionamento infinito | Registro DNS com proxy laranja na Cloudflare. |
| Mudei uma variável e nada mudou       | Faltou o Redeploy.                                    |
| `/pt` dá 404                          | `cleanUrls` removido do `vercel.json`.                |
