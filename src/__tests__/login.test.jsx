import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

import Login from '../pages/Login';

test('renderiza o botão Entrar', () => {
  render(<Login />);
  expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
});
