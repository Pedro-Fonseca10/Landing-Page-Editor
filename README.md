CSI-28 • Lab2 — Landing Pages (ITA Jr.)
Landing Pages modulares com template SaaS, CRUD de LPs e coleta de métricas (RF-09). Baseado no layout do repositório PerfectLandingPage e integrado ao fluxo do projeto da disciplina.
✨ Features
Template SaaS (Navbar, Hero, Features, Pricing, FAQ, Footer, CTA).
CRUD de Landing Pages (criar, editar, visualizar, publicar).
Coleta de eventos (cliques em CTAs) conforme RF-09.
Suporte a conteúdo dinâmico via data.js.
Pré-visualização em tempo real da LP selecionada.
Estilo com Tailwind CSS.
🧱 Stack
Vite + React
Tailwind CSS
(Opcional) Vitest + jsdom para testes
(Opcional) Zustand/Redux para estado (se aplicável no seu código)
📁 Estrutura (sugestão)
src/
  features/
    lps/
      data.js
      SaaSTemplate.jsx
      Landing.jsx
      ...
  pages/
  components/
  styles/
🚀 Como rodar
Pré-requisitos:
Node.js LTS (≥ 18)
npm ou pnpm
Instalação:
npm install
# ou
pnpm install
Ambiente (se necessário):
Crie .env com chaves de métricas/URLs, por ex.:
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_METRICS=true
Rodando em dev:
npm run dev
Build:
npm run build
Preview do build:
npm run preview
🎯 Como usar (LPs)
Garanta os arquivos src/features/lps/data.js e src/features/lps/SaaSTemplate.jsx.
No CRUD de Landing Pages, crie uma nova LP com Template = "saas" (id esperado pelo renderizador).
O nome “SaaS B2B” é só rótulo amigável; o que importa é o id "saas".
Edite a LP (títulos, textos, preços) — ou mantenha o padrão do data.js.
Abra a Pré-visualização: você verá Navbar, Hero, Features, Pricing, FAQ e Footer.
CTAs funcional e eventos do RF-09 devem ser registrados.
🧩 data.js (exemplo mínimo)
export const defaultLPData = {
  hero: {
    title: "Acelere seu B2B",
    subtitle: "Template SaaS pronto para conversão",
    ctaText: "Começar agora",
  },
  features: [
    { title: "Rápido", desc: "Deploy em minutos" },
    { title: "Mensurável", desc: "Eventos e métricas (RF-09)" },
  ],
  pricing: [
    { plan: "Starter", price: "R$49/mês", cta: "Assinar" },
    { plan: "Pro", price: "R$99/mês", cta: "Assinar" },
  ],
  faq: [
    { q: "Como começo?", a: "Crie uma LP com Template = saas e edite." },
  ],
  footer: { note: "© 2025 ITA Jr." },
};
🧱 SaaSTemplate.jsx (wire)
import React from "react";

export default function SaaSTemplate({ data, onCta }) {
  const d = data || {};
  return (
    <div className="min-h-screen">
      <header className="p-6 flex justify-between">
        <div className="font-bold">SaaS</div>
        <nav className="space-x-4">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
      </header>

      <section className="text-center p-12">
        <h1 className="text-4xl font-bold">{d.hero?.title}</h1>
        <p className="mt-2">{d.hero?.subtitle}</p>
        <button
          className="mt-6 px-6 py-3 rounded-xl border"
          onClick={() => onCta?.("hero_cta")}
        >
          {d.hero?.ctaText}
        </button>
      </section>

      <section id="features" className="grid md:grid-cols-3 gap-6 p-6">
        {(d.features || []).map((f, i) => (
          <div key={i} className="p-6 rounded-2xl border">
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm mt-1">{f.desc}</p>
          </div>
        ))}
      </section>

      <section id="pricing" className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {(d.pricing || []).map((p, i) => (
            <div key={i} className="p-6 rounded-2xl border text-center">
              <div className="text-xl font-bold">{p.plan}</div>
              <div className="mt-2">{p.price}</div>
              <button
                className="mt-4 px-6 py-2 rounded-xl border"
                onClick={() => onCta?.(`pricing_${p.plan}`)}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="p-6">
        {(d.faq || []).map((item, i) => (
          <details key={i} className="mb-3 p-4 rounded-xl border">
            <summary className="font-semibold">{item.q}</summary>
            <p className="mt-2 text-sm">{item.a}</p>
          </details>
        ))}
      </section>

      <footer className="p-6 text-center text-sm opacity-70">
        {d.footer?.note}
      </footer>
    </div>
  );
}
🧪 Testes (opcional)
npm test
Se usar Vitest + jsdom:
// package.json (trecho)
{
  "devDependencies": {
    "vitest": "^3.2.4",
    "jsdom": "^25.0.0"
  }
}
🎛️ Tailwind CSS (nota rápida)
Se estiver usando Tailwind e ocorrer “npm error could not determine executable to run”:
Apague node_modules e package-lock.json/pnpm-lock.yaml.
Reinstale dependências.
Confirme tailwind.config.js e postcss.config.js criados por npx tailwindcss init -p.
Verifique scripts no package.json e o @tailwind em index.css.
🧰 Troubleshooting
“Clientes” redireciona para Entrar: cheque a proteção de rota (guard) e se o usuário atual possui sessão válida.
“Editar não leva a lugar nenhum / Visualizar 404”: verifique as rotas declaradas do CRUD de LP e o parâmetro id na URL; confira se a LP existe e se o Template = "saas".
📄 Licença
Defina a licença do projeto (MIT/Apache-2.0/etc.).