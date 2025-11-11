/*
  Roda a página de clientes, onde é possível adicionar, editar e excluir clientes.
*/

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppFooter from '../../components/AppFooter';
import { load, save } from '../../lib/storage';
import { uid } from '../../lib/uid';

export default function ClientsPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ id: null, nome: '', setor: '' });
  const [error, setError] = useState(null);

  useEffect(() => setList(load('clientes', [])), []);

  const persist = (next) => {
    setList(next);
    save('clientes', next);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nome.trim()) {
      setError('Por favor, insira um nome para o cliente');
      return;
    }

    if (form.id) {
      // Editando cliente existente
      const updatedList = list.map((c) =>
        c.id === form.id ? { ...c, ...form } : c,
      );
      persist(updatedList);
    } else {
      // Criando novo cliente
      const newId = uid();
      const novoCliente = { id: newId, nome: form.nome, setor: form.setor };
      persist([novoCliente, ...list]);
    }
    // Limpa o formulário
    setForm({ id: null, nome: '', setor: '' });
  };

  const edit = (c) => {
    setForm(c);
  };

  const del = (id) => {
    const next = list.filter((c) => c.id !== id);
    persist(next);
  };

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Clientes
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                Gerencie clientes e seus dados básicos.
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
        {/* Mensagem de erro */}
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
          <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Adicionar Cliente
            </h2>
            <form onSubmit={onSubmit} className="mt-4 grid gap-4">
              <div className="grid gap-1.5">
                <label
                  htmlFor="nome"
                  className="text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Nome
                </label>
                <input
                  id="nome"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                  placeholder="Ex.: Nome do Cliente"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <label
                  htmlFor="setor"
                  className="text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Setor (opcional)
                </label>
                <input
                  id="setor"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                  placeholder="Ex.: Tecnologia, Educação"
                  value={form.setor}
                  onChange={(e) => setForm({ ...form, setor: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <button className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-sky-700/40">
                  {/* <span className="sr-only">{form.id ? "Salvar" : "Adicionar"} cliente</span> */}
                  {form.id ? 'Salvar' : 'Adicionar'}
                </button>
                {form.id && (
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                    onClick={() => setForm({ id: null, nome: '', setor: '' })}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>
          {/* Lista de clientes */}
          <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Lista de Clientes
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total: {list.length}
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {list.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Sem clientes ainda.
                </div>
              )}
              {list.map((c) => (
                <div
                  key={c.id}
                  className="relative overflow-hidden rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:ring-sky-800">
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
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {c.nome}
                        </div>
                      </div>
                      {c.setor && (
                        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {c.setor}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        ID: {c.id}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                        onClick={() => edit(c)}
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
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40 dark:focus:ring-red-900/60"
                        onClick={() => del(c.id)}
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
                        Excluir Cliente
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
