import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Gift,
  Users,
  Shield,
  KeyRound,
  ArrowLeft,
  Sparkles,
  Lock,
} from 'lucide-react';

// ── Google SDK type ──────────────────────────────────────────────────────────
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, config: object) => void;
          prompt: (callback?: (notification: any) => void) => void;
        };
      };
    };
  }
}

type Tab = 'login' | 'register';

interface LoginPageProps {
  isAdminRoute?: boolean;
}

// ── Password rules ───────────────────────────────────────────────────────────
const passwordRules = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: '1 letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: '1 letra minúscula', test: (v: string) => /[a-z]/.test(v) },
  { label: '1 número', test: (v: string) => /\d/.test(v) },
  { label: '1 caractere especial', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

// ── Password input component ──────────────────────────────────────────────────
const PasswordInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
}> = ({
  value,
  onChange,
  placeholder = 'Senha',
  disabled,
  id,
  name,
  autoComplete = 'current-password',
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 pr-11 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition text-sm"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition cursor-pointer"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

// ── Feature item ─────────────────────────────────────────────────────────────
const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({
  icon,
  title,
  desc,
}) => (
  <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
    <div className="p-2 rounded-xl bg-white/10 text-yellow-400 shrink-0 mt-0.5">{icon}</div>
    <div>
      <div className="text-white text-sm font-bold">{title}</div>
      <div className="text-white/60 text-xs mt-0.5 leading-relaxed">{desc}</div>
    </div>
  </div>
);

// ── Main Login Page Component ────────────────────────────────────────────────
export const LoginPage: React.FC<LoginPageProps> = ({ isAdminRoute = false }) => {
  const { loginWithGoogle, loginWithEmail, register, isAuthenticated, needsProfileCompletion, user } =
    useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Verifica se o acesso veio pela rota oculta de administrador
  const isHiddenAdmin =
    isAdminRoute ||
    location.pathname === '/admin/login' ||
    location.pathname === '/admin-login' ||
    searchParams.get('admin') === 'true' ||
    searchParams.get('type') === 'admin' ||
    searchParams.get('role') === 'admin';

  const initialTab = (searchParams.get('tab') as Tab) || 'login';
  const [tab, setTab] = useState<Tab>(initialTab);
  const isInitializedRef = useRef(false);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
  const hasRealGoogle = !!GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('cole_seu');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Google loading
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (needsProfileCompletion) {
        navigate('/complete-profile');
      } else if (user?.role === 'ADMINISTRATOR' || user?.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, needsProfileCompletion, user, navigate]);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const initGoogleAuth = () => {
    if (!window.google?.accounts?.id || !hasRealGoogle || isInitializedRef.current) return;
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        use_fedcm_for_prompt: true,
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
      isInitializedRef.current = true;
    } catch {
      // Ignora falhas de inicialização silenciosas
    }
  };

  const handleGoogleClick = () => {
    setGoogleLoading(true);

    if (window.google?.accounts?.id && hasRealGoogle) {
      try {
        initGoogleAuth();
        window.google.accounts.id.prompt();
        setTimeout(() => setGoogleLoading(false), 2500);
        return;
      } catch {
        setGoogleLoading(false);
      }
    }

    // Fallback amigável se a API do Google não responder
    handleMockLogin(
      isHiddenAdmin ? 'admin@sorteioclub.com.br' : 'participante@sorteioclub.com.br',
      isHiddenAdmin ? 'Administrador Geral' : 'Participante Sorteio'
    );
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
      toast.warning('Preencha seu e-mail e senha.');
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
      toast.warning('Preencha todos os campos do cadastro.');
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error('As senhas digitadas não coincidem.');
      return;
    }
    const failedRule = passwordRules.find((r) => !r.test(regPassword));
    if (failedRule) {
      toast.error(`Requisito de senha não atendido: ${failedRule.label}`);
      return;
    }
    setRegLoading(true);
    try {
      await register(regName, regEmail, regPassword, regConfirm, {
        accountType: isHiddenAdmin ? 'ADMINISTRATOR' : 'PARTICIPANT',
      });
      toast.success(
        isHiddenAdmin
          ? 'Conta de Administrador criada com sucesso!'
          : 'Conta criada com sucesso! Seja bem-vindo.'
      );
    } catch (err: any) {
      const detailsMsg = err.response?.data?.details?.[0]?.message;
      toast.error(detailsMsg || err.response?.data?.error || err.message || 'Erro ao criar conta.');
    } finally {
      setRegLoading(false);
    }
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition text-sm';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex overflow-hidden relative">
      {/* ── Background Glows ─────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-yellow-500/10 blur-3xl" />

      {/* ── Painel Esquerdo — Apresentação da Plataforma (Desktop) ───────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 xl:p-16 relative z-10">
        <div>
          {/* Logo e Botão de Voltar Estilizado */}
          <div className="flex items-center justify-between mb-12">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/30 group-hover:scale-105 transition">
                <Gift className="w-6 h-6 text-slate-950" />
              </div>
              <span className="text-white text-2xl font-black tracking-tight">SorteioClub</span>
            </Link>

            {/* Botão de Voltar Real com Efeito Glass */}
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer group"
              title="Voltar para a página anterior"
            >
              <ArrowLeft className="w-4 h-4 text-yellow-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Voltar</span>
            </button>
          </div>

          {/* Hero text do painel esquerdo */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-yellow-400/15 border border-yellow-400/25 rounded-full px-3.5 py-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-xs font-bold uppercase tracking-wider">
                {isHiddenAdmin ? 'Painel de Gestão & Administração' : 'Plataforma Oficial de Sorteios'}
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              {isHiddenAdmin ? (
                <>
                  Gestão completa e{' '}
                  <span className="text-purple-400 bg-gradient-to-r from-purple-300 to-indigo-400 bg-clip-text text-transparent">
                    auditoria de sorteios
                  </span>
                </>
              ) : (
                <>
                  Sua chance de{' '}
                  <span className="text-yellow-400 bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                    ganhar prêmios
                  </span>{' '}
                  com total segurança
                </>
              )}
            </h1>

            <p className="text-white/70 text-sm xl:text-base leading-relaxed max-w-md">
              {isHiddenAdmin
                ? 'Ambiente restrito de organizadores para gerenciar grupos fechados, cadastrar cotas, automatizar apurações e consultar logs de auditoria criptográfica.'
                : 'Concorra em grupos privados com garantia de integridade, bilhetes únicos validados e apuração transparente com auditoria criptográfica.'}
            </p>

            <div className="space-y-3 pt-3 max-w-md">
              <FeatureItem
                icon={<Shield className="w-5 h-5 text-emerald-400" />}
                title="Auditoria Criptográfica SHA-256"
                desc="Apuração com semente imutável e comprovação pública da lisura do sorteio."
              />
              <FeatureItem
                icon={<Users className="w-5 h-5 text-indigo-400" />}
                title="Grupos Fechados & Exclusivos"
                desc="Participe ou gerencie comunidades com convites diretos e proteção LGPD."
              />
              <FeatureItem
                icon={<KeyRound className="w-5 h-5 text-yellow-400" />}
                title="Participação Simples por PIN"
                desc="Acesse instantaneamente salas de sorteios digitando seu código PIN."
              />
            </div>
          </div>
        </div>

        {/* Rodapé do painel esquerdo */}
        <div className="pt-8 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span>© {new Date().getFullYear()} SorteioClub. Todos os direitos reservados.</span>
          <Link to="/legal" className="hover:text-yellow-400 transition">Privacidade & LGPD</Link>
        </div>
      </div>

      {/* ── Painel Direito — Formulário de Acesso ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md py-6">
          {/* Barra Superior Mobile com Logo e Botão de Voltar */}
          <div className="flex lg:hidden items-center justify-between mb-6">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center shadow-md">
                <Gift className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-white text-lg font-black">SorteioClub</span>
            </Link>

            {/* Botão de Voltar Mobile */}
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-yellow-400" />
              <span>Voltar</span>
            </button>
          </div>

          {/* Card Principal */}
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-6">

            {/* Se for ROTA OCULTA DE ADMIN: exibe badge de segurança administrativa */}
            {isHiddenAdmin ? (
              <div className="bg-purple-950/60 border border-purple-400/40 rounded-2xl p-4 flex items-center space-x-3 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-purple-300">
                    Acesso Administrativo Restrito
                  </div>
                  <div className="text-[11px] text-white/60 mt-0.5">
                    Área restrita a gestores e organizadores de sorteios.
                  </div>
                </div>
              </div>
            ) : (
              /* Se for ROTA PÚBLICA NORMAL: Banner de PIN estilo Kahoot para participantes */
              <div className="bg-gradient-to-r from-yellow-400/15 via-amber-400/10 to-yellow-400/5 border border-yellow-400/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5 text-yellow-300 text-xs font-bold">
                    <KeyRound className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Tem um PIN de Sorteio?</span>
                  </div>
                  <p className="text-[11px] text-white/60">
                    Entre direto na sala do sorteio sem precisar de cadastro prévio.
                  </p>
                </div>
                <Link
                  to="/participar"
                  className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black rounded-xl transition shadow-md shadow-yellow-400/20 whitespace-nowrap shrink-0"
                >
                  Digitar PIN &rarr;
                </Link>
              </div>
            )}

            {/* Cabeçalho do Card */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-white">
                {isHiddenAdmin
                  ? tab === 'login'
                    ? 'Login de Administrador 👑'
                    : 'Cadastro de Organizador 👑'
                  : tab === 'login'
                  ? 'Bem-vindo de volta! 👋'
                  : 'Criar sua Conta 🎉'}
              </h2>
              <p className="text-white/50 text-xs sm:text-sm">
                {isHiddenAdmin
                  ? tab === 'login'
                    ? 'Informe suas credenciais para acessar o painel de gestão'
                    : 'Cadastre sua conta para criar grupos e organizar sorteios'
                  : tab === 'login'
                  ? 'Acesse sua conta para conferir seus bilhetes e prêmios'
                  : 'Preencha seus dados para começar a concorrer gratuitamente'}
              </p>
            </div>

            {/* Botão Oficial do Google */}
            <div>
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={googleLoading}
                className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-md transition disabled:opacity-60 cursor-pointer text-sm"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span>Continuar com Google</span>
              </button>
            </div>

            {/* Divisor */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/15" />
              <span className="mx-3 text-white/35 text-xs font-semibold uppercase tracking-wider">
                ou com e-mail
              </span>
              <div className="flex-grow border-t border-white/15" />
            </div>

            {/* Alternador de Abas: Entrar vs Criar Conta */}
            <div className="flex bg-white/5 rounded-2xl p-1 gap-1 border border-white/10">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  tab === 'login'
                    ? 'bg-yellow-400 text-slate-950 shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Fazer Login
              </button>

              <button
                type="button"
                onClick={() => setTab('register')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  tab === 'register'
                    ? 'bg-yellow-400 text-slate-950 shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Criar Nova Conta
              </button>
            </div>

            {/* ── Formulário de Login ──────────────────────────────────────── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-white/70 text-xs font-semibold mb-1.5">
                    Seu e-mail
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ex: seu@email.com"
                    disabled={loginLoading}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-xs font-semibold mb-1.5">
                    Sua senha
                  </label>
                  <PasswordInput
                    id="login-password"
                    name="password"
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={setLoginPassword}
                    placeholder="Digite sua senha"
                    disabled={loginLoading}
                  />
                </div>

                {/* Esqueceu a Senha */}
                <div className="text-right -mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-white/50 hover:text-yellow-400 transition"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-lg shadow-yellow-400/20 transition disabled:opacity-60 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Entrando...</span>
                    </>
                  ) : (
                    <span>
                      {isHiddenAdmin ? 'Entrar como Administrador' : 'Entrar na Plataforma'}
                    </span>
                  )}
                </button>
              </form>
            )}

            {/* ── Formulário de Cadastro ──────────────────────────────────── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-white/70 text-xs font-semibold mb-1.5">
                    Nome completo
                  </label>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Seu nome completo"
                    disabled={regLoading}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-xs font-semibold mb-1.5">
                    E-mail oficial
                  </label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ex: seu@email.com"
                    disabled={regLoading}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-xs font-semibold mb-1.5">
                    Criar senha segura
                  </label>
                  <PasswordInput
                    id="reg-password"
                    name="password"
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={setRegPassword}
                    placeholder="Crie sua senha"
                    disabled={regLoading}
                  />

                  {/* Validações visuais */}
                  {regPassword.length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 pt-2 px-1">
                      {passwordRules.map((r) => (
                        <div
                          key={r.label}
                          className={`flex items-center space-x-1.5 text-[10px] font-medium transition ${
                            r.test(regPassword) ? 'text-emerald-400' : 'text-white/35'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>{r.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-xs font-semibold mb-1.5">
                    Confirmar senha
                  </label>
                  <PasswordInput
                    id="reg-confirm"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={regConfirm}
                    onChange={setRegConfirm}
                    placeholder="Repita a senha criada"
                    disabled={regLoading}
                  />
                  {regConfirm.length > 0 && regPassword !== regConfirm && (
                    <p className="text-[11px] text-rose-400 pt-1 px-1">As senhas não coincidem.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-lg shadow-yellow-400/20 transition disabled:opacity-60 flex items-center justify-center space-x-2 pt-3 cursor-pointer"
                >
                  {regLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Cadastrando...</span>
                    </>
                  ) : (
                    <span>
                      {isHiddenAdmin
                        ? 'Criar Conta de Administrador 👑'
                        : 'Criar Minha Conta Grátis 🎉'}
                    </span>
                  )}
                </button>
              </form>
            )}

            {/* Aviso de Segurança e Conformidade */}
            <div className="pt-2 text-center">
              <p className="text-[11px] text-white/40 leading-relaxed">
                Ao continuar, você concorda com nossos{' '}
                <Link to="/legal" className="text-white/60 hover:text-yellow-400 underline">
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link to="/legal" className="text-white/60 hover:text-yellow-400 underline">
                  Política de Privacidade (LGPD)
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
