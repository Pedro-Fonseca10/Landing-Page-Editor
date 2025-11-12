/*
  Testes de integração da PublicPage.
  Verificam o fallback de página inexistente e a renderização do TemplateRenderer quando a LP é encontrada.
*/

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PublicPage from '../../../src/features/lps/PublicPage';

vi.mock('../../../src/features/lps/TemplateRenderer', () => ({
  default: ({ lp }) => (
    <div data-testid="lp-render">Renderizando {lp.title}</div>
  ),
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
  });

  it('exibe mensagem padrão quando não existe', async () => {
    renderPublic('inexistente');
    expect(
      await screen.findByText('Página não encontrada.'),
    ).toBeInTheDocument();
  });

  it('renderiza TemplateRenderer quando encontra LP', async () => {
    localStorage.setItem(
      'plp:lps',
      JSON.stringify([{ slug: 'landing-1', title: 'Landing 1' }]),
    );
    renderPublic('landing-1');

    expect(await screen.findByTestId('lp-render')).toHaveTextContent(
      'Renderizando Landing 1',
    );
  });
});
