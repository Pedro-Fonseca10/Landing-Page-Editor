# CSI-28 — PerfectLandingPage

Projeto desenvolvido como parte da disciplina **CSI-28 — Fundamentos de Engenharia de Software** no Instituto Tecnológico de Aeronáutica (ITA).  
O sistema tem como objetivo fornecer **templates de landing pages** para clientes da **ITA Júnior**, facilitando a criação, personalização e publicação de páginas otimizadas para conversão.

## 📖 Visão Geral

Uma **landing page** é uma página da web criada com foco em um objetivo específico, como captar leads, promover um produto ou direcionar o visitante para uma ação definida.  
O sistema PerfectLandingPage permitirá que membros da ITA Júnior configurem e personalizem páginas rapidamente, a partir de **modelos pré-definidos**, reduzindo tempo de entrega e garantindo padronização.

Além disso, o sistema integrará **coleta automática de métricas digitais**, oferecendo relatórios que auxiliam na análise de desempenho e na otimização de campanhas.

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

---

📅 **Data da versão inicial do documento de requisitos:** 26 de agosto de 2025  
👥 **Equipe:**  
- Cícero Nunes da Silva Neto  
- Marcelo Hippolyto de Sandes Peixoto  
- Pablo Carvalho do Nascimentos dos Santos  
- Pedro Henrique Diogenes da Fonseca  
