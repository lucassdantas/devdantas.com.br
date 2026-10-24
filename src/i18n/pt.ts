/* =====================================================================
   TEXTOS EM PORTUGUÊS — este arquivo define o FORMATO de todos os idiomas.
   Os outros (en, es, fr, de) precisam ter exatamente as mesmas chaves;
   o TypeScript avisa no build se faltar alguma.
   Para trocar um texto, edite só o valor entre aspas.
   ===================================================================== */

const pt = {
  // title = título no Google e na aba (até ~60 caracteres, com palavras que as pessoas buscam);
  // ogTitle = título curto ao compartilhar no WhatsApp/LinkedIn; description = texto do Google (~155).
  meta: {
    title: "Criação de sites, landing pages e e-commerce | Dantas Studio",
    ogTitle: "Dantas Studio — Sites que vendem",
    description: "Sites, landing pages, e-commerces e sistemas rápidos, seguros e pensados para vender. Orçamento instantâneo para clientes no Brasil e no exterior.",
  },
  // Links do menu e botão de orçamento.
  nav: {
    services: "Serviços",
    work: "Resultados",
    security: "Segurança",
    pricing: "Orçamento",
    faq: "FAQ",
    cta: "Orçamento grátis",
  },
  // Rótulos de botões de ícone e acessibilidade (lidos por leitores de tela).
  ui: {
    theme: "Alternar tema",
    menu: "Abrir menu",
    float: "Fale comigo",
    lang: "Idioma",
    currency: "Moeda",
    nav: "Principal",
    less: "Diminuir",
    more: "Aumentar",
  },
  // Topo da página. t1 + t2 (azul) + t3 (cinza) formam o título; trust = os 3 selos; notif = card flutuante.
  hero: {
    eyebrow: "Sites, sistemas e segurança · Brasil e exterior",
    t1: "Seu site deveria",
    t2: "trazer clientes.",
    t3: "Não só existir.",
    sub: "Crio sites, landing pages, e-commerces e sistemas rápidos, seguros e pensados para vender — com o rigor de quem desenvolve sistemas críticos para a área da saúde.",
    status: "Disponível para novos projetos",
    cta1: "Calcular meu orçamento",
    cta2: "Falar no WhatsApp",
    trust: ["6+ anos desenvolvendo", "100% das entregas no prazo", "Clientes no Brasil e na Nova Zelândia"],
    url: "seunegocio.com",
    chart: "Visitas → clientes",
    notif: "Novo pedido de orçamento",
    notifSub: "via WhatsApp · agora",
    ssl: "HTTPS · Protegido",
    sslSub: "Certificado ativo",
    backup: "Backup concluído",
    backupSub: "Hoje, 03:00",
  },
  // Frase acima da faixa de marcas.
  clients: "Marcas que já confiaram no meu trabalho",
  // Seção 01: cards problema → solução.
  pain: {
    kicker: "O problema",
    probLabel: "Problema",
    solLabel: "Como eu resolvo",
    title: "Um site bonito que não vende é só custo.",
    items: [
      {
        t: "Lento demais",
        p: "Cada segundo a mais de carregamento faz visitantes desistirem antes de ver sua oferta.",
        fix: "Código leve, imagens otimizadas e hospedagem bem configurada.",
      },
      {
        t: "Inseguro",
        p: "Site invadido, com vírus ou spam no Google derruba sua reputação e suas vendas.",
        fix: "Desenvolvimento seguro, HTTPS, backups e monitoramento.",
      },
      {
        t: "Não converte",
        p: "O visitante entra, não entende o que você vende e vai embora sem chamar.",
        fix: "Estrutura de venda, texto claro e WhatsApp no lugar certo.",
      },
    ],
  },
  // Seção 02: cards de serviço. items[id].unit = unidade do slider da calculadora.
  services: {
    kicker: "Serviços",
    title: "Tudo o que seu negócio precisa para vender online",
    sub: "Do primeiro site ao sistema sob medida — com um único responsável técnico do início ao fim.",
    from: "a partir de",
    simulate: "Simular",
    perHour: "/hora",
    perMonth: "/mês",
    short1: "Sites e landing pages",
    short2: "Sistemas e e-commerce",
    items: {
      landing: {
        name: "Landing page",
        desc: "Página única focada em uma oferta, feita para transformar anúncio em contato.",
        out: "Para campanhas e anúncios",
        unit: "seções",
      },
      site: {
        name: "Site institucional",
        desc: "Site profissional com várias páginas, que passa confiança e aparece no Google.",
        out: "Para empresas e profissionais",
        unit: "páginas",
      },
      ecommerce: {
        name: "E-commerce",
        desc: "Loja virtual com pagamento, frete e painel para você gerenciar pedidos.",
        out: "Para vender 24 horas por dia",
        unit: "produtos",
      },
      system: {
        name: "Sistema web",
        desc: "Sistemas sob medida, painéis, automações e integrações com IA e WhatsApp.",
        out: "Para automatizar processos",
        unit: "módulos",
      },
      design: {
        name: "Design UI/UX",
        desc: "Interfaces bonitas e fáceis de usar, com protótipo navegável antes do código.",
        out: "Para apps e produtos digitais",
        unit: "telas",
      },
      consulting: {
        name: "Consultoria",
        desc: "Diagnóstico técnico, arquitetura, performance e próximos passos com clareza.",
        out: "Para decidir antes de investir",
        unit: "horas",
      },
      security: {
        name: "Segurança e limpeza",
        desc: "Diagnóstico, limpeza de malware e proteção. A recuperação depende dos acessos e backups disponíveis.",
        out: "Para site hackeado ou lento",
        unit: "sites",
      },
      care: {
        name: "Suporte e backup",
        desc: "Atualizações, backups, monitoramento e pequenos ajustes todo mês.",
        out: "Para nunca mais se preocupar",
        unit: "sites",
      },
    },
  },
  // Seção 03. ATENÇÃO: noteTitle/note ("Sem promessa milagrosa") é proteção legal/comercial — mude com cuidado.
  security: {
    kicker: "Segurança",
    title: "Seu site seguro por padrão. Não por sorte.",
    sub: "Os sites que eu desenvolvo já saem protegidos. Se o seu foi invadido, começo por um diagnóstico e te digo com franqueza o que dá para recuperar — antes de começar o trabalho.",
    list: [
      "Código seguro contra as falhas mais comuns (OWASP)",
      "HTTPS, cabeçalhos de segurança e formulários protegidos contra spam",
      "Backups automáticos com restauração rápida",
      "Limpeza de vírus, malware e spam de SEO",
      "Recuperação de site invadido, conforme os acessos e backups disponíveis",
      "Atualizações e monitoramento contínuo",
    ],
    scanTitle: "Diagnóstico antes de tudo",
    scan: [
      "Acesso à hospedagem e ao servidor",
      "Backup do código",
      "Backup do banco de dados",
      "Arquivos, plugins e dependências",
      "Certificado SSL e e-mails",
    ],
    scanDone: "Você sabe o que dá para recuperar antes de eu começar",
    noteTitle: "Sem promessa milagrosa",
    note: "Para recuperar um site eu preciso de acesso à hospedagem, ao código e, de preferência, de backups do código e do banco de dados. Sem backup, faço o que for tecnicamente possível e te aviso disso antes. A melhor proteção é prevenir: backup automático e manutenção mensal.",
    cta: "Pedir um diagnóstico",
    scanning: "Verificando…",
  },
  // Seção 04: cases. items[chave] casa com a lista WORK em components/Work.tsx.
  work: {
    kicker: "Resultados",
    title: "Projetos reais, no ar, para clientes reais",
    sub: "Alguns trabalhos entregues no Brasil e no exterior.",
    items: {
      pure: {
        tag: "Site + orçamento online",
        place: "Nova Zelândia",
        desc: "Site para empresa automotiva com formulário de orçamento em etapas e envio de fotos.",
      },
      help: {
        tag: "E-commerce",
        place: "Brasil",
        desc: "Loja WooCommerce com plugin próprio de frete e entrega — desenvolvida e mantida por mim.",
      },
      ital: {
        tag: "Site + landing pages",
        place: "Brasil",
        desc: "Site das lojas de móveis planejados e várias landing pages de campanha.",
      },
      rubraz: {
        tag: "Sistema web",
        place: "Brasil",
        desc: "Sistema de cálculo de frete com Google Maps, login e painel em React.",
      },
    },
  },
  // Seção 05: calculadora. disc = aviso de valores fictícios (manter). pay = nota de pagamento por região.
  calc: {
    kicker: "Orçamento instantâneo",
    title: "Descubra quanto custa em 30 segundos",
    sub: "Escolha o serviço, ajuste o tamanho e veja o valor na hora. Sem cadastro e sem compromisso.",
    s1: "Qual serviço você precisa?",
    s2: "Qual o tamanho do projeto?",
    s3: "Quer turbinar?",
    incl: "inclusos no valor base",
    per: "por adicional",
    perHour: "por hora",
    none: "Esse serviço já vem completo. É só enviar.",
    x: {
      lang: { t: "Idiomas extras", d: "Para vender a clientes de outros países" },
      seo: { t: "SEO avançado", d: "Otimizado para aparecer no Google" },
      copy: { t: "Textos que vendem", d: "Copywriting focado em conversão" },
      cms: { t: "Painel de edição", d: "Você edita textos e imagens sozinho" },
      integrations: { t: "Integrações", d: "WhatsApp, CRM, pagamentos ou automações" },
      urgency: { t: "Entrega expressa", d: "Prioridade na fila e prazo menor" },
      care: { t: "Suporte e backup mensal", d: "Atualizações, backups e monitoramento" },
    },
    summary: "Seu orçamento",
    region: "Valores em",
    total: "Investimento estimado",
    totalMonthly: "Investimento mensal",
    monthly: "Plano mensal",
    perMonth: "/mês",
    base: "Base",
    extra: "adicionais",
    delivery: "Prazo estimado",
    days: "dias úteis",
    service: "Serviço",
    start: "Início imediato",
    wa: "Enviar orçamento no WhatsApp",
    or: "ou receba por e-mail",
    emailPh: "seu@email.com",
    send: "Enviar",
    sent: "Recebido! Te respondo em breve.",
    disc: "* Valores fictícios e apenas ilustrativos. Não constituem proposta comercial e podem ser bem diferentes do preço real, que só é definido após a análise do seu projeto.",
    pay: {
      br: "50% na aprovação e 50% na entrega · Pix ou cartão",
      intl: "50% para começar e 50% na entrega · Wise, PayPal ou cartão",
    },
    sending: "Enviando…",
    error: "Não foi possível enviar agora. Tente de novo ou fale no WhatsApp.",
    emailLabel: "E-mail",
  },
  // Seção 06: as 4 etapas.
  process: {
    kicker: "Como funciona",
    title: "Do primeiro oi ao site no ar, sem dor de cabeça",
    steps: [
      { t: "Conversa rápida", p: "Você me conta seu objetivo pelo WhatsApp ou numa chamada de 15 minutos." },
      { t: "Proposta clara", p: "Escopo, prazo e preço fechados por escrito. Sem surpresa no meio do caminho." },
      { t: "Criação com prévias", p: "Você acompanha e aprova o design e o desenvolvimento em cada etapa." },
      { t: "Entrega e suporte", p: "Site no ar, treinamento para você usar e suporte depois da entrega." },
    ],
  },
  // As 4 garantias abaixo do processo (TODO(Lucas): revisar "100% no prazo" e "30 dias de ajustes").
  guar: [
    { t: "Preço fechado", p: "O valor combinado é o valor pago. Mudanças só com o seu aval." },
    { t: "Tudo é seu", p: "Código, domínio e acessos ficam no seu nome." },
    { t: "Prazo cumprido", p: "100% das entregas dentro do prazo até hoje." },
    { t: "Suporte pós-entrega", p: "30 dias de ajustes inclusos depois que o site vai ao ar." },
  ],
  // Seção 07: sobre você.
  about: {
    kicker: "Quem cuida do seu projeto",
    role: "Desenvolvedor Full Stack · Rio de Janeiro",
    p: "Há mais de 6 anos desenvolvo aplicações web, APIs, integrações e automações — hoje também em sistemas críticos da área da saúde e numa plataforma SaaS integrada ao WhatsApp e à IA. Você fala direto comigo, do início ao fim.",
    langsLabel: "Atendo em",
  },
  // Seção 08: perguntas frequentes.
  faq: {
    kicker: "Dúvidas",
    title: "Perguntas frequentes",
    items: [
      {
        q: "Quanto tempo leva?",
        a: "Uma landing page fica pronta em cerca de 1 a 2 semanas; sites e lojas, de 3 a 6 semanas. A calculadora mostra uma estimativa para o seu caso.",
      },
      {
        q: "Como funciona o pagamento?",
        a: "50% para começar e 50% na entrega. No Brasil, Pix ou cartão; no exterior, Wise, PayPal ou cartão, na sua moeda.",
      },
      {
        q: "Você atende clientes de fora do Brasil?",
        a: "Sim. Trabalho em português, inglês e espanhol, me adapto ao seu fuso e cobro na sua moeda.",
      },
      {
        q: "Meu site foi hackeado. Dá para recuperar?",
        a: "Depende do que estiver disponível. Primeiro faço um diagnóstico: com acesso à hospedagem e backups do código e do banco, as chances são boas. Sem backup, faço o que for tecnicamente possível e te digo com clareza antes de começar. Depois, configuro proteção e backups para reduzir o risco de acontecer de novo.",
      },
      {
        q: "Vou conseguir editar o site sozinho?",
        a: "Sim, se quiser. Entrego um painel simples para você trocar textos, imagens e produtos sem depender de ninguém.",
      },
      {
        q: "E a hospedagem e o domínio?",
        a: "Eu ajudo a escolher, configuro tudo e deixo no seu nome. Se preferir, cuido de tudo no plano mensal de suporte.",
      },
    ],
  },
  // Chamada final (bloco azul).
  final: {
    title: "Pronto para ter um site que trabalha por você?",
    sub: "Me chama no WhatsApp e receba uma proposta sem compromisso.",
    cta1: "Falar no WhatsApp agora",
    cta2: "Calcular orçamento",
  },
  // Rodapé.
  footer: {
    tag: "Sites, sistemas e segurança para empresas que querem crescer.",
    contact: "Contato",
    rights: "Todos os direitos reservados.",
    made: "Feito à mão, com código próprio.",
  },
  // Mensagens que vão prontas para o WhatsApp.
  wa: {
    hi: "Olá, Lucas! Fiz uma simulação no seu site:",
    service: "Serviço",
    size: "Tamanho",
    extras: "Extras",
    total: "Estimativa",
    monthly: "Mensal",
    delivery: "Prazo",
    bye: "Podemos conversar?",
    direct: "Olá, Lucas! Vim pelo seu site e quero um orçamento.",
    security: "Olá, Lucas! Preciso de ajuda com a segurança do meu site.",
  },
};

export default pt;

/** Formato de um dicionário (derivado do pt). */
export type Dictionary = typeof pt;
