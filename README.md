# CSI-28 — PerfectLandingPage

Projeto desenvolvido como parte da disciplina **CSI-28 — Fundamentos de Engenharia de Software** no Instituto Tecnológico de Aeronáutica (ITA).  
O sistema tem como objetivo fornecer **templates de landing pages** para clientes da **ITA Júnior**, facilitando a criação, personalização e publicação de páginas otimizadas para conversão.

## 📖 Visão Geral

Uma **landing page** é uma página da web criada com foco em um objetivo específico, como captar leads, promover um produto ou direcionar o visitante para uma ação definida.  
O sistema PerfectLandingPage permitirá que membros da ITA Júnior configurem e personalizem páginas rapidamente, a partir de **modelos pré-definidos**, reduzindo tempo de entrega e garantindo padronização.

Além disso, o sistema integrará **coleta automática de métricas digitais**, oferecendo relatórios que auxiliam na análise de desempenho e na otimização de campanhas.

## 🏗️ Arquitetura

O frontend é implementado como uma single-page application em React, organizada segundo uma arquitetura orientada a domínios (feature-first). Cada pasta dentro de `src/features` encapsula componentes de interface, regras de negócio e utilidades específicas daquele domínio (por exemplo, `clients`, `templates`, `payments`). As páginas expostas no roteamento apenas coordenam essas features e compõem a experiência completa.

O relacionamento entre as camadas fica descrito no diagrama abaixo:

```
src/main.jsx ──▶ src/routes/AppRouter.jsx
                   │
                   ▼
                src/pages/*
                   │
                   ▼
          src/features/<domínio>/*
                   │
                   ▼
                src/lib/* utilitários
```

Essa estrutura favorece a evolução incremental por domínio de negócio, reuso de componentes transversais e clareza na responsabilização de cada módulo.

## 🎯 Principais Funcionalidades

- **CRUD de clientes e landing pages**.
- **Seleção e personalização de templates** (ex.: SaaS B2B, Eventos, Portfólio, Comparativo de Planos).
- **Pré-visualização responsiva** antes da publicação.
- **Publicação/exportação** de páginas com link único ou pacote HTML/CSS.
- **Instrumentação automática de eventos** (page_view, cta_click, form_submit, conversion).
- **Painel de métricas** com indicadores como taxa de conversão, CTR, rejeição, origem de tráfego e tempo médio na página.
- **Relatórios exportáveis** (PDF/CSV).
- **Fluxo de pedido e integração com gateway de pagamento** (redirecionamento externo, sem armazenar dados sensíveis).

## 📌 Escopo do Sistema

### Funcionalidades Incluídas

- Geração de landing pages a partir de modelos.
- Personalização de textos, imagens, cores e CTAs.
- Armazenamento estruturado de clientes, páginas e leads.
- Registro automático de eventos de interação.
- Relatórios sintéticos de métricas digitais.

### Funcionalidades Excluídas

- Integração com CRMs ou automação de marketing externos.
- Suporte a testes A/B automatizados.
- Construtores visuais avançados além dos modelos fornecidos.
- Suporte e manutenção contínuos após o semestre letivo.

## 🔑 Requisitos Funcionais

- **RF-01**: Autenticação de usuário.
- **RF-02**: Perfis de acesso (Administrador/Membro).
- **RF-03**: CRUD de clientes.
- **RF-04**: CRUD de landing pages.
- **RF-05**: Seleção de templates.
- **RF-06**: Personalização de conteúdo.
- **RF-07**: Pré-visualização responsiva.
- **RF-08**: Publicação/exportação.
- **RF-09**: Registro automático de eventos.
- **RF-10**: Painel de métricas.
- **RF-11**: Relatórios exportáveis.
- **RF-12**: Registro de pedidos (intenção de compra).
- **RF-13**: Integração com gateway de pagamento.

## 🗄️ Modelo Conceitual (Entidades Principais)

- **Usuário**: autenticação e perfil de acesso.
- **Cliente**: organização atendida pela ITA Júnior.
- **LandingPage**: página gerada a partir de templates.
- **Template**: modelos pré-definidos de páginas.
- **Evento**: interações registradas (page_view, cta_click, etc.).
- **Métrica**: indicadores derivados dos eventos.
- **Lead**: contato capturado pela landing page.
- **Pedido**: intenção de compra associada a uma página.
- **Pagamento**: vínculo ao gateway externo, com status.

## ⚖️ Restrições

- O sistema deve ser concluído dentro do semestre letivo de 2025.
- O foco é **simplicidade e clareza**, priorizando o aprendizado de engenharia de software.
- Não haverá suporte formal após o término da disciplina.
- Funcionalidades devem atender a princípios básicos de qualidade, confiabilidade e segurança.

## 🧪 Testes Automatizados

O projeto utiliza **Vitest** + **Testing Library** para garantir uma amostra representativa do comportamento da aplicação. Os testes são separados em `tests/unit` e `tests/integration`, permitindo validar regras de negócio isoladas e fluxos completos de interface respectivamente.

Para executar todos os testes:

```bash
npm run test
```

| Tipo        | Arquivo                                            | Cenários cobertos                                                              |
| ----------- | -------------------------------------------------- | ------------------------------------------------------------------------------ |
| Unit        | `tests/unit/auth/AuthProvider.test.jsx`            | login com múltiplos perfis, erros e ciclo de logout                            |
| Unit        | `tests/unit/lib/storage.test.js`                   | serialização no `localStorage`, fallback seguro e tratamento de JSON inválido  |
| Unit        | `tests/unit/lib/repo.test.js`                      | CRUD do repositório em memória com garantia de imutabilidade                   |
| Integration | `tests/integration/routes/ProtectedRoute.test.jsx` | redirecionamento automático e bloqueio por role                                |
| Integration | `tests/integration/pages/Login.test.jsx`           | efeito de logout inicial, feedback de erro e navegação pós-login               |
| Integration | `tests/integration/features/ClientsPage.test.jsx`  | carregamento inicial, validação do formulário e persistência de novos clientes |

O setup global informado em `vite.config.js` garante os matchers de `@testing-library/jest-dom` para todas as suítes.

---

📅 **Data da versão inicial do documento de requisitos:** 26 de agosto de 2025  
👥 **Equipe:**

- Cícero Nunes da Silva Neto
- Marcelo Hippolyto de Sandes Peixoto
- Pablo Carvalho do Nascimentos dos Santos
- Pedro Henrique Diogenes da Fonseca
