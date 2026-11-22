import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Gift,
  Users,
  Shield,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Send,
  KeyRound,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const roleLabel = {
    SUPER_ADMIN: 'Super Admin',
    ADMINISTRATOR: 'Administrador',
    PARTICIPANT: 'Participante',
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-slate-950/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Lado Esquerdo: Logo + Navegação Desktop */}
          <div className="flex items-center space-x-2 xl:space-x-4 min-w-0 flex-1 mr-2">
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center space-x-2.5 group shrink-0"
            >
              <div className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-yellow-400/30 group-hover:scale-105 transition">
                <Gift className="w-6 h-6 text-slate-950" />
              </div>
              <span className="text-xl font-black text-white tracking-tight shrink-0">
                SorteioClub
              </span>
            </Link>

            {isAuthenticated && (
              <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5 ml-2 xl:ml-4 flex-nowrap min-w-0">
                <Link
                  to="/dashboard"
                  className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition shrink-0 ${
                    isActive('/dashboard')
                      ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <LayoutDashboard className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Início</span>
                  </span>
                </Link>

                <Link
                  to="/groups"
                  className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition shrink-0 ${
                    isActive('/groups')
                      ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>Grupos</span>
                  </span>
                </Link>

                <Link
                  to="/raffles"
                  className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition shrink-0 ${
                    isActive('/raffles')
                      ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <Gift className="w-4 h-4 text-pink-400 shrink-0" />
                    <span>Sorteios</span>
                  </span>
                </Link>

                <Link
                  to="/participar"
                  className="px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold text-yellow-300 bg-yellow-400/15 hover:bg-yellow-400/25 border border-yellow-400/30 transition shadow-sm whitespace-nowrap shrink-0"
                  title="Entrar em um sorteio informando o PIN ou link"
                >
                  <span className="flex items-center space-x-1.5">
                    <KeyRound className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>
                      <span className="hidden xl:inline">Entrar com </span>PIN
                    </span>
                  </span>
                </Link>

                <Link
                  to="/profile"
                  className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition shrink-0 ${
                    isActive('/profile')
                      ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <UserIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Perfil</span>
                  </span>
                </Link>

                {(user?.role === 'ADMINISTRATOR' || user?.role === 'SUPER_ADMIN') && (
                  <>
                    <Link
                      to="/admin"
                      className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold text-purple-200 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 transition shadow-sm whitespace-nowrap shrink-0 ${
                        isActive('/admin') && !isActive('/admin/campaigns') ? 'ring-1 ring-purple-300' : ''
                      }`}
                    >
                      <span className="flex items-center space-x-1.5">
                        <Shield className="w-4 h-4 text-purple-300 shrink-0" />
                        <span>
                          <span className="hidden xl:inline">Painel </span>Admin
                        </span>
                      </span>
                    </Link>

                    <Link
                      to="/admin/campaigns"
                      className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition shrink-0 ${
                        isActive('/admin/campaigns')
                          ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center space-x-1.5">
                        <Send className="w-4 h-4 text-violet-300 shrink-0" />
                        <span>Campanhas</span>
                      </span>
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* Lado Direito: Perfil do Usuário / Ações */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center space-x-2 sm:space-x-3 p-1.5 rounded-xl hover:bg-white/10 transition group cursor-pointer shrink-0"
                  title="Acessar meu perfil e configurações"
                >
                  <div className="hidden xl:flex flex-col text-right">
                    <span className="text-xs xl:text-sm font-bold text-white group-hover:text-yellow-400 transition truncate max-w-[140px]">
                      {user.name}
                    </span>
                    <div className="flex items-center justify-end space-x-1 text-xs">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/80 border border-white/15">
                        {roleLabel[user.role]}
                      </span>
                      {user.cpfMasked && (
                        <span className="text-[11px] text-white/40">CPF: {user.cpfMasked}</span>
                      )}
                    </div>
                  </div>

                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-9 h-9 rounded-full ring-2 ring-yellow-400/50 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sair da conta"
                  className="p-2 text-white/40 hover:text-rose-400 hover:bg-white/10 rounded-xl transition cursor-pointer shrink-0"
                >
                  <LogOut className="w-5 h-5" />
                </button>

                {/* Botão Hambúrguer Mobile/Tablet */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer shrink-0"
                  title="Abrir menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  to="/participar"
                  className="inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-black text-slate-950 bg-yellow-400 hover:bg-yellow-300 rounded-xl transition shadow-md shadow-yellow-400/20 whitespace-nowrap"
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1.5 text-slate-950" />
                  <span>PIN</span>
                </Link>

                <Link
                  to="/login?type=admin"
                  className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition whitespace-nowrap"
                >
                  <Shield className="w-3.5 h-3.5 mr-1.5 text-purple-300" />
                  <span>Área Admin</span>
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/30 transition whitespace-nowrap"
                >
                  <UserIcon className="w-3.5 h-3.5 mr-1.5" />
                  <span>Entrar</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Responsivo Mobile / Tablet (Gaveta Dropdown) */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950/98 backdrop-blur-2xl px-4 py-4 space-y-1.5 animate-in slide-in-from-top-2">
          {/* Info do usuário no menu mobile */}
          <div className="px-3 py-2 mb-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">{user?.name}</div>
              <div className="text-[11px] text-white/50">{user ? roleLabel[user.role] : ''}</div>
            </div>
            {user?.cpfMasked && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70">
                CPF: {user.cpfMasked}
              </span>
            )}
          </div>

          <Link
            to="/dashboard"
            onClick={closeMenu}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/dashboard') ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span>Início</span>
          </Link>

          <Link
            to="/groups"
            onClick={closeMenu}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/groups') ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-violet-400" />
            <span>Grupos</span>
          </Link>

          <Link
            to="/raffles"
            onClick={closeMenu}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/raffles') ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4 text-pink-400" />
            <span>Sorteios</span>
          </Link>

          <Link
            to="/participar"
            onClick={closeMenu}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold text-yellow-300 bg-yellow-400/15 hover:bg-yellow-400/25 border border-yellow-400/30 transition"
          >
            <KeyRound className="w-4 h-4 text-yellow-400" />
            <span>Entrar com PIN</span>
          </Link>

          <Link
            to="/profile"
            onClick={closeMenu}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              isActive('/profile') ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4 text-cyan-400" />
            <span>Meu Perfil</span>
          </Link>

          {(user?.role === 'ADMINISTRATOR' || user?.role === 'SUPER_ADMIN') && (
            <>
              <div className="pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-purple-300/70 px-3">
                Administração
              </div>

              <Link
                to="/admin"
                onClick={closeMenu}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold text-purple-200 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 transition ${
                  isActive('/admin') && !isActive('/admin/campaigns') ? 'ring-1 ring-purple-300' : ''
                }`}
              >
                <Shield className="w-4 h-4 text-purple-300" />
                <span>Painel Admin</span>
              </Link>

              <Link
                to="/admin/campaigns"
                onClick={closeMenu}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive('/admin/campaigns') ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Send className="w-4 h-4 text-violet-300" />
                <span>Campanhas</span>
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
