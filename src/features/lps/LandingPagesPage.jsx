/*
  Página de gerenciamento de landing pages.
*/

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppFooter from '../../components/AppFooter';
import { Repo } from '../../lib/repo';
import { TEMPLATES } from '../templates/catalog';
import { exportLandingPageZip } from './exporter';
import { generateUniqueId } from '../../lib/uid';

// Página de gerenciamento de landing pages
export default function LandingPagesPage() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    id: null,
    titulo: '',
    id_cliente: '',
    id_template: 'saas',
  });
  const [error, setError] = useState(null);
  const [renameState, setRenameState] = useState(null);

  // Atualização constante das lps
  const reload = () => {
    const clientesData = Repo.list('clientes');
    const lpsData = Repo.list('lps');
    setClientes(clientesData);
    setList(lpsData);
  };
  useEffect(() => {
    reload();
  }, []);

  const startRename = (lp) => {
    const current = Repo.get('lps', lp.id);
    const currentTitle = current?.titulo ?? lp.titulo ?? '';
    setRenameState({ id: lp.id, error: null, initialValue: currentTitle });
  };

  const cancelRename = () => {
    setRenameState(null);
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (!renameState?.id) return;

    const data = new FormData(e.currentTarget);
    const nextValue = String(data.get('renameTitulo') ?? '').trim();

    if (!nextValue) {
      setRenameState((prev) =>
        prev
          ? {
              ...prev,
              error: 'Por favor, insira um novo nome para a landing page',
            }
          : prev,
      );
      return;
    }

    Repo.update('lps', renameState.id, { titulo: nextValue });
    setRenameState(null);
    reload();
  };

  // Preencher os dados da landing page a ser criada
  const onSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!form.titulo.trim()) {
      setError('Por favor, insira um título para a landing page');
      return;
    }
    if (!form.id_cliente) {
      setError('Por favor, selecione um cliente');
      return;
    }

    if (form.id) {
      Repo.update('lps', form.id, form);
    } else {
      const existingIds = list.map((lp) => lp.id);
      const newId = generateUniqueId(existingIds);
      const novaLP = { ...form, id: newId, content: undefined };
      Repo.add('lps', novaLP);
    }

    setForm({ id: null, titulo: '', id_cliente: '', id_template: 'saas' });
    reload();
  };
  // Deletar uma landing page
  const delOne = (lpId) => {
    Repo.remove('lps', lpId);
    reload();
  };

  const clientesById = useMemo(
    () => Object.fromEntries(clientes.map((c) => [String(c.id), c])),
    [clientes],
  );
  const templateName = (id) => TEMPLATES.find((t) => t.id === id)?.nome ?? id;

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Landing Pages
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                Crie, edite e gerencie as páginas dos clientes.
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

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          >
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.5a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Adicionar/Editar */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Adicionar/Editar Landing Page
            </h2>
            <form onSubmit={onSubmit} className="mt-4 grid gap-4">
              <div className="grid gap-1.5">
                <label
                  htmlFor="titulo"
                  className="text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Título
                </label>
                <input
                  id="titulo"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                  placeholder="Ex.: LP SaaS - Cliente X"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="id_cliente"
                  className="text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Cliente
                </label>
                <div className="relative">
                  <select
                    id="id_cliente"
                    className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-10 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={form.id_cliente}
                    onChange={(e) =>
                      setForm({ ...form, id_cliente: e.target.value })
                    }
                  >
                    <option value="">Vincular a cliente…</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70"
                    viewBox="0 0 20 20"
                    fill="#0ea5e9"
                    aria-hidden="true"
                  >
                    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
                  </svg>
                </div>
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="id_template"
                  className="text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Template
                </label>
                <div className="relative">
                  <select
                    id="id_template"
                    className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-10 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={form.id_template}
                    onChange={(e) =>
                      setForm({ ...form, id_template: e.target.value })
                    }
                  >
                    {TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70"
                    viewBox="0 0 20 20"
                    fill="#0ea5e9"
                    aria-hidden="true"
                  >
                    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
                  </svg>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-sky-700/40">
                  {form.id ? 'Salvar' : 'Adicionar'}
                </button>
                {form.id && (
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                    onClick={() =>
                      setForm({
                        id: null,
                        titulo: '',
                        id_cliente: '',
                        id_template: 'saas',
                      })
                    }
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Lista */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Lista de Landing Pages
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total: {list.length}
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {list.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Sem landing pages ainda.
                </div>
              )}

              {list.map((lp) => (
                <div
                  key={lp.id}
                  className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="w-full flex-1">
                      <div className="flex items-start gap-3 lg:items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:ring-violet-800">
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
                            <rect x="3" y="3" width="18" height="14" rx="2" />
                            <path d="M3 7h18" />
                            <path d="M7 21h10" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          {renameState?.id === lp.id ? (
                            <form
                              key={`rename-${lp.id}`}
                              onSubmit={handleRenameSubmit}
                              className="flex flex-col gap-3 lg:flex-row lg:items-center"
                            >
                              <input
                                autoFocus
                                aria-label="Editar nome da landing page"
                                name="renameTitulo"
                                className="w-full flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                                defaultValue={renameState.initialValue ?? lp.titulo ?? ''}
                                onInput={() =>
                                  setRenameState((prev) =>
                                    prev ? { ...prev, error: null } : prev,
                                  )
                                }
                              />
                              <div className="flex flex-wrap gap-2 lg:justify-end">
                                <button
                                  type="submit"
                                  className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-500 dark:hover:bg-sky-400 dark:focus:ring-sky-700/40"
                                >
                                  Salvar
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-600/40"
                                  onClick={cancelRename}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100">
                              <span className="block truncate">{lp.titulo}</span>
                            </div>
                          )}
                          {renameState?.id === lp.id && renameState?.error ? (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                              {renameState.error}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Cliente:{' '}
                        {clientesById[String(lp.id_cliente)]?.nome ?? '—'} ·
                        Template: {templateName(lp.id_template)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        ID: {lp.id}
                      </div>
                    </div>

                    <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
                      {renameState?.id === lp.id ? null : (
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                          type="button"
                          onClick={() => startRename(lp)}
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
                            <path d="M5 20h14" />
                            <path d="M9 20l3-16 3 16" />
                            <path d="M8 12h8" />
                          </svg>
                          Renomear
                        </button>
                      )}

                      <Link
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                        to={`/lps/${lp.id}/edit`}
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
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                        Editar
                      </Link>

                      <Link
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                        to={`/preview/${lp.id}`}
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
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16l4-4-4-4" />
                          <path d="M8 12h8" />
                        </svg>
                        Visualizar
                      </Link>

                      <button
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                        onClick={() => exportLandingPageZip(lp)}
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
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Exportar
                      </button>

                      <button
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40 dark:focus:ring-red-900/60"
                        onClick={() => delOne(lp.id)}
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
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
