import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
import { AuthProvider } from "../features/auth/AuthProvider"
import ProtectedRoute from "../features/auth/ProtectedRoute"
import ClientsPage from "../features/clients/ClientsPage"
import LandingPagesPage from "../features/lps/LandingPagesPage"

import LandingPageEditor from "../features/lps/LandingPageEditor"
import LandingPagePreview from "../features/lps/LandingPagePreview"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
          <Route path="/lps" element={<ProtectedRoute><LandingPagesPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/lps/:id/edit" element={<ProtectedRoute><LandingPageEditor /></ProtectedRoute>} />
          <Route path="/preview/:id" element={<ProtectedRoute><LandingPagePreview /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

