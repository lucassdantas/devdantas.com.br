# Deploy (Vercel + Cloudflare)

O domínio `devdantas.com.br` está na Cloudflare (DNS). O site roda na Vercel.

Ordem: **Turnstile → Formspree → código → Vercel → domínio → conferir.**

## 1. Cloudflare Turnstile (anti-spam do formulário)

O Turnstile é o "captcha invisível" da Cloudflare. Criar o widget é o que **gera as duas chaves**
que o site usa — sem ele não existe chave para colocar em lugar nenhum.

1. Entre em [dash.cloudflare.com](https://dash.cloudflare.com).
2. No menu da esquerda, na **página inicial da conta** (não dentro do domínio), clique em **Turnstile**.
3. **Add widget**.
4. Preencha:
   - **Widget name:** `Dantas Studio – orçamento`
   - **Hostname management / Hostnames:** adicione `devdantas.com.br` (como o domínio já está na sua
     Cloudflare, ele aparece na lista). Adicione `www.devdantas.com.br` se for usar `www`.
     Para testar no computador, adicione também `localhost`.
   - **Widget Mode:** **Invisible** (ninguém vê nada; o código já pede um desafio visível só se a
     Cloudflare desconfiar).
   - **Pre-clearance:** No.
5. **Create**. Aparecem duas chaves:
   - **Site Key** (pública) → vai **no código**: `turnstileSiteKey` em `src/config/site.ts`.
   - **Secret Key** (secreta) → vai **na Vercel**, na variável `TURNSTILE_SECRET_KEY` (passo 4).
     Não coloque a Secret Key no código nem mande por chat.

Os nomes dos campos podem mudar um pouco no painel da Cloudflare; o que importa são as duas chaves.

## 2. Formspree

1. Em [formspree.io](https://formspree.io), **+ New Form** → nome "Orçamentos do site".
2. Copie o ID (o final de `https://formspree.io/f/SEU_ID`).
   > O ID usado no começo do projeto ficou no histórico do Git. Se o repositório for público, use um novo.
3. Nas configurações do formulário, deixe o reCAPTCHA do Formspree **desligado** (quem protege agora é o Turnstile).

## 3. Código (valores públicos)

Em `src/config/site.ts`:

| Campo              | Valor                                             |
| ------------------ | ------------------------------------------------- |
| `whatsapp`         | seu número, só dígitos, com DDI e DDD (ex.: `5521987654321`) |
| `turnstileSiteKey` | a **Site Key** do passo 1                          |

Commit e push.

## 4. Vercel

### Importar o projeto (uma vez)
1. [vercel.com](https://vercel.com) → **Add New… → Project**.
2. Escolha o repositório `lucassdantas/devdantas.com.br` → **Import**.
3. Não mude nada em *Build & Output Settings*: o `vercel.json` já define tudo (build, pasta `out/`, função).
4. **Deploy**. O site sobe, mas o formulário de e-mail ainda recusa (faltam os segredos) — normal.

### Cadastrar as variáveis secretas
1. No projeto, aba **Settings** → **Environment Variables** (menu da esquerda).
2. Para cada variável abaixo:
   - **Key:** o nome exato (maiúsculas, com `_`).
   - **Value:** o valor.
   - **Environments:** marque **Production** e **Preview** (deixe Development desmarcado).
   - Se aparecer a opção **Sensitive**, ligue (o valor fica oculto até para quem vê o painel).
   - **Save**.

   | Key                    | Value                         |
   | ---------------------- | ----------------------------- |
   | `TURNSTILE_SECRET_KEY` | Secret Key do passo 1         |
   | `FORMSPREE_FORM_ID`    | ID do passo 2 (só o final, ex.: `abcdwxyz`) |

3. Variável nova só vale num deploy novo: aba **Deployments** → no deploy mais recente, menu **⋯**
   → **Redeploy** → confirme. (Ou faça qualquer push.)

> Plano: o Hobby (grátis) da Vercel é, pelos termos deles, para uso **não comercial**. Um site que
> vende serviços provavelmente precisa do **Pro**. Confira os termos atuais.

## 5. Domínio

1. Vercel → **Settings → Domains** → adicione `devdantas.com.br` (e `www.devdantas.com.br`,
   redirecionando para o principal).
2. A Vercel mostra os registros DNS. Na Cloudflare → seu domínio → **DNS → Records**, crie-os
   (normalmente `A` para `devdantas.com.br` e `CNAME` para `www`).
3. Em cada um, deixe a nuvem **cinza ("DNS only")**, não laranja ("Proxied"). Com o proxy da
   Cloudflare na frente, a Vercel tem problemas para emitir o certificado.
4. Aguarde a Vercel mostrar "Valid Configuration".

## 6. Conferir depois do deploy

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
   *Require status checks to pass* e escolha o check **test** (do workflow **CI**).
2. Trabalhe em branches e faça merge por Pull Request: o merge só libera com o CI verde.
   (Cada PR também ganha um deploy de *preview* na Vercel para você ver antes.)

## Problemas comuns

| Sintoma                               | Causa provável                                        |
| ------------------------------------- | ----------------------------------------------------- |
| Formulário sempre dá erro             | Faltam as variáveis (a função responde `not_configured`), faltou o Redeploy, ou `turnstileSiteKey` ainda é a de teste. Veja **Logs** do projeto na Vercel. |
| Erro só em previews `*.vercel.app`    | O hostname do preview não está no widget do Turnstile. |
| Certificado não emite / redirecionamento infinito | Registro DNS com nuvem laranja na Cloudflare. |
| Mudei uma variável e nada mudou       | Faltou o Redeploy.                                    |
| `/pt` dá 404                          | `cleanUrls` removido do `vercel.json`.                |
