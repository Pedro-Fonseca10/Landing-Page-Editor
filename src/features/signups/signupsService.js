import { supabase } from '../../lib/api/supabaseClient';
import { ensureApiSuccess, withFallback } from '../../lib/api/remoteHelpers';
import { Repo } from '../../lib/repo';
import { uid } from '../../lib/uid';

const TABLE = 'lp_leads';
const STORAGE_KEY = 'cadastros';

const mapRow = (row) => ({
  id: row?.id,
  nome: row?.nome ?? row?.payload?.nome ?? '',
  email: row?.email ?? row?.payload?.email ?? '',
  lp_id: row?.lp_id ?? row?.lpId ?? null,
  client_id: row?.client_id ?? row?.clientId ?? null,
  lp_slug: row?.payload?.lp_slug ?? row?.lp_slug ?? row?.slug ?? '',
  status: row?.status ?? 'new',
  source: row?.source ?? 'signup_button',
  createdAt: row?.created_at ?? row?.createdAt ?? null,
});

const fallbackList = () => Repo.list(STORAGE_KEY);

export async function listSignups() {
  return withFallback(
    async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false });
      ensureApiSuccess(error, 'Falha ao listar cadastros');
      return (data ?? []).map(mapRow);
    },
    () => fallbackList().map(mapRow),
    'Supabase indisponível ao listar cadastros, retornando dados locais.',
  );
}

const ensureLocalUniqueEmail = (email) => {
  const emailLower = email.toLowerCase();
  const existing = Repo.list(STORAGE_KEY);
  const duplicate = existing.find(
    (x) => String(x.email || '').trim().toLowerCase() === emailLower,
  );
  if (duplicate) {
    throw new Error('Este e-mail já está cadastrado.');
  }
};

export async function createSignup({
  nome,
  email,
  lpId,
  clientId,
  lpSlug,
  source = 'signup_button',
  utm = null,
}) {
  const safeNome = String(nome ?? '').trim();
  const safeEmail = String(email ?? '').trim();

  if (!safeNome || !safeEmail) {
    throw new Error('Informe nome e e-mail para concluir o cadastro.');
  }
  if (!lpId) throw new Error('Landing page inválida para cadastro.');
  if (!clientId) {
    throw new Error('Esta página não está vinculada a um cliente.');
  }
  const normalizedEmail = safeEmail.toLowerCase();
  const payload = {
    nome: safeNome,
    email: safeEmail,
    lp_slug: lpSlug,
  };

  const insertPayload = {
    lp_id: lpId,
    client_id: clientId,
    status: 'new',
    nome: safeNome,
    email: safeEmail,
    email_normalized: normalizedEmail,
    payload,
    source,
    utm,
  };

  return withFallback(
    async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .insert(insertPayload)
        .select()
        .single();
      if (error && String(error.message).includes('lp_leads_email_unique')) {
        throw new Error('Este e-mail já está cadastrado.');
      }
      ensureApiSuccess(error, 'Falha ao salvar cadastro');
      return mapRow(data);
    },
    () => {
      ensureLocalUniqueEmail(safeEmail);
      const fallbackRecord = {
        id: uid(),
        nome: safeNome,
        email: safeEmail,
        lp_id: lpId,
        client_id: clientId,
        lp_slug: lpSlug,
        createdAt: new Date().toISOString(),
        source,
      };
      return Repo.add(STORAGE_KEY, fallbackRecord);
    },
    'Supabase indisponível, salvando cadastro localmente.',
  );
}

export async function deleteSignup(id) {
  return withFallback(
    async () => {
      const { error } = await supabase.from(TABLE).delete().eq('id', id);
      ensureApiSuccess(error, 'Falha ao excluir cadastro');
      return true;
    },
    () => {
      Repo.remove(STORAGE_KEY, id);
      return true;
    },
    'Supabase indisponível, removendo cadastro localmente.',
  );
}
