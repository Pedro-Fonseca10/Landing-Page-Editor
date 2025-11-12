/*
  Testes unitários para o wrapper Repo de CRUD em localStorage.
  Exercita listagem, busca, inserção, atualização e remoção garantindo cópias imutáveis.
*/

import { describe, it, expect, beforeEach } from 'vitest';
import { Repo } from '../../../src/lib/repo';

const storageKey = (name) => `plp:${name}`;

const seed = (name, data) => {
  localStorage.setItem(storageKey(name), JSON.stringify(data));
};

const read = (name) =>
  JSON.parse(localStorage.getItem(storageKey(name)) ?? 'null');

describe('Repo util', () => {
  const bucket = 'clientes';

  beforeEach(() => {
    localStorage.clear();
  });

  it('list retorna cópia de todos os registros', () => {
    seed(bucket, [{ id: '1', nome: 'Alice' }]);

    const result = Repo.list(bucket);
    expect(result).toEqual([{ id: '1', nome: 'Alice' }]);

    result[0].nome = 'Alterado';
    expect(read(bucket)[0].nome).toBe('Alice');
  });

  it('get busca por id convertendo para string', () => {
    seed(bucket, [{ id: 123, nome: 'Bob' }]);

    expect(Repo.get(bucket, '123')).toEqual({ id: 123, nome: 'Bob' });
    expect(Repo.get(bucket, '999')).toBeNull();
  });

  it('add insere no início da lista e mantém imutabilidade', () => {
    seed(bucket, [{ id: '1', nome: 'Alice' }]);

    const created = Repo.add(bucket, { id: '2', nome: 'Carol' });
    expect(created).toEqual({ id: '2', nome: 'Carol' });

    const persisted = read(bucket);
    expect(persisted.map((c) => c.id)).toEqual(['2', '1']);

    created.nome = 'Mutado';
    expect(persisted[0].nome).toBe('Carol');
  });

  it('update aplica patch apenas no item correspondente', () => {
    seed(bucket, [
      { id: '1', nome: 'Alice', setor: 'Saúde' },
      { id: '2', nome: 'Bob', setor: 'Educação' },
    ]);

    Repo.update(bucket, '2', { setor: 'Financeiro', extra: 'XPTO' });

    const after = read(bucket);
    expect(after.find((c) => c.id === '2')).toMatchObject({
      nome: 'Bob',
      setor: 'Financeiro',
      extra: 'XPTO',
    });
    expect(after.find((c) => c.id === '1')).toMatchObject({
      nome: 'Alice',
      setor: 'Saúde',
    });
  });

  it('remove exclui o item indicado', () => {
    seed(bucket, [
      { id: '1', nome: 'Alice' },
      { id: '2', nome: 'Bob' },
    ]);

    Repo.remove(bucket, '1');

    expect(read(bucket)).toEqual([{ id: '2', nome: 'Bob' }]);
  });
});
