/*
  Testes de integração da página de clientes.
  Cobrem estado vazio, leitura de clientes persistidos e fluxo de criação com validação de formulário.
*/

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClientsPage from '../../../src/features/clients/ClientsPage';

const renderClients = () =>
  render(
    <MemoryRouter>
      <ClientsPage />
    </MemoryRouter>,
  );

const storageKey = 'plp:clientes';

describe('ClientsPage (integration)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mostra mensagem de lista vazia quando não há clientes', async () => {
    renderClients();

    expect(await screen.findByText('Sem clientes ainda.')).toBeInTheDocument();
    expect(await screen.findByText('Total: 0')).toBeInTheDocument();
  });

  it('carrega clientes salvos e exibe dados básicos', async () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        { id: '1', nome: 'Pedro', setor: 'Tecnologia' },
        { id: '2', nome: 'Pablo', setor: '' },
      ]),
    );

    renderClients();

    expect(await screen.findByText('Pedro')).toBeInTheDocument();
    expect(await screen.findByText('Tecnologia')).toBeInTheDocument();
    expect(await screen.findByText('Total: 2')).toBeInTheDocument();
  });

  it('valida o formulário e persiste novo cliente', async () => {
    renderClients();
    await screen.findByText('Sem clientes ainda.');

    const [submitButton] = screen.getAllByRole('button', { name: 'Adicionar' });
    fireEvent.click(submitButton);
    expect(
      await screen.findByText('Por favor, insira um nome para o cliente'),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'Cliente' },
    });
    fireEvent.change(screen.getByLabelText('Setor (opcional)'), {
      target: { value: 'Educação' },
    });
    fireEvent.click(submitButton);

    expect(await screen.findByText('Cliente')).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(storageKey));
    expect(stored[0]).toMatchObject({
      nome: 'Cliente',
      setor: 'Educação',
    });
  });
});
