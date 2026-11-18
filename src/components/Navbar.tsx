import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gift, Users, Shield, LogOut, User as UserIcon, LayoutDashboard, Send } from 'lucide-react';

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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <Gift className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-900 to-indigo-600 bg-clip-text text-transparent">
                SorteioHub
              </span>
            </Link>

            {isAuthenticated && (
              <nav className="hidden md:flex ml-8 space-x-4">
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition"
                >
                  <span className="flex items-center space-x-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Início</span>
                  </span>
                </Link>

                <Link
                  to="/groups"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition"
                >
                  <span className="flex items-center space-x-1.5">
                    <Users className="w-4 h-4" />
                    <span>Grupos</span>
                  </span>
                </Link>

                <Link
                  to="/raffles"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition"
                >
                  <span className="flex items-center space-x-1.5">
                    <Gift className="w-4 h-4" />
                    <span>Sorteios</span>
                  </span>
                </Link>

                {(user?.role === 'ADMINISTRATOR' || user?.role === 'SUPER_ADMIN') && (
                  <>
                    <Link
                      to="/admin"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                    >
                      <span className="flex items-center space-x-1.5">
                        <Shield className="w-4 h-4" />
                        <span>Painel Admin</span>
                      </span>
                    </Link>

                    <Link
                      to="/admin/campaigns"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition"
                    >
                      <span className="flex items-center space-x-1.5">
                        <Send className="w-4 h-4" />
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
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                  <div className="flex items-center justify-end space-x-1 text-xs text-slate-500">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {roleLabel[user.role]}
                    </span>
                    {user.cpfMasked && (
                      <span className="text-[11px] text-slate-400">CPF: {user.cpfMasked}</span>
                    )}
                  </div>
                </div>

                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full ring-2 ring-indigo-500/20 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  title="Sair da conta"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Entrar com Google
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
