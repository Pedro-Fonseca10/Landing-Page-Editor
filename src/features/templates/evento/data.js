const data = {
  theme: '#7c3aed',
  accent: '#f97316',
  navbar: {
    logo: 'Growth Experience',
    links: [
      { label: 'Agenda', href: '#agenda' },
      { label: 'Palestrantes', href: '#speakers' },
      { label: 'Ingressos', href: '#tickets' },
      { label: 'FAQ', href: '#faq' },
    ],
    cta: { label: 'Inscreva-se', href: '#inscricao' },
  },
  hero: {
    badge: 'Edição 2024',
    title: 'Growth Experience',
    subtitle:
      'Uma noite ao vivo para destravar aquisição, retenção e playbooks de monetização aplicáveis já no dia seguinte.',
    date: '10 de outubro • 19h às 22h (BRT)',
    location: 'Online e ao vivo (Zoom)',
    cover: '',
    stats: [
      { label: 'Horas ao vivo', value: '3h' },
      { label: 'Mentores convidados', value: '6' },
      { label: 'Vagas liberadas', value: '120' },
    ],
    ctaPrimary: { label: 'Garanta seu ingresso', href: '#tickets' },
    ctaSecondary: { label: 'Ver agenda completa', href: '#agenda' },
  },
  highlights: {
    title: 'Por que participar',
    items: [
      {
        title: 'Conteúdo aplicável',
        text: 'Frameworks, checklists e exemplos prontos para implementar em squads de produto e marketing.',
        icon: '⚡️',
      },
      {
        title: 'Mentoria ao vivo',
        text: 'Sessão de perguntas aberta com mentores atuando em scale-ups latino-americanas.',
        icon: '🎤',
      },
      {
        title: 'Networking direcionado',
        text: 'Canal exclusivo para troca entre participantes e envio de oportunidades.',
        icon: '🤝',
      },
    ],
  },
  agenda: {
    title: 'Programa da noite',
    description: 'Conteúdo enxuto, direto ao ponto e alinhado a times de produto, marketing e vendas B2B e B2C.',
    days: [
      {
        label: 'Dia único',
        date: '10 de outubro',
        slots: [
          {
            time: '19:00',
            title: 'Abertura e leitura de cenário',
            speaker: 'Pedro Fonseca',
            type: 'Kick-off',
          },
          {
            time: '19:20',
            title: 'Playbooks de aquisição que escalam com pouco budget',
            speaker: 'Ana Souza',
            type: 'Talk',
          },
          {
            time: '20:10',
            title: 'Como instrumentar métricas de produto para crescer retenção',
            speaker: 'Bruno Dias',
            type: 'Case',
          },
          {
            time: '20:40',
            title: 'Painel: retenção vs. monetização',
            speaker: 'Mesa redonda',
            type: 'Painel',
          },
          {
            time: '21:30',
            title: 'Perguntas ao vivo e networking guiado',
            speaker: 'Mentores',
            type: 'Q&A',
          },
        ],
      },
    ],
  },
  speakers: {
    title: 'Mentores confirmados',
    highlight: 'Praticantes em scale-ups latino-americanas compartilhando bastidores reais.',
    people: [
      {
        name: 'Ana Souza',
        role: 'Head de Growth • Fintech X',
        bio: 'Responsável por squads de aquisição e CRO em 7 países.',
        avatar: '',
      },
      {
        name: 'Rafael Lima',
        role: 'PMM • HRTech Nova',
        bio: 'Conduziu lançamentos que geraram R$ 18M em pipeline.',
        avatar: '',
      },
      {
        name: 'Bruno Dias',
        role: 'Diretor de Produto • Health+',
        bio: 'Especialista em instrumentação de métricas e retenção.',
        avatar: '',
      },
    ],
  },
  tickets: {
    title: 'Ingressos',
    subtitle: 'Lotes promocionais válidos até 30/09 ou enquanto houver vagas.',
    disclaimer: 'Emitimos NF e enviamos gravação + materiais após o evento.',
    plans: [
      {
        name: 'Early Bird',
        price: 'R$ 79',
        badge: 'Limitado',
        description: 'Para quem garante presença até 31/08.',
        features: [
          'Acesso ao vivo + gravação',
          'Materiais em PDF',
          'Certificado individual',
        ],
        featured: true,
      },
      {
        name: 'Profissional',
        price: 'R$ 149',
        description: 'Inclui sessão extra de dúvidas pós-evento.',
        features: [
          'Tudo do Early Bird',
          'Sessão exclusiva com mentores',
          'Checklist personalizável',
        ],
      },
      {
        name: 'Team Pass (3 pessoas)',
        price: 'R$ 399',
        description: 'Ideal para squads que querem implementar juntos.',
        features: [
          '3 acessos ao vivo',
          'Mentoria em grupo (30min)',
          'Canal fechado com moderador',
        ],
      },
    ],
  },
  testimonials: [
    {
      name: 'Mariana Costa',
      role: 'Head de Marketing, NuvemPay',
      text: 'Aplicamos o framework de ofertas na semana seguinte e destravamos 18% de crescimento em trials.',
    },
    {
      name: 'Caio Rezende',
      role: 'Cofundador, VittaData',
      text: 'Densa, prática e cheia de exemplos reais. A parte de métricas mudou como organizamos o time.',
    },
  ],
  faq: [
    {
      q: 'Não posso assistir ao vivo. Receberei a gravação?',
      a: 'Sim! Enviamos a gravação e os materiais no dia seguinte, junto com certificados.',
    },
    {
      q: 'Há emissão de nota fiscal?',
      a: 'Sim, basta preencher os dados da empresa após a compra que emitimos até 48h depois.',
    },
    {
      q: 'O evento é indicado para iniciantes?',
      a: 'Trabalhamos conceitos avançados, mas todo o conteúdo é contextualizado para quem já opera produtos digitais.',
    },
  ],
  partners: {
    title: 'Quem apoia',
    logos: [
      { name: 'Plataforma Pulse', logo: '' },
      { name: 'Foward HQ', logo: '' },
      { name: 'DataCraft', logo: '' },
    ],
  },
  venue: {
    title: 'Formato do evento',
    description:
      '100% online, transmissão ao vivo via Zoom com interação no chat e sala exclusiva para Q&A.',
    address: 'Link enviado por e-mail aos inscritos na véspera.',
    highlights: [
      'Networking após o conteúdo principal',
      'Materiais disponibilizados em PDF',
      'Sessão dedicada para perguntas',
    ],
    mapEmbed: '',
  },
  leadForm: {
    title: 'Garanta sua vaga',
    copy: 'Cadastre seu melhor e-mail para receber atualizações e acesso ao lote atual.',
    textWhite: true,
  },
  footer: {
    note:
      '© ' +
      new Date().getFullYear() +
      ' Growth Experience. Produzido por Pedro Henrique Diógenes da Fonseca 59.181.375/0001-48.',
  },
};

export default data;
