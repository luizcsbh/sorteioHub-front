import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Gift,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

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

type Tab = 'google' | 'login' | 'register';

// ─── Password requirements helper ──────────────────────────────────────────
const passwordRules = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: '1 letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: '1 número', test: (v: string) => /\d/.test(v) },
];

// ─── Shared input style ─────────────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition';

// ─── Password field with show/hide toggle ───────────────────────────────────
const PasswordInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}> = ({ value, onChange, placeholder = 'Senha', disabled, id }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={inputCls + ' pr-10'}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

// ─── Tab button ─────────────────────────────────────────────────────────────
const TabBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={
      'flex-1 py-2.5 text-sm font-semibold transition border-b-2 ' +
      (active
        ? 'border-indigo-600 text-indigo-700 bg-indigo-50/60'
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50')
    }
  >
    {children}
  </button>
);

// ─── Main component ─────────────────────────────────────────────────────────
export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, register, isAuthenticated, needsProfileCompletion } =
    useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('google');

  // Google tab state
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

  // Email login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Redirect on auth
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(needsProfileCompletion ? '/complete-profile' : '/dashboard');
    }
  }, [isAuthenticated, needsProfileCompletion, navigate]);

  // Google SDK
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [GOOGLE_CLIENT_ID]);

  // Re-render Google button when switching to google tab
  useEffect(() => {
    if (activeTab === 'google' && window.google && googleBtnRef.current) {
      initGoogle();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const initGoogle = () => {
    if (!window.google || !googleBtnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        setGoogleLoading(true);
        try {
          await loginWithGoogle(response.credential);
        } catch (err: any) {
          toast.error(
            err.response?.data?.error || err.message || 'Erro ao realizar login com Google.'
          );
        } finally {
          setGoogleLoading(false);
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

  const handleMockLogin = async (
    role: 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'PARTICIPANT',
    email: string,
    name: string
  ) => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle(undefined, {
        googleId: `google_${email.split('@')[0]}`,
        email,
        name,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Erro ao realizar login.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Preencha e-mail e senha.');
      return;
    }
    setLoginLoading(true);
    try {
      await loginWithEmail(loginEmail, loginPassword);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      toast.error('Preencha todos os campos.');
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error('As senhas não coincidem.');
      return;
    }
    const failedRule = passwordRules.find((r) => !r.test(regPassword));
    if (failedRule) {
      toast.error(`Senha fraca: ${failedRule.label}`);
      return;
    }
    setRegLoading(true);
    try {
      await register(regName, regEmail, regPassword);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Erro ao criar conta.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="text-center pt-8 pb-4 px-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-4">
            <Gift className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Acesse o SorteioHub</h1>
          <p className="text-sm text-slate-500 mt-1">
            Plataforma segura de sorteios privados para grupos fechados
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mt-2">
          <TabBtn active={activeTab === 'google'} onClick={() => setActiveTab('google')}>
            Google
          </TabBtn>
          <TabBtn active={activeTab === 'login'} onClick={() => setActiveTab('login')}>
            Entrar
          </TabBtn>
          <TabBtn active={activeTab === 'register'} onClick={() => setActiveTab('register')}>
            Criar Conta
          </TabBtn>
        </div>

        {/* Tab content */}
        <div className="p-8 pt-6">

          {/* ── Tab: Google ── */}
          {activeTab === 'google' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Autenticação Segura Google OAuth 2.0</span>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Cadastro único para toda a plataforma. Seus dados cadastrais e CPF são protegidos
                  conforme a LGPD.
                </p>

                {GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('cole_seu') ? (
                  <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />
                ) : (
                  <button
                    onClick={() =>
                      handleMockLogin('SUPER_ADMIN', 'admin@sorteiohub.com.br', 'Administrador Geral')
                    }
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {googleLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    <span>Entrar com Google (modo dev)</span>
                  </button>
                )}

                {(!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('cole_seu')) && (
                  <p className="mt-2 text-center text-[11px] text-amber-600">
                    ⚠️ Configure <code>VITE_GOOGLE_CLIENT_ID</code> no <code>frontend/.env</code>{' '}
                    para usar o login real.
                  </p>
                )}
              </div>

              {/* Quick test profiles */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 uppercase">
                  Perfis de Teste Rápido
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    handleMockLogin('ADMINISTRATOR', 'gestor@empresa.com.br', 'Gestor de Grupo')
                  }
                  disabled={googleLoading}
                  className="p-3 text-left border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition text-xs disabled:opacity-50"
                >
                  <div className="font-semibold text-slate-800">Administrador</div>
                  <div className="text-slate-500 truncate">Cria grupos &amp; sorteios</div>
                </button>

                <button
                  onClick={() =>
                    handleMockLogin('PARTICIPANT', 'joao.silva@gmail.com', 'João Silva')
                  }
                  disabled={googleLoading}
                  className="p-3 text-left border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition text-xs disabled:opacity-50"
                >
                  <div className="font-semibold text-slate-800">Participante</div>
                  <div className="text-slate-500 truncate">Participa de sorteios</div>
                </button>
              </div>
            </div>
          )}

          {/* ── Tab: Login e-mail/senha ── */}
          {activeTab === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-600 mb-1">
                  E-mail
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={loginLoading}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-600 mb-1">
                  Senha
                </label>
                <PasswordInput
                  id="login-password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  placeholder="Sua senha"
                  disabled={loginLoading}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline transition"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-60"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Entrando…</span>
                  </>
                ) : (
                  <span>Entrar</span>
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Criar Conta
                </button>
              </p>
            </form>
          )}

          {/* ── Tab: Cadastro ── */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-600 mb-1">
                  Nome completo
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="João Silva"
                  disabled={regLoading}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-600 mb-1">
                  E-mail
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={regLoading}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-600 mb-1">
                  Senha
                </label>
                <PasswordInput
                  id="reg-password"
                  value={regPassword}
                  onChange={setRegPassword}
                  placeholder="Crie uma senha"
                  disabled={regLoading}
                />
                {/* Password requirements */}
                {regPassword.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {passwordRules.map((r) => (
                      <li key={r.label} className="flex items-center space-x-1.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            r.test(regPassword) ? 'text-emerald-500' : 'text-slate-300'
                          }`}
                        />
                        <span
                          className={`text-[11px] ${
                            r.test(regPassword) ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {r.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-semibold text-slate-600 mb-1">
                  Confirmar senha
                </label>
                <PasswordInput
                  id="reg-confirm"
                  value={regConfirm}
                  onChange={setRegConfirm}
                  placeholder="Repita a senha"
                  disabled={regLoading}
                />
                {regConfirm.length > 0 && regPassword !== regConfirm && (
                  <p className="mt-1 text-[11px] text-rose-500">As senhas não coincidem.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-60"
              >
                {regLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Criando conta…</span>
                  </>
                ) : (
                  <span>Criar Conta</span>
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Entrar
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Footer badges */}
        <div className="mx-8 mb-8 pt-5 border-t border-slate-100 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Cadastro único: participe de múltiplos grupos sem re-cadastro</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span>CPF protegido por HMAC e criptografia de ponta a ponta</span>
          </div>
        </div>
      </div>
    </div>
  );
};
