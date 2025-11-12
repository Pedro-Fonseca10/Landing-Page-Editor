const currentYear = new Date().getFullYear();

export default {
  theme: {
    primary: '#2563eb',
    accent: '#a855f7',
    surface: '#f8fafc',
    text: '#0f172a',
  },
  announcement: {
    label: 'Convite antecipado',
    text: 'Distribuímos novos acessos toda semana',
  },
  hero: {
    eyebrow: 'Beta fechado',
    title: 'Construa o próximo capítulo com quem chega primeiro',
    subtitle:
      'Liberamos a plataforma em ondas para garantir suporte próximo aos primeiros clientes.',
    bullets: [
      {
        title: 'Feedback guiado',
        description: 'Templates de perguntas para validar roadmap.',
      },
      {
        title: 'Comunidade privada',
        description: 'Acesso ao Slack dedicado com o time de produto.',
      },
      {
        title: 'Roadmap prioritário',
        description: 'Influencie o que será lançado nos próximos ciclos.',
      },
      {
        title: 'Convites extras',
        description: 'Traga colegas e acelere a ativação da conta.',
      },
    ],
    stats: [
      { value: '12.437', label: 'Interessados' },
      { value: '48h', label: 'Tempo médio para resposta' },
    ],
    slots: {
      label: 'Vagas abertas neste lote',
      value: '150 lugares',
      caption: 'Encerramos ao atingir 500 pessoas confirmadas.',
    },
    cta: { label: 'Entrar na lista', href: '#waitlist' },
    secondaryCta: { label: 'Ver cronograma', href: '#timeline' },
    formTitle: 'Receba o convite primeiro',
    formSubtitle: 'Enviamos instruções completas assim que liberar um novo lote.',
    note: 'Sem spam. Você pode sair da lista a qualquer momento.',
    image:
      'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Prévia da interface em beta',
  },
  highlights: [
    {
      tag: '01',
      title: 'Onboarding assistido',
      text: 'Chamadas de 30 min para implementar o produto junto ao time.',
    },
    {
      tag: '02',
      title: 'Toolkit de lançamentos',
      text: 'Sequência de e-mails, scripts e assets prontos para o seu anúncio.',
    },
    {
      tag: '03',
      title: 'Métricas abertas',
      text: 'Receba relatórios semanais sobre evolução do beta.',
    },
  ],
  milestones: [
    {
      label: 'Dia 0',
      title: 'Confirmação e survey',
      description:
        'Você recebe um diagnóstico rápido para entendermos contexto, metas e integrações necessárias.',
      date: 'Envio automático após cadastro',
    },
    {
      label: 'Semana 1',
      title: 'Sessão de alinhamento',
      description:
        'Time de produto e sucesso conduzem uma call para configurar a conta e definir os primeiros experimentos.',
      date: 'Agenda compartilhada com opções de horários',
    },
    {
      label: 'Semana 3',
      title: 'Release exclusivo',
      description:
        'Liberamos recursos fechados apenas para o grupo beta e coletamos feedback detalhado.',
      date: 'Relatório entregue em até 48h',
    },
  ],
  perks: [
    {
      icon: '⚡',
      title: 'Prioridade no roadmap',
      text: 'Pedidos dos early adopters vão para o topo da fila.',
    },
    {
      icon: '🎯',
      title: 'Canal direto',
      text: 'Contato dedicado com PMs e time de sucesso para acelerar decisões.',
    },
    {
      icon: '🎁',
      title: 'Benefícios exclusivos',
      text: 'Créditos extras, convites para eventos e acesso vitalício ao beta.',
    },
  ],
  socialProof: {
    label: 'Empresas que já estão na fila',
    logos: ['Pulse', 'Northwind', 'Aurora Labs', 'Craftly'],
    quotes: [
      {
        text: 'Entrar cedo garantiu influência real no produto e uma curva de aprendizado muito menor.',
        author: 'Marina Costa',
        role: 'Head de Produto na Pulse',
      },
      {
        text: 'O time responde rápido e mantém todos os participantes por dentro dos próximos passos.',
        author: 'Felipe Ramos',
        role: 'Growth Lead na Craftly',
      },
    ],
  },
  finalCta: {
    eyebrow: 'Lote atual',
    title: 'Faça parte do grupo que define os próximos releases',
    subtitle:
      'Compartilhe seus dados e avisaremos assim que chegar ao topo da fila.',
    note: 'Convites enviados em blocos de até 50 pessoas por semana.',
    cta: { label: 'Quero participar', href: '#waitlist' },
  },
  faq: [
    {
      q: 'Quando recebo retorno após entrar na lista?',
      a: 'Confirmamos o recebimento no mesmo dia e enviamos o cronograma assim que houver vaga disponível.',
    },
    {
      q: 'Preciso pagar algo agora?',
      a: 'Não. O objetivo é validar o produto junto com você; os planos pagos só são acionados após a liberação geral.',
    },
    {
      q: 'Posso convidar outras pessoas da empresa?',
      a: 'Sim. Cada conta beta permite até 3 convidados para acelerar a adoção interna.',
    },
    {
      q: 'E se eu desistir do programa?',
      a: 'Basta responder ao e-mail de confirmação solicitando a remoção. Sem perguntas e sem spam.',
    },
  ],
  footer: {
    note: `© ${currentYear} Perfect Landing Page. Produzido por Pedro Henrique Diógenes da Fonseca 59.181.375/0001-48.`,
  },
};
