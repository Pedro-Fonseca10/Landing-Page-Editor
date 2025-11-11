/*
  Componente de rota protegida que verifica autenticação e autorização do usuário.
  Redireciona para a página de login se o usuário não estiver autenticado.
  Exibe mensagem de acesso negado se o usuário não tiver a função necessária.
*/

import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role)
    return <div className="p-6">Acesso negado</div>;
  return children;
}
