import { supabase } from '../../lib/supabase';
import { makeSlug } from './public';
import { Repo } from '../../lib/repo';

const TABLE = 'lps';

const mapRowToLp = (row) => ({
  ...row,
  id_cliente: row?.cliente_id ?? row?.id_cliente ?? '',
  id_template: row?.template ?? row?.id_template ?? 'saas',
  content: row?.content ?? {},
});

const ensureOk = (error, context) => {
  if (error) {
    const message =
      typeof error.message === 'string'
        ? error.message
        : 'Erro ao comunicar com Supabase';
    throw new Error(context ? `${context}: ${message}` : message);
  }
};

const fallbackList = () => Repo.list('lps');
const fallbackGet = (id) => Repo.get('lps', id);
const fallbackFindBySlug = (slug) =>
  fallbackList().find((lp) => lp.slug === slug) ?? null;

export async function listLandingPages() {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    ensureOk(error, 'Falha ao listar landing pages');
    return (data || []).map(mapRowToLp);
  } catch (err) {
    console.warn('Supabase indisponível, retornando dados locais.', err);
    return fallbackList();
  }
}

export async function fetchLandingPage(id) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    ensureOk(error, 'Falha ao carregar a landing page');
    return data ? mapRowToLp(data) : null;
  } catch (err) {
    console.warn('Supabase indisponível, buscando LP localmente.', err);
    return fallbackGet(id);
  }
}

export async function fetchLandingPageBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    ensureOk(error, 'Falha ao carregar a landing page pública');
    return data ? mapRowToLp(data) : null;
  } catch (err) {
    console.warn('Supabase indisponível, consultando slug local.', err);
    return fallbackFindBySlug(slug);
  }
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

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(insertPayload)
      .select()
      .single();

    ensureOk(error, 'Falha ao criar a landing page');
    return mapRowToLp(data);
  } catch (err) {
    console.warn('Supabase indisponível, salvando LP localmente.', err);
    const fallbackRecord = {
      ...insertPayload,
      id: insertPayload.id ?? slugSeed,
    };
    return Repo.add('lps', fallbackRecord);
  }
}

export async function updateLandingPage(id, patch) {
  const next = {};
  if (patch.titulo) next.titulo = patch.titulo;
  if (patch.id_cliente) next.cliente_id = patch.id_cliente;
  if (patch.id_template) next.template = patch.id_template;
  if (patch.content) next.content = patch.content;
  if (patch.slug) next.slug = patch.slug;

  if (Object.keys(next).length === 0) return fetchLandingPage(id);

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update(next)
      .eq('id', id)
      .select()
      .single();

    ensureOk(error, 'Falha ao atualizar a landing page');
    return mapRowToLp(data);
  } catch (err) {
    console.warn('Supabase indisponível, atualizando LP localmente.', err);
    Repo.update('lps', id, next);
    return fallbackGet(id);
  }
}

export async function deleteLandingPage(id) {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    ensureOk(error, 'Falha ao excluir a landing page');
  } catch (err) {
    console.warn('Supabase indisponível, excluindo LP localmente.', err);
    Repo.remove('lps', id);
  }
}
