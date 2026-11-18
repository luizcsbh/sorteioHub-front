import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Gift, ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

// Estende window para incluir o SDK do Google Identity
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, config: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, isAuthenticated, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

  React.useEffect(() => {
    if (isAuthenticated) {
      if (needsProfileCompletion) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, needsProfileCompletion, navigate]);

  // Carrega o SDK do Google e renderiza o botão
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('cole_seu')) return;

    const scriptId = 'google-identity-sdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogle();
      document.head.appendChild(script);
    } else if (window.google) {
      initGoogle();
    }
  }, [GOOGLE_CLIENT_ID]);

  const initGoogle = () => {
    if (!window.google || !googleBtnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        setError(null);
        setIsLoading(true);
        try {
          await loginWithGoogle(response.credential);
        } catch (err: any) {
          setError(err.response?.data?.error || err.message || 'Erro ao realizar login com Google.');
        } finally {
          setIsLoading(false);
        }
      },
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      width: googleBtnRef.current.offsetWidth || 340,
      text: 'signin_with',
      locale: 'pt-BR',
    });
  };

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

            {/* Botão oficial do Google (renderizado pelo SDK) */}
            {GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('cole_seu') ? (
              <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />
            ) : (
              /* Fallback: botão mock para desenvolvimento sem Client ID configurado */
              <button
                onClick={() => handleMockLogin('SUPER_ADMIN', 'admin@sorteiohub.com.br', 'Administrador Geral')}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl shadow-sm transition disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Entrar com Google (modo dev)</span>
              </button>
            )}

            {!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('cole_seu') ? (
              <p className="mt-2 text-center text-[11px] text-amber-600">
                ⚠️ Configure <code>VITE_GOOGLE_CLIENT_ID</code> no <code>frontend/.env</code> para usar o login real.
              </p>
            ) : null}
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
