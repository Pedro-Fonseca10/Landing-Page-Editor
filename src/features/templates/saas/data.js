// Conteúdo padrão do template SaaS (centralizado em 1 arquivo)
// Segue a ideia do repo-base de manter o conteúdo em um arquivo único. 
// Você pode editar tudo aqui sem mexer nos componentes.
const data = {
  theme: "#0ea5e9",
  navbar: {
    logo: "PerfectLanding",
    links: [
      { label: "Recursos", href: "#features" },
      { label: "Planos", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    cta: { label: "Começar agora", href: "#cta" }
  },
  hero: {
    title: "Acelere sua presença digital",
    subtitle: "Crie landing pages modernas, mensuráveis e com alta conversão.",
    img: "",
    ctaText: "Quero testar",
    ctaHref: "#cta"
  },
  features: [
    { title: "Editor rápido", text: "Personalize textos, cores, imagens e CTAs em minutos." },
    { title: "Métricas nativas", text: "Acompanhe visitas, CTR, conversões e rejeição." },
    { title: "Templates prontos", text: "Modelos para SaaS, eventos, produtos e mais." }
  ],
  pricing: {
    subtitle: "Escolha o plano ideal",
    plans: [
      { name: "Starter", price: "R$ 0", period: "/mês", features: ["1 página", "Coleta básica", "Export ZIP"] },
      { name: "Pro", price: "R$ 49", period: "/mês", featured: true, features: ["10 páginas", "Métricas avançadas", "Export PDF/CSV"] },
      { name: "Enterprise", price: "R$ 199", period: "/mês", features: ["Ilimitado", "Acesso multi-time", "Suporte prioritário"] }
    ]
  },
  faq: [
    { q: "Posso mudar as cores e textos?", a: "Sim, tudo é configurável na tela de edição." },
    { q: "Consigo exportar a página?", a: "Sim, você pode exportar ZIP com HTML/CSS e publicar localmente." },
    { q: "Vocês coletam dados sensíveis?", a: "Não. A conversão é uma intenção/lead; o pagamento é externo." }
  ],
  footer: {
    note: "© " + new Date().getFullYear() + " PerfectLanding. Todos os direitos reservados."
  }
}

export default data