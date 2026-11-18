import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/auth/LoginPage';
import { CompleteProfilePage } from './pages/auth/CompleteProfilePage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { GroupsPage } from './pages/groups/GroupsPage';
import { GroupDetailsPage } from './pages/groups/GroupDetailsPage';
import { RafflesPage } from './pages/raffles/RafflesPage';
import { RaffleDetailsPage } from './pages/raffles/RaffleDetailsPage';
import { RaffleResultsPage } from './pages/raffles/RaffleResultsPage';
import { JoinInvitePage } from './pages/groups/JoinInvitePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { CampaignsPage } from './pages/admin/CampaignsPage';
import { TermsAndPrivacyPage } from './pages/legal/TermsAndPrivacyPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { isAuthenticated, isLoading, user, needsProfileCompletion } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">Carregando SorteioHub...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (needsProfileCompletion && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  if (adminOnly && user?.role !== 'ADMINISTRATOR' && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/legal" element={<TermsAndPrivacyPage />} />
              <Route path="/invite/:token" element={<JoinInvitePage />} />

              {/* Conclusão de Cadastro Único (CPF e Endereço) */}
              <Route
                path="/complete-profile"
                element={
                  <ProtectedRoute>
                    <CompleteProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Painel do Participante */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Grupos Fechados */}
              <Route
                path="/groups"
                element={
                  <ProtectedRoute>
                    <GroupsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups/:id"
                element={
                  <ProtectedRoute>
                    <GroupDetailsPage />
                  </ProtectedRoute>
                }
              />

              {/* Sorteios */}
              <Route
                path="/raffles"
                element={
                  <ProtectedRoute>
                    <RafflesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/raffles/:id"
                element={
                  <ProtectedRoute>
                    <RaffleDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/raffles/:id/results"
                element={
                  <ProtectedRoute>
                    <RaffleResultsPage />
                  </ProtectedRoute>
                }
              />

              {/* Painel Admin & Campanhas */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/campaigns"
                element={
                  <ProtectedRoute adminOnly>
                    <CampaignsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer com links legais */}
          <footer className="border-t border-slate-200 bg-white py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div>
                © {new Date().getFullYear()} SorteioHub • Plataforma de Sorteios Privados. Todos os direitos reservados.
              </div>
              <div className="flex items-center space-x-4">
                <a href="/legal" className="hover:underline">
                  Termos de Uso
                </a>
                <span>•</span>
                <a href="/legal" className="hover:underline">
                  Privacidade & LGPD
                </a>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
);
};

export default App;
