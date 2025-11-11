import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '../../../src/pages/Login';
import { AuthCtx } from '../../../src/features/auth/AuthContext';

const renderLogin = ({
  login = vi.fn(),
  logout = vi.fn(),
  initialEntries = ['/login'],
} = {}) =>
  render(
    <AuthCtx.Provider value={{ user: null, login, logout }}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthCtx.Provider>,
  );

const submitForm = (email, password) => {
  fireEvent.change(screen.getByLabelText('Usuário ou e-mail'), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText('Senha'), {
    target: { value: password },
  });

  const [submitButton] = screen.getAllByRole('button', { name: 'Entrar' });
  fireEvent.click(submitButton);
};

describe('Login page (integration)', () => {
  it('executa logout ao montar para invalidar sessão anterior', async () => {
    const logout = vi.fn();
    renderLogin({ logout });

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });

  it('exibe mensagem de erro quando o login falha', async () => {
    const login = vi.fn(() => {
      throw new Error('Credenciais inválidas');
    });
    renderLogin({ login });

    submitForm('alguem', 'errado');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Credenciais inválidas',
    );
  });

  it('redireciona para o dashboard após login bem-sucedido', async () => {
    const login = vi.fn();
    renderLogin({ login });

    submitForm('Pedro', '123');

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith('Pedro', '123');
  });
});
