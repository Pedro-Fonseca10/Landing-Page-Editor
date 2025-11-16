import { supabase } from '../../lib/api/supabaseClient';
import { ensureApiSuccess, withFallback } from '../../lib/api/remoteHelpers';
import { Repo } from '../../lib/repo';
import { uid } from '../../lib/uid';

const TABLE = 'clients';
const STORAGE_KEY = 'clientes';

const mapRowToClient = (row) => ({
  id: row?.id,
  nome: row?.nome ?? '',
  setor: row?.setor ?? '',
  created_at: row?.created_at ?? null,
});

const fallbackList = () => Repo.list(STORAGE_KEY);
const fallbackGet = (id) => Repo.get(STORAGE_KEY, id);

export async function listClients() {
  return withFallback(
    async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false });
      ensureApiSuccess(error, 'Falha ao listar clientes');
      return (data ?? []).map(mapRowToClient);
    },
    () => fallbackList(),
    'Supabase indisponível ao listar clientes, retornando dados locais.',
  );
}

export async function createClient(payload) {
  const nome = String(payload?.nome ?? '').trim();
  const setor = String(payload?.setor ?? '').trim();

  if (!nome) throw new Error('Nome é obrigatório para criar o cliente');

  const insertPayload = { nome, setor };

  return withFallback(
    async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .insert(insertPayload)
        .select()
        .single();
      ensureApiSuccess(error, 'Falha ao criar cliente');
      return mapRowToClient(data);
    },
    () => {
      const fallbackRecord = {
        id: payload?.id ?? uid(),
        ...insertPayload,
      };
      return Repo.add(STORAGE_KEY, fallbackRecord);
    },
    'Supabase indisponível, salvando cliente localmente.',
  );
}

export async function updateClient(id, patch) {
  const next = {};
  if (typeof patch?.nome === 'string') {
    const trimmed = patch.nome.trim();
    if (!trimmed) throw new Error('Nome é obrigatório para o cliente');
    next.nome = trimmed;
  }
  if (typeof patch?.setor === 'string') {
    next.setor = patch.setor.trim();
  }

  if (Object.keys(next).length === 0) {
    return fallbackGet(id);
  }

  return withFallback(
    async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .update(next)
        .eq('id', id)
        .select()
        .single();
      ensureApiSuccess(error, 'Falha ao atualizar cliente');
      return mapRowToClient(data);
    },
    () => {
      Repo.update(STORAGE_KEY, id, next);
      return fallbackGet(id);
    },
    'Supabase indisponível, atualizando cliente localmente.',
  );
}

export async function deleteClient(id) {
  return withFallback(
    async () => {
      const { error } = await supabase.from(TABLE).delete().eq('id', id);
      ensureApiSuccess(error, 'Falha ao excluir cliente');
      return true;
    },
    () => {
      Repo.remove(STORAGE_KEY, id);
      return true;
    },
    'Supabase indisponível, excluindo cliente localmente.',
  );
}
