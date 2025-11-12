/*
  Testes de integração da LandingPagesPage.
  Cobrem estados vazios, renderização de itens existentes, validações de formulário e operações de criação/exclusão.
*/

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPagesPage from '../../../src/features/lps/LandingPagesPage';

vi.mock('../../../src/features/lps/exporter', () => ({
  exportLandingPageZip: vi.fn(),
}));

const LPS_KEY = 'plp:lps';
const CLIENTS_KEY = 'plp:clientes';

const renderPage = () =>
  render(
    <MemoryRouter>
      <LandingPagesPage />
    </MemoryRouter>,
  );

describe('LandingPagesPage (integration)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('mostra mensagem vazia e total 0 quando não há landing pages', () => {
    renderPage();

    expect(screen.getByText('Sem landing pages ainda.')).toBeInTheDocument();
    expect(screen.getByText('Total: 0')).toBeInTheDocument();
  });

  it('renderiza lista com cliente vinculado e nome do template', async () => {
    localStorage.setItem(
      CLIENTS_KEY,
      JSON.stringify([{ id: 'c1', nome: 'Cliente XPTO' }]),
    );
    localStorage.setItem(
      LPS_KEY,
      JSON.stringify([
        { id: 'lp-1', titulo: 'LP Demo', id_cliente: 'c1', id_template: 'evento' },
      ]),
    );

    renderPage();

    expect(await screen.findByText('LP Demo')).toBeInTheDocument();
    expect(screen.getByText(/Cliente: Cliente XPTO/)).toBeInTheDocument();
    expect(screen.getByText(/Template: Evento\/Curso/)).toBeInTheDocument();
    expect(screen.getByText('Total: 1')).toBeInTheDocument();
  });

  it('valida título e cliente obrigatórios antes de salvar', async () => {
    localStorage.setItem(
      CLIENTS_KEY,
      JSON.stringify([{ id: 'c1', nome: 'Cliente XPTO' }]),
    );

    renderPage();

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
    localStorage.setItem(
      CLIENTS_KEY,
      JSON.stringify([{ id: 'c1', nome: 'Cliente XPTO' }]),
    );
    localStorage.setItem(LPS_KEY, JSON.stringify([]));

    renderPage();

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'LP Nova' },
    });
    fireEvent.change(screen.getByLabelText('Cliente'), {
      target: { value: 'c1' },
    });
    fireEvent.change(screen.getByLabelText('Template'), {
      target: { value: 'plans' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(await screen.findByText('Total: 1')).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(LPS_KEY));
    expect(stored[0]).toMatchObject({
      titulo: 'LP Nova',
      id_cliente: 'c1',
      id_template: 'plans',
    });
    expect(screen.getByLabelText('Título')).toHaveValue('');
    expect(screen.getByLabelText('Cliente')).toHaveValue('');
  });

  it('permite excluir uma landing page existente', async () => {
    localStorage.setItem(
      CLIENTS_KEY,
      JSON.stringify([{ id: 'c1', nome: 'Cliente XPTO' }]),
    );
    localStorage.setItem(
      LPS_KEY,
      JSON.stringify([
        { id: 'lp-1', titulo: 'LP Demo', id_cliente: 'c1', id_template: 'saas' },
      ]),
    );

    renderPage();
    expect(await screen.findByText('LP Demo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() =>
      expect(screen.getByText('Sem landing pages ainda.')).toBeInTheDocument(),
    );
    const stored = JSON.parse(localStorage.getItem(LPS_KEY) ?? '[]');
    expect(stored).toHaveLength(0);
  });
});
