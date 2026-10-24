# Contato e leads

Dois caminhos: **WhatsApp** (principal, sem backend) e **e-mail** (função serverless).

## WhatsApp

Links `https://wa.me/<site.whatsapp>?text=<mensagem>` (`waLink` em `src/lib/whatsapp.ts`).

| Botão                                   | Mensagem (`i18n → wa`)                    |
| --------------------------------------- | ----------------------------------------- |
| Hero, CTA final, rodapé, botão flutuante | `wa.direct` ("vim pelo seu site…")       |
| Seção de segurança                      | `wa.security`                             |
| Calculadora e barra mobile              | resumo completo (`buildQuoteMessage`)     |

Resumo enviado (exemplo em pt):

```
Olá, Lucas! Fiz uma simulação no seu site:

• Serviço: E-commerce
• Tamanho: 50 produtos
• Extras: +20 produtos adicionais, SEO avançado, Entrega expressa +30%
• Estimativa: R$ 9.230 (BRL)
• Prazo: ~16 dias úteis

Podemos conversar?
```

O número fica em `site.whatsapp` (`src/config/site.ts`) — é público, então não é variável ([ADR-0018](../decisoes/0018-valores-publicos-no-codigo.md)).

## E-mail

O visitante deixa o e-mail no resumo da calculadora; você recebe o orçamento e responde direto.

```mermaid
sequenceDiagram
  autonumber
  participant V as Visitante
  participant P as Página
  participant CF as Cloudflare Turnstile
  participant F as /api/orcamento (Vercel)
  participant FS as Formspree
  V->>P: foca no campo de e-mail
  P->>CF: carrega o widget (só agora)
  CF-->>P: token (invisível; desafio só se desconfiar)
  V->>P: Enviar
  P->>F: POST { email, token, message, service, total, … }
  F->>F: valida JSON, e-mail, tamanho, campo invisível, limite por IP
  F->>CF: siteverify(secret, token, IP)
  CF-->>F: success?
  F->>FS: POST /f/<FORMSPREE_FORM_ID> { email, _replyto, _subject, message, … }
  FS-->>F: 200
  F-->>P: { ok: true }
  P-->>V: "Recebido! Te respondo em breve."
```

### O que chega na sua caixa

- Assunto: `Novo orçamento pelo site · <serviço> · <total>` (`site.quoteMailSubject`).
- Campos: e-mail do visitante, resumo completo (o mesmo do WhatsApp), serviço, unidades, total,
  mensal, moeda, região e idioma.
- **Responder** vai direto para o visitante (`_replyto`).

### Aviso de privacidade

O Turnstile processa dados do visitante (IP, navegador), e você é o controlador desses dados (LGPD/GDPR).
Por isso, abaixo do campo de e-mail aparece *"Protegido pelo Cloudflare Turnstile. Política de privacidade"*,
com link para a [política do Turnstile](https://www.cloudflare.com/pt-br/turnstile-privacy-policy/) no
idioma do visitante (`calc.captcha`, `calc.captchaLink`, `calc.captchaUrl` em `i18n`).

### Proteções contra spam (em camadas)

1. **Turnstile** — prova de que é uma pessoa; o token vale para um envio e é conferido no servidor.
2. **Campo invisível** (`_gotcha`) — robôs que preenchem tudo recebem "ok" e nada é enviado.
3. **Limite por IP** — 5 envios a cada 10 minutos. É por instância da função (memória), então é
   uma barreira extra, não absoluta.
4. **ID do Formspree só no servidor** — não dá para pular o site e mandar direto para o Formspree.
5. Validação de formato e tamanho (corpo até 8 KB, campos cortados).

### Respostas da função

| Status | `error`               | Quando                                          |
| ------ | --------------------- | ----------------------------------------------- |
| 200    | — (`ok: true`)        | Enviado (ou robô descartado em silêncio)        |
| 400    | `invalid_json` / `invalid_email` / `captcha_required` | Requisição malformada |
| 403    | `captcha_failed`      | Turnstile reprovou                              |
| 405    | `method_not_allowed`  | Não é POST                                      |
| 413    | `too_large`           | Corpo > 8 KB                                    |
| 429    | `rate_limited`        | Mais de 5 envios em 10 min do mesmo IP          |
| 500    | `not_configured`      | Faltam `FORMSPREE_FORM_ID` ou `TURNSTILE_SECRET_KEY` |
| 502    | `captcha_unavailable` / `send_failed` | Cloudflare ou Formspree fora / recusou |

Para o visitante, qualquer erro mostra a mesma mensagem (`calc.error`), que sugere o WhatsApp.

### Variáveis

| Valor                  | Onde fica                          | Público? |
| ---------------------- | ---------------------------------- | -------- |
| Site Key do Turnstile  | `site.turnstileSiteKey` (código)    | sim      |
| `TURNSTILE_SECRET_KEY` | variável na Vercel (só a função)   | **não**  |
| `FORMSPREE_FORM_ID`    | variável na Vercel (só a função)   | **não**  |

Enquanto `turnstileSiteKey` for a chave de **teste** da Cloudflare (`1x00000000000000000000BB`,
sempre passa), o formulário funciona no computador mas não em produção (o token de teste não vale
para a Secret Key real, e a função recusa). É proposital: não dá para ir ao ar sem proteção.

Histórico: começou com o navegador postando direto no Formspree; mudou para a função +
Turnstile para esconder o ID e barrar spam — [ADR-0013](../decisoes/0013-funcao-turnstile-formspree.md).
