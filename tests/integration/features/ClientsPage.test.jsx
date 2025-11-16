/*
  Testes de integração da página de clientes.
  Cobrem estado vazio, leitura de clientes persistidos e fluxo de criação com validação de formulário.
*/

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClientsPage from '../../../src/features/clients/ClientsPage';
import {
  listClients,
  createClient,
  updateClient,
  deleteClient,
} from '../../../src/features/clients/clientsService';

vi.mock('../../../src/features/clients/clientsService', () => ({
  listClients: vi.fn(),
  createClient: vi.fn(),
  updateClient: vi.fn(),
  deleteClient: vi.fn(),
}));

const renderClients = () =>
  render(
    <MemoryRouter>
      <ClientsPage />
    </MemoryRouter>,
  );

describe('ClientsPage (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listClients.mockReset();
    createClient.mockReset();
    updateClient.mockReset();
    deleteClient.mockReset();
    listClients.mockResolvedValue([]);
    createClient.mockResolvedValue({ id: 'mock-client' });
    updateClient.mockResolvedValue({ id: 'mock-client' });
    deleteClient.mockResolvedValue(true);
  });

  it('mostra mensagem de lista vazia quando não há clientes', async () => {
    listClients.mockResolvedValueOnce([]);
    renderClients();

    expect(await screen.findByText('Sem clientes ainda.')).toBeInTheDocument();
    expect(await screen.findByText('Total: 0')).toBeInTheDocument();
    expect(listClients).toHaveBeenCalledTimes(1);
  });

  it('carrega clientes salvos e exibe dados básicos', async () => {
    listClients.mockResolvedValueOnce([
      { id: '1', nome: 'Pedro', setor: 'Tecnologia' },
      { id: '2', nome: 'Pablo', setor: '' },
    ]);

    renderClients();

    expect(await screen.findByText('Pedro')).toBeInTheDocument();
    expect(await screen.findByText('Tecnologia')).toBeInTheDocument();
    expect(await screen.findByText('Total: 2')).toBeInTheDocument();
    expect(listClients).toHaveBeenCalledTimes(1);
  });

  it('valida o formulário e persiste novo cliente', async () => {
    listClients
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: '1', nome: 'Cliente', setor: 'Educação' },
      ]);
    createClient.mockResolvedValueOnce({
      id: '1',
      nome: 'Cliente',
      setor: 'Educação',
    });

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

    await waitFor(() =>
      expect(createClient).toHaveBeenCalledWith({
        nome: 'Cliente',
        setor: 'Educação',
      }),
    );
    expect(await screen.findByText('Cliente')).toBeInTheDocument();
    expect(listClients).toHaveBeenCalledTimes(2);
  });
});
