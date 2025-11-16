import { supabase } from '../../lib/api/supabaseClient';
import { ensureApiSuccess, withFallback } from '../../lib/api/remoteHelpers';
import { Repo } from '../../lib/repo';

const countLocal = (bucket) => Repo.list(bucket).length;

const countTable = (table, bucket, label) =>
  withFallback(
    async () => {
      const { error, count } = await supabase
        .from(table)
        .select('*', { head: true, count: 'exact' });
      ensureApiSuccess(error, `Falha ao contar ${label}`);
      return count ?? 0;
    },
    () => countLocal(bucket),
    `Supabase indisponível ao contar ${label}.`,
  );

export async function fetchDashboardCounts() {
  const [clientes, lps, cadastros] = await Promise.all([
    countTable('clients', 'clientes', 'clientes'),
    countTable('lps', 'lps', 'landing pages'),
    countTable('lp_leads', 'cadastros', 'cadastros'),
  ]);

  return { clientes, lps, cadastros };
}
