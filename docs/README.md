# Documentação — Dantas Studio

Documentação técnica do site [devdantas.com.br](https://devdantas.com.br). O
[README da raiz](../README.md) é o guia rápido; aqui fica o porquê das coisas e os detalhes.

## Por onde começar

| Quero…                                        | Leia                                                        |
| --------------------------------------------- | ----------------------------------------------------------- |
| Entender como o projeto funciona              | [arquitetura/visao-geral.md](arquitetura/visao-geral.md)    |
| Trocar preço, texto, foto, WhatsApp           | [operacao/manutencao.md](operacao/manutencao.md)            |
| Rodar no computador                           | [operacao/desenvolvimento.md](operacao/desenvolvimento.md)  |
| Publicar na Vercel / configurar a Cloudflare  | [operacao/deploy.md](operacao/deploy.md)                    |
| Rodar ou escrever testes                      | [operacao/testes.md](operacao/testes.md)                    |
| Saber por que algo foi feito de certo jeito   | [decisoes/](decisoes/README.md)                             |
| Ver o que mudou e quando                      | [historico.md](historico.md)                                |

## Mapa

```
docs/
├── README.md                    ← você está aqui
├── historico.md                 linha do tempo do projeto
├── arquitetura/
│   ├── visao-geral.md           stack, pastas, build, fluxo de dados
│   ├── renderizacao-e-estado.md o que roda no build x no navegador; estado e hidratação
│   └── estilos-e-animacoes.md   CSS portado, tema, animações e reveal
├── dominio/                     regras de cada parte do negócio
│   ├── calculadora-e-precos.md
│   ├── idiomas-e-regioes.md
│   ├── contato-e-leads.md       WhatsApp e e-mail (função + Turnstile + Formspree)
│   ├── seo-e-compartilhamento.md
│   ├── seguranca.md
│   ├── performance.md
│   └── conteudo-e-assets.md     imagens, foto, ícones, imagens de compartilhamento
├── operacao/
│   ├── desenvolvimento.md
│   ├── testes.md
│   ├── deploy.md
│   └── manutencao.md            receitas do dia a dia
└── decisoes/                    ADRs: uma decisão por arquivo, numeradas
```

## Convenções

- Textos em português; nomes de código em inglês (como no código).
- Decisão nova ou mudança de rumo → um ADR novo em `decisoes/` (nunca apague um antigo:
  marque como "Substituído por ADR-00XX").
- Se você mudar um comportamento descrito aqui, atualize o doc no mesmo commit.
