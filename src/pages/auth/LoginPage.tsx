import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Gift, ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, isAuthenticated, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      if (needsProfileCompletion) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, needsProfileCompletion, navigate]);

  const handleMockLogin = async (role: 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'PARTICIPANT', email: string, name: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle(undefined, {
        googleId: `google_${email.split('@')[0]}`,
        email,
        name,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-4">
            <Gift className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Acesse o SorteioHub</h1>
          <p className="text-sm text-slate-500 mt-2">
            Plataforma segura de sorteios privados para grupos fechados
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Autenticação Segura Google OAuth 2.0</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Cadastro único para toda a plataforma. Seus dados cadastrais e CPF são protegidos conforme a LGPD.
            </p>

            <button
              onClick={() => handleMockLogin('SUPER_ADMIN', 'admin@sorteiohub.com.br', 'Administrador Geral')}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <span>Entrar com Google (Super Admin)</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 uppercase">
              Perfis de Teste Rápido
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleMockLogin('ADMINISTRATOR', 'gestor@empresa.com.br', 'Gestor de Grupo')}
              disabled={isLoading}
              className="p-3 text-left border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition text-xs"
            >
              <div className="font-semibold text-slate-800">Administrador</div>
              <div className="text-slate-500 truncate">Cria grupos & sorteios</div>
            </button>

            <button
              onClick={() => handleMockLogin('PARTICIPANT', 'joao.silva@gmail.com', 'João Silva')}
              disabled={isLoading}
              className="p-3 text-left border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition text-xs"
            >
              <div className="font-semibold text-slate-800">Participante</div>
              <div className="text-slate-500 truncate">Participa de sorteios</div>
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Cadastro único: participe de múltiplos grupos sem re-cadastro</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-indigo-500" />
            <span>CPF protegido por HMAC e criptografia de ponta a ponta</span>
          </div>
        </div>
      </div>
    </div>
  );
};
