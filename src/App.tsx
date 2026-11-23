import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { CookieConsent } from './components/CookieConsent';
import { LoginPage } from './pages/auth/LoginPage';
import { CompleteProfilePage } from './pages/auth/CompleteProfilePage';
import { ProfilePage } from './pages/profile/ProfilePage';
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
import { ParticipatePage } from './pages/raffles/ParticipatePage';
import { HomePage } from './pages/home/HomePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { isAuthenticated, isLoading, user, needsProfileCompletion } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        <div className="text-sm font-bold text-yellow-300 animate-pulse flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
          <span>Carregando SorteioClub...</span>
        </div>
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

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/participar') ||
    location.pathname.startsWith('/s/');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white relative selection:bg-yellow-400 selection:text-slate-950 overflow-x-hidden">
      {/* ── Orbes de Luz Ambientes (Estilo da Tela de Login) ──────────────── */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl z-0" />
      <div className="pointer-events-none fixed top-1/2 -right-24 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl z-0" />
      <div className="pointer-events-none fixed -bottom-24 left-1/3 w-72 h-72 rounded-full bg-violet-700/20 blur-3xl z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {!isAuthPage && <Navbar />}
        <main className="flex-1">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/participar" element={<ParticipatePage />} />
          <Route path="/participar/:idOrPin" element={<ParticipatePage />} />
          <Route path="/s/:idOrPin" element={<ParticipatePage />} />
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

          {/* Página Inicial Pública */}
          <Route path="/" element={<HomePage />} />

          {/* Painel do Participante */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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
      {!isAuthPage && (
        <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-xl py-6 text-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
            <div>
              © {new Date().getFullYear()} SorteioClub • Plataforma de Sorteios Privados. Todos os direitos reservados.
            </div>
            <div className="flex items-center space-x-4">
              <a href="/legal" className="hover:text-yellow-400 transition">
                Termos de Uso
              </a>
              <span>•</span>
              <a href="/legal" className="hover:text-yellow-400 transition">
                Privacidade & LGPD
              </a>
            </div>
          </div>
        </footer>
      )}

      {/* Banner de Consentimento de Cookies & LGPD */}
      <CookieConsent />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
