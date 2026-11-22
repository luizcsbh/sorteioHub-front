import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gift, Users, Shield, LogOut, User as UserIcon, LayoutDashboard, Send, KeyRound } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    SUPER_ADMIN: 'Super Admin',
    ADMINISTRATOR: 'Administrador',
    PARTICIPANT: 'Participante',
  };

  return (
    <header className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-yellow-400/30 group-hover:scale-105 transition">
                <Gift className="w-6 h-6 text-slate-950" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                SorteioClub
              </span>
            </Link>

            {isAuthenticated && (
              <nav className="hidden md:flex ml-8 space-x-2">
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
                >
                  <span className="flex items-center space-x-1.5">
                    <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                    <span>Início</span>
                  </span>
                </Link>

                <Link
                  to="/groups"
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
                >
                  <span className="flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-violet-400" />
                    <span>Grupos</span>
                  </span>
                </Link>

                <Link
                  to="/raffles"
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
                >
                  <span className="flex items-center space-x-1.5">
                    <Gift className="w-4 h-4 text-pink-400" />
                    <span>Sorteios</span>
                  </span>
                </Link>

                <Link
                  to="/participar"
                  className="px-3 py-2 rounded-xl text-sm font-bold text-yellow-300 bg-yellow-400/15 hover:bg-yellow-400/25 border border-yellow-400/30 transition shadow-sm"
                  title="Entrar em um sorteio informando o PIN ou link"
                >
                  <span className="flex items-center space-x-1.5">
                    <KeyRound className="w-4 h-4 text-yellow-400" />
                    <span>Entrar com PIN</span>
                  </span>
                </Link>

                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
                >
                  <span className="flex items-center space-x-1.5">
                    <UserIcon className="w-4 h-4 text-cyan-400" />
                    <span>Meu Perfil</span>
                  </span>
                </Link>

                {(user?.role === 'ADMINISTRATOR' || user?.role === 'SUPER_ADMIN') && (
                  <>
                    <Link
                      to="/admin"
                      className="px-3 py-2 rounded-xl text-sm font-bold text-purple-200 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 transition shadow-sm"
                    >
                      <span className="flex items-center space-x-1.5">
                        <Shield className="w-4 h-4 text-purple-300" />
                        <span>Painel Admin</span>
                      </span>
                    </Link>

                    <Link
                      to="/admin/campaigns"
                      className="px-3 py-2 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
                    >
                      <span className="flex items-center space-x-1.5">
                        <Send className="w-4 h-4 text-violet-300" />
                        <span>Campanhas</span>
                      </span>
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* User profile / Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-white/10 transition group cursor-pointer"
                  title="Acessar meu perfil e configurações"
                >
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-sm font-bold text-white group-hover:text-yellow-400 transition">
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
                      className="w-9 h-9 rounded-full ring-2 ring-yellow-400/50 object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sair da conta"
                  className="p-2 text-white/40 hover:text-rose-400 hover:bg-white/10 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/participar"
                  className="inline-flex items-center px-3.5 py-2 text-xs font-black text-slate-950 bg-yellow-400 hover:bg-yellow-300 rounded-xl transition shadow-md shadow-yellow-400/20"
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1.5 text-slate-950" />
                  <span>Entrar com PIN</span>
                </Link>

                <Link
                  to="/login?type=admin"
                  className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition"
                >
                  <Shield className="w-3.5 h-3.5 mr-1.5 text-purple-300" />
                  <span>Área do Administrador</span>
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/30 transition"
                >
                  <UserIcon className="w-3.5 h-3.5 mr-1.5" />
                  <span>Entrar</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
