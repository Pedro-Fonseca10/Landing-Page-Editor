-- Dados iniciais para desenvolvimento local

-- Clientes
insert into public.clients (id, nome, setor, created_at)
values
  ('11111111-1111-1111-1111-111111111111', 'Orion Tech', 'Tecnologia', now() - interval '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'Lumos Eventos', 'Eventos', now() - interval '3 days'),
  ('33333333-3333-3333-3333-333333333333', 'Atlas Edu', 'Educação', now() - interval '1 day')
on conflict (id) do nothing;

-- Templates disponíveis
insert into public.templates (id, name, slug, category, description, default_content)
values
  (
    'saas',
    'Template SaaS',
    'template-saas',
    'SaaS',
    'Landing page para produtos SaaS B2B',
    jsonb_build_object('hero', jsonb_build_object('title', 'Escale seu SaaS', 'cta', 'Comece agora'))
  ),
  (
    'evento',
    'Template Evento',
    'template-evento',
    'Evento/Curso',
    'Divulgação de eventos presenciais ou online',
    jsonb_build_object('hero', jsonb_build_object('title', 'Garanta a sua vaga', 'cta', 'Inscrever-se'))
  ),
  (
    'd2c',
    'Template Produto',
    'template-d2c',
    'Produto D2C',
    'Landing page para produtos físicos',
    jsonb_build_object('hero', jsonb_build_object('title', 'Conheça o novo produto', 'cta', 'Comprar'))
  )
on conflict (id) do nothing;

-- Landing pages de exemplo
insert into public.lps (id, cliente_id, titulo, slug, template, content, published, created_at, updated_at)
values
  (
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    'Orion Tech - Plataforma SaaS',
    'orion-tech-plataforma-saas',
    'saas',
    jsonb_build_object(
      'hero',
      jsonb_build_object('title', 'Automatize seus processos', 'subtitle', 'Solução SaaS feita para operações complexas')
    ),
    true,
    now() - interval '2 days',
    now() - interval '1 day'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbb2',
    '22222222-2222-2222-2222-222222222222',
    'Lumos Summit 2025',
    'lumos-summit-2025',
    'evento',
    jsonb_build_object(
      'hero',
      jsonb_build_object('title', 'Participe do maior evento de inovação', 'subtitle', '12 a 14 de agosto — São Paulo')
    ),
    true,
    now() - interval '4 days',
    now() - interval '2 days'
  )
on conflict (id) do nothing;

-- Versões publicadas
insert into public.lp_versions (lp_id, template_id, content, published, published_at, created_at)
values
  (
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    'saas',
    jsonb_build_object('hero', jsonb_build_object('title', 'Automatize seus processos', 'cta', 'Testar agora')),
    true,
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbb2',
    'evento',
    jsonb_build_object('hero', jsonb_build_object('title', 'Lumos Summit 2025', 'cta', 'Garantir ingresso')),
    true,
    now() - interval '2 days',
    now() - interval '2 days'
  );

-- Leads coletados
insert into public.lp_leads (id, lp_id, client_id, status, nome, email, email_normalized, payload, source, created_at, updated_at)
values
  (
    '44444444-4444-4444-4444-444444444444',
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    'qualified',
    'Marina Andrade',
    'marina@contoso.com',
    lower('marina@contoso.com'),
    jsonb_build_object('nome', 'Marina Andrade', 'email', 'marina@contoso.com'),
    'paid_search',
    now() - interval '12 hours',
    now() - interval '6 hours'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbb2',
    '22222222-2222-2222-2222-222222222222',
    'new',
    'João Prado',
    'joao@lumos.com',
    lower('joao@lumos.com'),
    jsonb_build_object('nome', 'João Prado', 'email', 'joao@lumos.com'),
    'email',
    now() - interval '1 day',
    now() - interval '1 day'
  )
on conflict (id) do nothing;

-- Eventos registrados
insert into public.lp_events (lp_id, event_type, visitor_id, session_id, metadata, occurred_at)
values
  (
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    'page_view',
    gen_random_uuid(),
    gen_random_uuid(),
    jsonb_build_object('device', 'desktop'),
    now() - interval '20 minutes'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    'cta_click',
    gen_random_uuid(),
    gen_random_uuid(),
    jsonb_build_object('cta', 'Testar agora'),
    now() - interval '15 minutes'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbb2',
    'form_submit',
    gen_random_uuid(),
    gen_random_uuid(),
    jsonb_build_object('ticket', 'vip'),
    now() - interval '3 hours'
  );

-- Métricas agregadas
insert into public.daily_lp_metrics (lp_id, metric_date, page_views, conversions, ctr, bounce_rate)
values
  (
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    current_date - 1,
    320,
    45,
    14.06,
    42.5
  ),
  (
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbb2',
    current_date - 1,
    180,
    22,
    12.22,
    38.1
  )
on conflict (lp_id, metric_date) do nothing;

-- Pedidos e pagamentos
insert into public.orders (id, lp_id, client_id, amount, currency, status, notes, created_at, updated_at)
values
  (
    '66666666-6666-6666-6666-666666666666',
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    12500,
    'BRL',
    'sent',
    'Implementação inicial da landing page customizada',
    now() - interval '1 day',
    now() - interval '12 hours'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbb2',
    '22222222-2222-2222-2222-222222222222',
    8900,
    'BRL',
    'approved',
    'Pacote de divulgação completo',
    now() - interval '2 days',
    now() - interval '6 hours'
  )
on conflict (id) do nothing;

insert into public.payments (id, order_id, provider, provider_payment_id, status, payload, paid_at, created_at)
values
  (
    '88888888-8888-8888-8888-888888888888',
    '77777777-7777-7777-7777-777777777777',
    'stripe',
    'pi_01HVK2GW',
    'paid',
    jsonb_build_object('method', 'credit_card', 'last4', '4242'),
    now() - interval '5 hours',
    now() - interval '6 hours'
  )
on conflict (id) do nothing;
