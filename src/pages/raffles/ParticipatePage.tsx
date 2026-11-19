import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import {
  Gift,
  Trophy,
  Users,
  Calendar,
  CheckCircle,
  Copy,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ExternalLink,
  Share2,
} from 'lucide-react';

export const ParticipatePage: React.FC = () => {
  const { idOrPin } = useParams<{ idOrPin?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, loginWithEmail, loginWithGoogle, register } = useAuth();
  const { toast } = useToast();

  const pinFromUrl = idOrPin || searchParams.get('pin') || '';

  // Estados principais
  const [pinInput, setPinInput] = useState(pinFromUrl);
  const [activePin, setActivePin] = useState(pinFromUrl);
  const [raffle, setRaffle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de Participação
  const [participateLoading, setParticipateLoading] = useState(false);
  const [participationTicket, setParticipationTicket] = useState<any>(null);
  const [alreadyParticipating, setAlreadyParticipating] = useState(false);

  // Estados de Auth Rápida (quando não logado)
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [additionalCpf, setAdditionalCpf] = useState('');

  // Busca o sorteio público por ID ou PIN
  const loadRaffle = async (identifier: string) => {
    if (!identifier.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/raffles/public/${identifier.trim()}`);
      setRaffle(res.data);
      setActivePin(identifier.trim());

      // Se usuário já está logado, verifica se já participa
      if (isAuthenticated && user) {
        checkUserParticipation(res.data.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Sorteio não encontrado com o PIN ou link informado.');
      setRaffle(null);
    } finally {
      setLoading(false);
    }
  };

  const checkUserParticipation = async (raffleId: string) => {
    try {
      const res = await api.get(`/raffles/${raffleId}`);
      if (res.data?.userParticipation) {
        setAlreadyParticipating(true);
        setParticipationTicket(res.data.userParticipation);
      }
    } catch {
      // Ignora erro se for 403
    }
  };

  useEffect(() => {
    if (pinFromUrl) {
      loadRaffle(pinFromUrl);
    }
  }, [pinFromUrl, isAuthenticated]);

  // Submeter PIN digitado
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      toast.warning('Digite o PIN ou cole o link do sorteio.');
      return;
    }
    // Suporta colar URL completa ou apenas o PIN
    let clean = pinInput.trim();
    if (clean.includes('/participar/')) {
      clean = clean.split('/participar/')[1].split('?')[0];
    } else if (clean.includes('pin=')) {
      clean = clean.split('pin=')[1].split('&')[0];
    }
    navigate(`/participar/${clean}`);
  };

  // Participar como usuário logado
  const handleParticipate = async (cpfToSend?: string) => {
    if (!raffle) return;
    setParticipateLoading(true);
    try {
      const res = await api.post(`/raffles/${raffle.id}/participate`, {
        acceptedRules: true,
        cpf: cpfToSend || additionalCpf || undefined,
      });

      setParticipationTicket(res.data);
      setAlreadyParticipating(true);
      toast.success('Você entrou no sorteio com sucesso!', 'Boa Sorte! 🎉');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Não foi possível confirmar a sua participação.');
    } finally {
      setParticipateLoading(false);
    }
  };

  // Cadastro rápido estilo Kahoot + Inscrição automática no sorteio
  const handleQuickRegisterAndJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.warning('Preencha seu nome, e-mail e senha.');
      return;
    }

    setParticipateLoading(true);
    try {
      // 1. Cadastra o usuário com CPF (se fornecido)
      await register(name, email, password, password, {
        cpf: cpf.trim() || undefined,
        accountType: 'PARTICIPANT',
      });

      // 2. Participa automaticamente do sorteio
      const res = await api.post(`/raffles/${raffle.id}/participate`, {
        acceptedRules: true,
        cpf: cpf.trim() || undefined,
      });

      setParticipationTicket(res.data);
      setAlreadyParticipating(true);
      toast.success('Conta criada e participação confirmada!', 'Sucesso Total! 🚀');
    } catch (err: any) {
      const msg = err.response?.data?.details?.[0]?.message || err.response?.data?.error || err.message;
      toast.error(msg || 'Erro ao cadastrar ou participar.');
    } finally {
      setParticipateLoading(false);
    }
  };

  // Login rápido + Inscrição
  const handleQuickLoginAndJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Preencha e-mail e senha.');
      return;
    }

    setParticipateLoading(true);
    try {
      await loginWithEmail(email, password);
      // O useEffect chamará checkUserParticipation ou podemos acionar a participação
      const res = await api.post(`/raffles/${raffle.id}/participate`, {
        acceptedRules: true,
      });
      setParticipationTicket(res.data);
      setAlreadyParticipating(true);
      toast.success('Login efetuado e participação confirmada!', 'Bem-vindo! 🎉');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Erro ao logar e participar.');
    } finally {
      setParticipateLoading(false);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/participar/${raffle?.id?.slice(0, 8).toUpperCase() || raffle?.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link do sorteio copiado! Envie para seus amigos.');
  };

  const copyTicketCode = () => {
    if (participationTicket?.ticketCode) {
      navigator.clipboard.writeText(participationTicket.ticketCode);
      toast.success('Código do bilhete copiado!');
    }
  };

  return (
    <div className="min-h-screen bg-[#210047] flex flex-col justify-between relative overflow-hidden text-white font-sans selection:bg-yellow-400 selection:text-purple-900">
      {/* ── Elementos Visuais Kahoot (Triângulos, Diamantes, Círculos) ──────── */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-violet-600/30 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-indigo-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-yellow-400/15 blur-3xl" />

      {/* Formas Geométricas decorativas estilo Kahoot */}
      <div className="pointer-events-none absolute top-12 left-10 w-12 h-12 border-4 border-yellow-400/30 rotate-12 rounded-xl hidden sm:block" />
      <div className="pointer-events-none absolute top-28 right-16 w-8 h-8 bg-rose-500/30 rotate-45 hidden sm:block" />
      <div className="pointer-events-none absolute bottom-24 left-16 w-10 h-10 border-4 border-emerald-400/30 rounded-full hidden sm:block" />
      <div className="pointer-events-none absolute bottom-16 right-20 w-14 h-14 bg-blue-500/20 rotate-12 rounded-2xl hidden sm:block" />

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="px-6 py-6 flex items-center justify-between relative z-20 max-w-5xl mx-auto w-full">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/30 group-hover:scale-105 transition">
            <Gift className="w-6 h-6 text-[#210047]" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">SorteioHub</span>
        </Link>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition flex items-center space-x-1.5"
            >
              <span>Meu Painel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/login?type=admin"
              className="px-4 py-2 rounded-xl bg-purple-600/60 hover:bg-purple-600 border border-purple-400/40 text-xs font-bold text-yellow-300 transition flex items-center space-x-1.5 shadow-sm"
              title="Acessar o painel para gerenciar e criar sorteios"
            >
              <span>👑 Área do Administrador</span>
            </Link>
          )}
        </div>
      </header>

      {/* ── Conteúdo Central ────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-20 max-w-xl mx-auto w-full">
        {/* CASO 1: Nenhum PIN selecionado ainda (Tela Estilo kahoot.it) */}
        {!raffle && !loading && (
          <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/40 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-yellow-400 to-amber-300 text-[#210047] mx-auto flex items-center justify-center shadow-xl shadow-yellow-400/20 transform hover:rotate-6 transition">
              <KeyRound className="w-10 h-10" />
            </div>

            <div>
              <h1 className="text-3xl font-black text-white">Entrar no Sorteio</h1>
              <p className="text-white/60 text-sm mt-1">
                Insira o PIN fornecido pelo organizador ou cole o link do sorteio
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="text"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                placeholder="PIN DO SORTEIO (Ex: 8D4F2A)"
                className="w-full text-center text-xl sm:text-2xl font-black uppercase tracking-wider py-4 px-6 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder-white/40 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 transition"
                autoFocus
              />

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-[#210047] font-black text-lg shadow-xl shadow-yellow-400/25 hover:shadow-yellow-400/40 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>ENTRAR NO SORTEIO</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 text-xs text-white/50 space-y-2">
              <div>
                É organizador ou quer criar seus próprios sorteios?
              </div>
              <div>
                <Link
                  to="/login?type=admin&tab=register"
                  className="font-bold text-yellow-300 hover:underline inline-flex items-center space-x-1"
                >
                  <span>Criar conta de Administrador de Sorteios</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* CASO 2: Carregando Sorteio */}
        {loading && (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-white font-bold text-lg">Carregando sorteio estilo Kahoot...</div>
          </div>
        )}

        {/* CASO 3: Sorteio Encontrado! Lobby do Jogador */}
        {raffle && (
          <div className="w-full space-y-6">
            {/* Card do Sorteio */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              {/* Badge de PIN */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                    PIN DO SORTEIO:
                  </span>
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-yellow-400 text-[#210047] shadow-sm">
                    {raffle.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={copyShareLink}
                  className="text-xs font-semibold text-yellow-300 hover:text-yellow-200 flex items-center space-x-1 transition"
                  title="Copiar link para amigos"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Compartilhar</span>
                </button>
              </div>

              {/* Título & Grupo */}
              <div className="pt-4 space-y-2 text-center">
                <div className="text-xs font-semibold text-yellow-300 uppercase tracking-widest">
                  {raffle.group?.name || 'Sorteio Oficial'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{raffle.title}</h2>
              </div>

              {/* Banner Dourado do Prêmio */}
              <div className="my-5 p-5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 text-[#210047] text-center shadow-lg transform hover:scale-[1.01] transition">
                <div className="text-[11px] font-black uppercase tracking-widest text-[#210047]/70 flex items-center justify-center space-x-1.5">
                  <Trophy className="w-4 h-4 text-[#210047]" />
                  <span>Prêmio do Ganhador</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
                  {raffle.prize}
                </div>
              </div>

              {/* Indicadores rápidos */}
              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <Calendar className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                  <div className="text-white/50 text-[10px]">Data do Sorteio</div>
                  <div className="font-bold text-white">
                    {new Date(raffle.drawDateTime).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <Users className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-white/50 text-[10px]">Participantes</div>
                  <div className="font-bold text-emerald-300">
                    {raffle._count?.participants || 0} concorrendo
                  </div>
                </div>
              </div>

              {/* Se JÁ ESTÁ PARTICIPANDO */}
              {alreadyParticipating ? (
                <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white">🎉 VOCÊ ESTÁ DENTRO!</h3>
                    <p className="text-white/70 text-xs mt-1">
                      Sua inscrição foi confirmada e auditada com sucesso.
                    </p>
                  </div>

                  {participationTicket?.ticketCode && (
                    <div className="p-4 rounded-2xl bg-white/10 border border-white/20 inline-block">
                      <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                        Seu Bilhete da Sorte
                      </div>
                      <div className="text-xl sm:text-2xl font-mono font-black text-yellow-300 mt-1 flex items-center justify-center space-x-2">
                        <span>{participationTicket.ticketCode}</span>
                        <button
                          onClick={copyTicketCode}
                          className="p-1 hover:text-white transition"
                          title="Copiar código"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      onClick={copyShareLink}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs transition flex items-center justify-center space-x-1.5"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Convidar Amigos</span>
                    </button>

                    <Link
                      to="/raffles"
                      className="flex-1 py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-[#210047] font-black text-xs transition flex items-center justify-center space-x-1.5"
                    >
                      <span>Ver Meus Bilhetes</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : isAuthenticated ? (
                /* USUÁRIO AUTENTICADO MAS AINDA NÃO PARTICIPOU */
                <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                  <div className="text-center">
                    <div className="text-xs text-white/70">
                      Olá, <strong className="text-yellow-300">{user?.name}</strong>!
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      Pronto para entrar na disputa por este prêmio?
                    </div>
                  </div>

                  {!user?.isCpfValidated && (
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/70 font-semibold block">
                        Informe seu CPF para validação do bilhete (LGPD):
                      </label>
                      <input
                        type="text"
                        value={additionalCpf}
                        onChange={(e) => setAdditionalCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => handleParticipate()}
                    disabled={participateLoading}
                    className="w-full py-4 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-[#210047] font-black text-base shadow-xl shadow-yellow-400/25 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {participateLoading ? (
                      <span className="animate-pulse">Confirmando Participação...</span>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-[#210047]" />
                        <span>ENTRAR NO SORTEIO AGORA 🎯</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* USUÁRIO NÃO LOGADO: CADASTRO OU LOGIN RÁPIDO ESTILO KAHOOT */
                <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                  {/* Seletor de Modo: Cadastro Rápido vs Já tenho Conta */}
                  <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                        authMode === 'register'
                          ? 'bg-yellow-400 text-[#210047] shadow'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Cadastro Rápido (1 Minuto)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                        authMode === 'login'
                          ? 'bg-yellow-400 text-[#210047] shadow'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Já Tenho Conta
                    </button>
                  </div>

                  {authMode === 'register' ? (
                    <form onSubmit={handleQuickRegisterAndJoin} className="space-y-3">
                      <div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Seu Nome Completo"
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        />
                      </div>

                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Seu melhor E-mail"
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value)}
                          placeholder="CPF (000.000.000-00)"
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Crie uma Senha"
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={participateLoading}
                        className="w-full py-4 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-[#210047] font-black text-base shadow-xl shadow-yellow-400/25 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                      >
                        {participateLoading ? (
                          <span className="animate-pulse">Criando conta e bilhete...</span>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 text-[#210047]" />
                            <span>CADASTRAR E GARANTIR MEU BILHETE 🚀</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleQuickLoginAndJoin} className="space-y-3">
                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Seu E-mail"
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        />
                      </div>

                      <div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Sua Senha"
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={participateLoading}
                        className="w-full py-4 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-[#210047] font-black text-base shadow-xl shadow-yellow-400/25 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                      >
                        {participateLoading ? (
                          <span className="animate-pulse">Entrando no sorteio...</span>
                        ) : (
                          <>
                            <ArrowRight className="w-5 h-5 text-[#210047]" />
                            <span>ENTRAR E PARTICIPAR 🎯</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Rodapé informativo */}
            <div className="text-center text-xs text-white/40 space-y-1">
              <div className="flex items-center justify-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Sorteio regulamentado conforme Lei 5.768/71 e em conformidade com a LGPD</span>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setRaffle(null);
                    setPinInput('');
                    navigate('/participar');
                  }}
                  className="text-yellow-300 hover:underline"
                >
                  ← Digitar outro PIN de sorteio
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="px-6 py-6 text-center text-xs text-white/30 relative z-20">
        © 2026 SorteioHub · Plataforma Segura de Sorteios estilo Kahoot
      </footer>
    </div>
  );
};
