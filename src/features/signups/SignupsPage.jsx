/*
  Página de listagem de cadastros feitos via Landing Pages.
*/

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppFooter from '../../components/AppFooter';
import { Repo } from '../../lib/repo';

// Componente de listagem de cadastros
export default function SignupsPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [lps, setLps] = useState([]);

  const reload = () => {
    setList(Repo.list('cadastros'));
    setLps(Repo.list('lps'));
  };

  useEffect(() => {
    reload();
  }, []);

  const del = (id) => {
    Repo.remove('cadastros', id);
    reload();
  };
  // Formata data ISO
  const fmtDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso || '';
    }
  };
  // Cria um dicionário de LPs por ID para acesso rápido
  const lpsById = useMemo(
    () => Object.fromEntries(lps.map((lp) => [String(lp.id), lp])),
    [lps],
  );
  // Renderiza a LP associada ao cadastro
  const renderLp = (s) => {
    const id = s.lp_id ?? s.lpId;
    const lp = id ? lpsById[String(id)] : null;
    if (lp) return `${lp.titulo} - ${lp.id}`;
    if (id) return `ID: ${id}`;
    return s.lp_slug || '—';
  };

  //  Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Cadastrados
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                Pessoas que se cadastraram via Landing Pages.
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
              onClick={() => navigate('/dashboard')}
              type="button"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Lista de cadastrados
            </h2>
            <button
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={reload}
            >
              Recarregar
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/40">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">
                    Nome
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">
                    E-mail
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">
                    LP
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">
                    Data
                  </th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {list.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-4 text-slate-600 dark:text-slate-300"
                      colSpan={5}
                    >
                      Sem cadastros ainda.
                    </td>
                  </tr>
                ) : (
                  list.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                        {s.nome}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {s.email}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {renderLp(s)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {fmtDate(s.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40 dark:focus:ring-red-900/60"
                          onClick={() => del(s.id)}
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <AppFooter />
    </div>
  );
}
