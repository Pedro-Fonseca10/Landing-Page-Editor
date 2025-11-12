/*
  Testes unitários para as funções load/save do storage local.
  Garante fallback padrão, serialização correta e logs de erro em JSON inválido.
*/

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { load, save } from '../../../src/lib/storage';

const storageKey = (name) => `plp:${name}`;

describe('storage utils', () => {
  const bucket = 'clientes';

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('retorna fallback quando não existe dado salvo', () => {
    const fallback = [{ id: 1 }];
    expect(load(bucket, fallback)).toEqual(fallback);
  });

  it('lê e desserializa o valor salvo no localStorage', () => {
    const data = [{ id: '42', nome: 'ACME' }];
    localStorage.setItem(storageKey(bucket), JSON.stringify(data));

    expect(load(bucket, [])).toEqual(data);
  });

  it('trata JSON inválido e registra erro sem quebrar a aplicação', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem(storageKey(bucket), '{not-json');

    const fallback = ['default'];
    expect(load(bucket, fallback)).toEqual(fallback);
    expect(spy).toHaveBeenCalledWith(
      `Erro ao carregar ${bucket}:`,
      expect.any(SyntaxError),
    );
  });

  it('serializa dados ao salvar', () => {
    const payload = [{ id: '1', nome: 'Cliente' }];
    save(bucket, payload);

    expect(localStorage.getItem(storageKey(bucket))).toEqual(
      JSON.stringify(payload),
    );
  });
});
