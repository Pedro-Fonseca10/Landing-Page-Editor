import { supabase } from '../../lib/api/supabaseClient';
import { ensureApiSuccess, withFallback } from '../../lib/api/remoteHelpers';
import { makeSlug } from './public';
import { Repo } from '../../lib/repo';

const TABLE = 'lps';

const mapRowToLp = (row) => ({
  ...row,
  id_cliente: row?.cliente_id ?? row?.id_cliente ?? '',
  id_template: row?.template ?? row?.id_template ?? 'saas',
  content: row?.content ?? {},
});

const fallbackList = () => Repo.list('lps');
const fallbackGet = (id) => Repo.get('lps', id);
const fallbackFindBySlug = (slug) =>
  fallbackList().find((lp) => lp.slug === slug) ?? null;

export async function listLandingPages() {
  return withFallback(
    async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false });
      ensureApiSuccess(error, 'Falha ao listar landing pages');
      return (data || []).map(mapRowToLp);
    },
    () => fallbackList(),
    'Supabase indisponível, retornando dados locais de landing pages.',
  );
}

export async function fetchLandingPage(id) {
  return withFallback(
    async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      ensureApiSuccess(error, 'Falha ao carregar a landing page');
      return data ? mapRowToLp(data) : null;
    },
    () => fallbackGet(id),
    'Supabase indisponível, buscando LP localmente.',
  );
}

export async function fetchLandingPageBySlug(slug) {
  return withFallback(
    async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      ensureApiSuccess(error, 'Falha ao carregar a landing page pública');
      return data ? mapRowToLp(data) : null;
    },
    () => fallbackFindBySlug(slug),
    'Supabase indisponível, consultando slug local.',
  );
}

export async function createLandingPage(payload) {
  const { titulo, id_cliente, id_template = 'saas', content = {} } = payload;
  if (!titulo) throw new Error('Título é obrigatório para criar a LP');
  if (!id_cliente) throw new Error('Selecione um cliente antes de salvar');

  const slugSeed =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const slug = makeSlug(titulo, slugSeed);

  const insertPayload = {
    cliente_id: id_cliente,
    titulo,
    template: id_template,
    slug,
    content,
  };

  return withFallback(
    async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .insert(insertPayload)
        .select()
        .single();

      ensureApiSuccess(error, 'Falha ao criar a landing page');
      return mapRowToLp(data);
    },
    () => {
      const fallbackRecord = {
        ...insertPayload,
        id: insertPayload.id ?? slugSeed,
      };
      return Repo.add('lps', fallbackRecord);
    },
    'Supabase indisponível, salvando LP localmente.',
  );
}

export async function updateLandingPage(id, patch) {
  const next = {};
  if (patch.titulo) next.titulo = patch.titulo;
  if (patch.id_cliente) next.cliente_id = patch.id_cliente;
  if (patch.id_template) next.template = patch.id_template;
  if (patch.content) next.content = patch.content;
  if (patch.slug) next.slug = patch.slug;

  if (Object.keys(next).length === 0) return fetchLandingPage(id);

  return withFallback(
    async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .update(next)
        .eq('id', id)
        .select()
        .single();

      ensureApiSuccess(error, 'Falha ao atualizar a landing page');
      return mapRowToLp(data);
    },
    () => {
      Repo.update('lps', id, next);
      return fallbackGet(id);
    },
    'Supabase indisponível, atualizando LP localmente.',
  );
}

export async function deleteLandingPage(id) {
  return withFallback(
    async () => {
      const { error } = await supabase.from(TABLE).delete().eq('id', id);
      ensureApiSuccess(error, 'Falha ao excluir a landing page');
      return true;
    },
    () => {
      Repo.remove('lps', id);
      return true;
    },
    'Supabase indisponível, excluindo LP localmente.',
  );
}
