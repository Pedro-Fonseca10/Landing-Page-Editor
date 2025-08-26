import { Navigate } from "react-router-dom"
import { useAuth } from "./AuthContext"

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <div className="p-6">Acesso negado</div>
  return children
}
