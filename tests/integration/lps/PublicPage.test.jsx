/*
  Testes de integração da PublicPage.
  Verificam o fallback de página inexistente e a renderização do TemplateRenderer quando a LP é encontrada.
*/

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PublicPage from '../../../src/features/lps/PublicPage';
import { fetchLandingPageBySlug } from '../../../src/features/lps/lpsService';

vi.mock('../../../src/features/lps/TemplateRenderer', () => ({
  default: ({ lp }) => (
    <div data-testid="lp-render">Renderizando {lp.title}</div>
  ),
}));

vi.mock('../../../src/features/lps/lpsService', () => ({
  fetchLandingPageBySlug: vi.fn(),
}));

const renderPublic = (slug) =>
  render(
    <MemoryRouter initialEntries={[`/lp/${slug}`]}>
      <Routes>
        <Route path="/lp/:slug" element={<PublicPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('PublicPage (integration)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    fetchLandingPageBySlug.mockReset();
    fetchLandingPageBySlug.mockResolvedValue(null);
  });

  it('exibe mensagem padrão quando não existe', async () => {
    fetchLandingPageBySlug.mockResolvedValueOnce(null);
    renderPublic('inexistente');
    expect(
      await screen.findByText('Página não encontrada.'),
    ).toBeInTheDocument();
    expect(fetchLandingPageBySlug).toHaveBeenCalledWith('inexistente');
  });

  it('renderiza TemplateRenderer quando encontra LP remota', async () => {
    fetchLandingPageBySlug.mockResolvedValueOnce({
      slug: 'landing-1',
      title: 'Landing 1',
    });
    renderPublic('landing-1');

    expect(await screen.findByTestId('lp-render')).toHaveTextContent(
      'Renderizando Landing 1',
    );
  });

  it('usa fallback local quando Supabase falha', async () => {
    localStorage.setItem(
      'plp:lps',
      JSON.stringify([{ slug: 'landing-1', title: 'Landing 1' }]),
    );
    fetchLandingPageBySlug.mockRejectedValueOnce(new Error('offline'));
    renderPublic('landing-1');

    expect(await screen.findByTestId('lp-render')).toHaveTextContent(
      'Renderizando Landing 1',
    );
  });
});
