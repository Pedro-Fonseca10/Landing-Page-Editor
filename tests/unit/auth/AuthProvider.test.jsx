/*
  Testes unitários do contexto AuthProvider.
  Cobrem login por papel, erro em credenciais inválidas, registro de novos usuários e logout.
*/

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '../../../src/features/auth/AuthProvider';
import { useAuth } from '../../../src/features/auth/useAuth';

const renderAuth = () =>
  renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  });

describe('AuthProvider (unit)', () => {
  it('loga admin com credenciais válidas e expõe cargo correto', () => {
    const { result } = renderAuth();

    act(() => {
      result.current.login('Pedro', '123');
    });

    expect(result.current.user).toEqual({ email: 'Pedro', role: 'admin' });
  });

  it('lança erro para credenciais inválidas', () => {
    const { result } = renderAuth();

    expect(() =>
      act(() => {
        result.current.login('alguem', 'errado');
      }),
    ).toThrow('Credenciais inválidas');
  });

  it('registra e faz logout limpando o usuário', () => {
    const { result } = renderAuth();

    act(() => {
      result.current.register('novo@teste.com', 'senha');
    });
    expect(result.current.user).toEqual({
      email: 'novo@teste.com',
      role: 'customer',
    });

    act(() => {
      result.current.logout();
    });
    expect(result.current.user).toBeNull();
  });
});
