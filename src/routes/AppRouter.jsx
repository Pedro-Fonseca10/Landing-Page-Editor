/*
  Componente de rota principal da aplicação. Define todas as rotas usando react-router-dom.
  Inclui rotas protegidas que requerem autenticação.
  Fornece contexto de autenticação para toda a aplicação.
*/

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
import { AuthProvider } from "../features/auth/AuthProvider"
import ProtectedRoute from "../features/auth/ProtectedRoute"
import ClientsPage from "../features/clients/ClientsPage"
import SignupsPage from "../features/signups/SignupsPage"

import LandingPagesPage from "../features/lps/LandingPagesPage"
import LandingPageEditor from "../features/lps/LandingPageEditor"
import LandingPagePreview from "../features/lps/LandingPagePreview"

import MetricsPage from "../features/analytics/MetricsPage"

import PublicPage from "../features/lps/PublicPage"

import GatewayMock from "../features/payments/GatewayMock"
import PaymentCallback from "../features/payments/PaymentCallback"
import Checkout from "../features/checkout/Checkout"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
          <Route path="/signups" element={<ProtectedRoute><SignupsPage /></ProtectedRoute>} />
          <Route path="/lps" element={<ProtectedRoute><LandingPagesPage /></ProtectedRoute>} />
          <Route path="/lps/:id/edit" element={<ProtectedRoute><LandingPageEditor /></ProtectedRoute>} />
          <Route path="/preview/:id" element={<ProtectedRoute><LandingPagePreview /></ProtectedRoute>} />
          <Route path="/metrics" element={<ProtectedRoute><MetricsPage /></ProtectedRoute>} />
          <Route path="/lp/:slug" element={<PublicPage />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/pay/:orderId" element={<GatewayMock />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
