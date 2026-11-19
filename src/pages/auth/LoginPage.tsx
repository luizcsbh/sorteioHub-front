import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Eye, EyeOff, Loader2, CheckCircle2, Gift, Zap, Users, Trophy } from 'lucide-react';

// ── Google SDK type ──────────────────────────────────────────────────────────
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, config: object) => void;
        };
      };
    };
  }
}

type Tab = 'login' | 'register';

// ── Password rules ───────────────────────────────────────────────────────────
const passwordRules = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: '1 letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: '1 letra minúscula', test: (v: string) => /[a-z]/.test(v) },
  { label: '1 número', test: (v: string) => /\d/.test(v) },
  { label: '1 caractere especial', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

// ── Password input ───────────────────────────────────────────────────────────
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
        className="w-full px-4 py-3 pr-11 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition text-sm"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

// ── Feature badge ────────────────────────────────────────────────────────────
const Feature: React.FC<{ icon: React.ReactNode; color: string; text: string }> = ({
  icon, color, text,
}) => (
  <div className={`flex items-center space-x-3 p-3 rounded-2xl ${color}`}>
    <div className="flex-shrink-0">{icon}</div>
    <span className="text-white text-sm font-semibold">{text}</span>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, register, isAuthenticated, needsProfileCompletion } =
    useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('login');
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
  const hasRealGoogle = !!GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('cole_seu');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Google loading
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(needsProfileCompletion ? '/complete-profile' : '/dashboard');
    }
  }, [isAuthenticated, needsProfileCompletion, navigate]);

  // Google SDK init
  useEffect(() => {
    if (!hasRealGoogle) return;

    const checkAndInit = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        initGoogle();
        return true;
      }
      return false;
    };

    if (checkAndInit()) return;

    const interval = setInterval(() => {
      if (checkAndInit()) {
        clearInterval(interval);
      }
    }, 150);

    const timer = setTimeout(() => clearInterval(interval), 4000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRealGoogle, tab]);

  const initGoogle = () => {
    try {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          setGoogleLoading(true);
          try {
            await loginWithGoogle(response.credential);
          } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || 'Erro ao entrar com Google.');
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      const containerWidth = googleBtnRef.current.offsetWidth || 340;
      const safeWidth = Math.min(Math.max(containerWidth, 200), 400);

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        width: safeWidth,
        text: 'signin_with',
        locale: 'pt-BR',
      });
    } catch (e) {
      console.warn('[SorteioHub] Google SDK init:', e);
    }
  };

  const handleMockLogin = async (email: string, name: string) => {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.warning('Preencha e-mail e senha.');
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
      toast.warning('Preencha todos os campos.');
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error('As senhas não coincidem.');
      return;
    }
    const failed = passwordRules.find((r) => !r.test(regPassword));
    if (failed) {
      toast.error(`Senha fraca: ${failed.label}`);
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

  const inputCls =
    'w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition text-sm';

  return (
    <div className="min-h-screen bg-[#210047] flex overflow-hidden relative">
      {/* ── Decorative blobs ───────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-violet-700/30 blur-3xl" />

      {/* ── Left panel — branding ────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative z-10">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/30">
            <Gift className="w-7 h-7 text-[#210047]" />
          </div>
          <span className="text-white text-2xl font-black tracking-tight">SorteioHub</span>
        </div>

        {/* Hero text */}
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 bg-yellow-400/20 border border-yellow-400/30 rounded-full px-4 py-1.5">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 text-xs font-bold uppercase tracking-widest">
              Plataforma de Sorteios
            </span>
          </div>

          <h1 className="text-5xl font-black text-white leading-tight">
            Sorteios<br />
            <span className="text-yellow-400">privados</span><br />
            para grupos<br />fechados
          </h1>

          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            Crie sorteios, gerencie grupos e garanta transparência com tecnologia de ponta. LGPD compliant.
          </p>

          <div className="space-y-3 pt-2">
            <Feature
              color="bg-violet-600/40"
              icon={<Users className="w-5 h-5 text-violet-300" />}
              text="Grupos privados com convites por e-mail"
            />
            <Feature
              color="bg-indigo-600/40"
              icon={<Trophy className="w-5 h-5 text-indigo-300" />}
              text="Sorteios auditáveis e 100% transparentes"
            />
            <Feature
              color="bg-pink-600/40"
              icon={<Zap className="w-5 h-5 text-pink-300" />}
              text="Resultado instantâneo com histórico completo"
            />
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/30 text-xs">
          © 2026 SorteioHub · Todos os direitos reservados
        </p>
      </div>

      {/* ── Right panel — form ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center">
              <Gift className="w-6 h-6 text-[#210047]" />
            </div>
            <span className="text-white text-xl font-black">SorteioHub</span>
          </div>

          {/* Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/40">

            {/* Heading */}
            <div className="text-center mb-7">
              <h2 className="text-2xl font-black text-white">
                {tab === 'login' ? 'Bem-vindo de volta! 👋' : 'Criar sua conta 🎉'}
              </h2>
              <p className="text-white/50 text-sm mt-1">
                {tab === 'login'
                  ? 'Entre para participar dos seus sorteios'
                  : 'Junte-se à plataforma gratuitamente'}
              </p>
            </div>

            {/* Google button */}
            <div className="mb-5">
              {hasRealGoogle ? (
                <div className="w-full flex justify-center bg-white rounded-xl p-1 shadow-sm">
                  <div
                    ref={googleBtnRef}
                    className="w-full flex justify-center min-h-[44px]"
                  />
                </div>
              ) : (
                <button
                  onClick={() => handleMockLogin('admin@sorteiohub.com.br', 'Administrador Geral')}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white hover:bg-white/90 text-gray-700 font-bold rounded-xl shadow transition disabled:opacity-60"
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
                  <span>Continuar com Google</span>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="relative flex items-center mb-5">
              <div className="flex-grow border-t border-white/15" />
              <span className="mx-3 text-white/35 text-xs font-semibold uppercase tracking-widest">ou</span>
              <div className="flex-grow border-t border-white/15" />
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 rounded-2xl p-1 mb-6 gap-1">
              {(['login', 'register'] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl transition ${
                    tab === t
                      ? 'bg-yellow-400 text-[#210047] shadow'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {t === 'login' ? 'Entrar' : 'Criar Conta'}
                </button>
              ))}
            </div>

            {/* ── Login form ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  disabled={loginLoading}
                  className={inputCls}
                />
                <PasswordInput
                  value={loginPassword}
                  onChange={setLoginPassword}
                  placeholder="Sua senha"
                  disabled={loginLoading}
                />
                <div className="flex justify-end -mt-1">
                  <button type="button" className="text-xs text-yellow-400 hover:text-yellow-300 transition">
                    Esqueceu a senha?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-[#210047] font-black text-base rounded-xl shadow-lg shadow-yellow-400/25 transition disabled:opacity-60 flex items-center justify-center space-x-2"
                >
                  {loginLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>Entrando…</span></>
                  ) : (
                    <span>Entrar agora</span>
                  )}
                </button>
              </form>
            )}

            {/* ── Register form ── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nome completo"
                  disabled={regLoading}
                  className={inputCls}
                />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  disabled={regLoading}
                  className={inputCls}
                />
                <PasswordInput
                  value={regPassword}
                  onChange={setRegPassword}
                  placeholder="Crie uma senha"
                  disabled={regLoading}
                />

                {/* Password requirements */}
                {regPassword.length > 0 && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 px-1">
                    {passwordRules.map((r) => (
                      <span
                        key={r.label}
                        className={`flex items-center space-x-1 text-[11px] font-medium transition ${
                          r.test(regPassword) ? 'text-emerald-400' : 'text-white/35'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{r.label}</span>
                      </span>
                    ))}
                  </div>
                )}

                <PasswordInput
                  value={regConfirm}
                  onChange={setRegConfirm}
                  placeholder="Confirmar senha"
                  disabled={regLoading}
                />
                {regConfirm.length > 0 && regPassword !== regConfirm && (
                  <p className="text-[11px] text-rose-400 px-1">As senhas não coincidem.</p>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-[#210047] font-black text-base rounded-xl shadow-lg shadow-yellow-400/25 transition disabled:opacity-60 flex items-center justify-center space-x-2 !mt-5"
                >
                  {regLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>Criando…</span></>
                  ) : (
                    <span>Criar conta grátis</span>
                  )}
                </button>
              </form>
            )}

            {/* Dev mock profiles */}
            {!hasRealGoogle && (
              <>
                <div className="relative flex items-center my-5">
                  <div className="flex-grow border-t border-white/10" />
                  <span className="mx-3 text-white/25 text-[10px] uppercase tracking-widest">Dev</span>
                  <div className="flex-grow border-t border-white/10" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Admin', email: 'gestor@empresa.com.br', name: 'Gestor de Grupo' },
                    { label: 'Participante', email: 'joao.silva@gmail.com', name: 'João Silva' },
                  ].map((p) => (
                    <button
                      key={p.email}
                      onClick={() => handleMockLogin(p.email, p.name)}
                      disabled={googleLoading}
                      className="p-2.5 rounded-xl border border-white/15 hover:border-yellow-400/50 hover:bg-yellow-400/5 transition text-xs text-left disabled:opacity-50"
                    >
                      <div className="font-bold text-white/80">{p.label}</div>
                      <div className="text-white/35 truncate">{p.name}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer note */}
          <p className="text-center text-white/25 text-xs mt-6 leading-relaxed">
            🔒 CPF criptografado · Conformidade LGPD · Dados protegidos
          </p>
        </div>
      </div>
    </div>
  );
};
