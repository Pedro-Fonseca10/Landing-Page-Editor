/*
  Testes de integração do ProtectedRoute.
  Validam redirecionamento para login, acesso autenticado e bloqueio quando a role exigida não corresponde.
*/

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../../src/features/auth/ProtectedRoute';
import { AuthCtx } from '../../../src/features/auth/AuthContext';

const renderScenario = ({
  user = null,
  requiredRole,
  initialEntries = ['/dashboard'],
} = {}) =>
  render(
    <AuthCtx.Provider value={{ user }}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role={requiredRole}>
                <div>Área autenticada</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthCtx.Provider>,
  );

describe('ProtectedRoute (integration)', () => {
  it('redireciona para login quando não há usuário autenticado', async () => {
    renderScenario();
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  it('renderiza conteúdo quando o usuário está autenticado', () => {
    renderScenario({ user: { email: 'Pedro', role: 'admin' } });
    expect(screen.getByText('Área autenticada')).toBeInTheDocument();
  });

  it('mostra mensagem de acesso negado quando o usuário não tem a role exigida', () => {
    renderScenario({
      user: { email: 'membro', role: 'member' },
      requiredRole: 'admin',
    });
    expect(screen.getByText('Acesso negado')).toBeInTheDocument();
  });
});
