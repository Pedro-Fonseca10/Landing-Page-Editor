// Conteúdo padrão do template SaaS (centralizado em 1 arquivo)
// Segue a ideia do repo-base de manter o conteúdo em um arquivo único.
const data = {
  theme: '#0ea5e9',
  navbar: {
    logo: 'Nome do SaaS',
    links: [
      { label: 'Recursos', href: '#features' },
      { label: 'Planos', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
    cta: { label: 'Começar agora', href: '#cta' },
  },
  hero: {
    title: 'Título Chamativo para seu SaaS',
    subtitle: 'Descrição rápida do que o SaaS faz e quais problemas resolve.',
    img: '', // Basta colocar a imagem na pasta public
    ctaText: 'Quero testar',
    ctaHref: '#cta',
  },
  features: [
    {
      title: 'Editor rápido',
      text: 'Personalize textos, cores, imagens e CTAs em minutos.',
    },
    {
      title: 'Métricas nativas',
      text: 'Acompanhe visitas, CTR, conversões e rejeição.',
    },
    {
      title: 'Templates prontos',
      text: 'Modelos para SaaS, eventos, produtos e mais.',
    },
  ],
  banner: {
    img: '', // imagem panorâmica (ex.: 1600x400)
    height: 288, // altura em px (editável)
    btnText: 'Assine Já',
    btnHref: '#pricing',
  },
  pricing: {
    subtitle: 'Escolha o plano ideal',
    plans: [
      {
        name: 'Starter',
        price: 'R$ 0',
        period: '/mês',
        features: ['1 página', 'Coleta básica', 'Export ZIP'],
      },
      {
        name: 'Pro',
        price: 'R$ 49',
        period: '/mês',
        featured: true,
        features: ['10 páginas', 'Métricas avançadas', 'Export PDF/CSV'],
      },
      {
        name: 'Enterprise',
        price: 'R$ 199',
        period: '/mês',
        features: ['Ilimitado', 'Acesso multi-time', 'Suporte prioritário'],
      },
    ],
  },
  faq: [
    {
      q: 'Posso mudar as cores e textos?',
      a: 'Sim, tudo é configurável na tela de edição.',
    },
    {
      q: 'Consigo exportar a página?',
      a: 'Sim, você pode exportar ZIP com HTML/CSS e publicar localmente.',
    },
    {
      q: 'Vocês coletam dados sensíveis?',
      a: 'Não. A conversão é uma intenção/lead; o pagamento é externo.',
    },
  ],
  footer: {
    note:
      '© ' +
      new Date().getFullYear() +
      ' Landing Page Editor. Todos os direitos reservados a Pedro Henrique Diógenes da Fonseca 59.181.375/0001-48.',
  },
};

export default data;
