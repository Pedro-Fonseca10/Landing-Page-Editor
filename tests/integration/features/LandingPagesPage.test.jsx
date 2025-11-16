/*
  Testes de integração da LandingPagesPage.
  Cobrem estados vazios, renderização de itens existentes, validações de formulário e operações de criação/exclusão.
*/

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPagesPage from '../../../src/features/lps/LandingPagesPage';
import {
  listLandingPages,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
} from '../../../src/features/lps/lpsService';
import { listClients } from '../../../src/features/clients/clientsService';

vi.mock('../../../src/features/lps/exporter', () => ({
  exportLandingPageZip: vi.fn(),
}));

vi.mock('../../../src/features/lps/lpsService', () => ({
  listLandingPages: vi.fn(),
  createLandingPage: vi.fn(),
  updateLandingPage: vi.fn(),
  deleteLandingPage: vi.fn(),
}));

vi.mock('../../../src/features/clients/clientsService', () => ({
  listClients: vi.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <LandingPagesPage />
    </MemoryRouter>,
  );

describe('LandingPagesPage (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listLandingPages.mockReset();
    createLandingPage.mockReset();
    updateLandingPage.mockReset();
    deleteLandingPage.mockReset();
    listClients.mockReset();
    listLandingPages.mockResolvedValue([]);
    listClients.mockResolvedValue([]);
    createLandingPage.mockResolvedValue({ id: 'lp-mock' });
    updateLandingPage.mockResolvedValue({ id: 'lp-mock' });
    deleteLandingPage.mockResolvedValue(true);
  });

  it('mostra mensagem vazia e total 0 quando não há landing pages', async () => {
    listClients.mockResolvedValueOnce([]);
    listLandingPages.mockResolvedValueOnce([]);
    renderPage();

    expect(await screen.findByText('Sem landing pages ainda.')).toBeInTheDocument();
    expect(await screen.findByText('Total: 0')).toBeInTheDocument();
    expect(listLandingPages).toHaveBeenCalledTimes(1);
  });

  it('renderiza lista com cliente vinculado e nome do template', async () => {
    listClients.mockResolvedValueOnce([{ id: 'c1', nome: 'Cliente XPTO' }]);
    listLandingPages.mockResolvedValueOnce([
      { id: 'lp-1', titulo: 'LP Demo', id_cliente: 'c1', id_template: 'evento' },
    ]);

    renderPage();

    expect(await screen.findByText('LP Demo')).toBeInTheDocument();
    expect(screen.getByText(/Cliente: Cliente XPTO/)).toBeInTheDocument();
    expect(screen.getByText(/Template: Evento\/Curso/)).toBeInTheDocument();
    expect(await screen.findByText('Total: 1')).toBeInTheDocument();
  });

  it('valida título e cliente obrigatórios antes de salvar', async () => {
    listClients.mockResolvedValueOnce([{ id: 'c1', nome: 'Cliente XPTO' }]);

    renderPage();
    await screen.findByText('Cliente XPTO');

    const submitButton = screen.getByRole('button', { name: 'Adicionar' });
    fireEvent.click(submitButton);
    expect(
      await screen.findByText('Por favor, insira um título para a landing page'),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Minha LP' },
    });
    fireEvent.click(submitButton);
    expect(
      await screen.findByText('Por favor, selecione um cliente'),
    ).toBeInTheDocument();
  });

  it('cria nova landing page e reseta o formulário', async () => {
    listClients
      .mockResolvedValueOnce([{ id: 'c1', nome: 'Cliente XPTO' }])
      .mockResolvedValueOnce([{ id: 'c1', nome: 'Cliente XPTO' }]);
    listLandingPages
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'lp-1',
          titulo: 'LP Nova',
          id_cliente: 'c1',
          id_template: 'evento',
        },
      ]);
    createLandingPage.mockResolvedValueOnce({
      id: 'lp-1',
      titulo: 'LP Nova',
      id_cliente: 'c1',
      id_template: 'evento',
    });

    renderPage();
    await screen.findByText('Cliente XPTO');

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'LP Nova' },
    });
    fireEvent.change(screen.getByLabelText('Cliente'), {
      target: { value: 'c1' },
    });
    fireEvent.change(screen.getByLabelText('Template'), {
      target: { value: 'evento' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() =>
      expect(createLandingPage).toHaveBeenCalledWith({
        titulo: 'LP Nova',
        id_cliente: 'c1',
        id_template: 'evento',
      }),
    );
    expect(await screen.findByText('Total: 1')).toBeInTheDocument();
    expect(screen.getByText('LP Nova')).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('');
    expect(screen.getByLabelText('Cliente')).toHaveValue('');
  });

  it('permite excluir uma landing page existente', async () => {
    listClients
      .mockResolvedValueOnce([{ id: 'c1', nome: 'Cliente XPTO' }])
      .mockResolvedValueOnce([{ id: 'c1', nome: 'Cliente XPTO' }]);
    listLandingPages
      .mockResolvedValueOnce([
        { id: 'lp-1', titulo: 'LP Demo', id_cliente: 'c1', id_template: 'saas' },
      ])
      .mockResolvedValueOnce([]);
    deleteLandingPage.mockResolvedValueOnce(true);

    renderPage();
    expect(await screen.findByText('LP Demo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() =>
      expect(deleteLandingPage).toHaveBeenCalledWith('lp-1'),
    );
    expect(await screen.findByText('Sem landing pages ainda.')).toBeInTheDocument();
  });
});
