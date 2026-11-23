import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gift,
  Shield,
  Trophy,
  Users,
  Search,
  Ticket,
  QrCode,
  Zap,
  CheckCircle,
  ArrowRight,
  KeyRound,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [pinInput, setPinInput] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim()) {
      navigate(`/participar/${encodeURIComponent(pinInput.trim())}`);
    } else {
      navigate('/participar');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Como funciona a auditoria criptográfica dos sorteios?',
      a: 'Todos os sorteios utilizam um motor criptográfico baseado em SHA-256 e semente determinística gerada no momento da apuração. Qualquer participante pode verificar a integridade da lista de bilhetes e da chave pública utilizada.',
    },
    {
      q: 'Meus dados pessoais estão protegidos?',
      a: 'Sim, seguimos rigorosamente a LGPD (Lei Geral de Proteção de Dados). Seu CPF é processado em duas camadas criptográficas (HMAC-SHA256 e AES-256-GCM) e nunca é exposto em telas públicas.',
    },
    {
      q: 'Como faço para participar de um sorteio privado?',
      a: 'Você pode entrar diretamente pelo link do convite fornecido pelo organizador do grupo ou digitar o PIN do sorteio no campo de acesso rápido desta página.',
    },
    {
      q: 'Como recebo o prêmio se for o ganhador?',
      a: 'Ao ser contemplado, você receberá uma notificação instantânea no painel e um e-mail com as instruções oficiais de resgate cadastradas pelo organizador.',
    },
    {
      q: 'Posso organizar sorteios no meu próprio grupo?',
      a: 'Sim! Basta criar sua conta de Administrador para criar grupos fechados, cadastrar sorteios com prêmios e regras personalizadas, e convidar participantes.',
    },
  ];

  const features = [
    {
      icon: <Search className="w-6 h-6 text-yellow-400" />,
      title: 'Encontre Sorteios',
      description: 'Explore uma grande variedade de sorteios ativos e escolha seus favoritos para concorrer.',
    },
    {
      icon: <Gift className="w-6 h-6 text-pink-400" />,
      title: 'Crie Sorteios',
      description: 'Organize seus próprios sorteios de forma simples e segura, alcançando mais participantes.',
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-400" />,
      title: 'Comunidade Ativa',
      description: 'Conecte-se com participantes e organizadores de sorteios em grupos fechados exclusivos.',
    },
    {
      icon: <Trophy className="w-6 h-6 text-yellow-400" />,
      title: 'Prêmios Incríveis',
      description: 'Concorra a prêmios exclusivos com chances reais de ganhar e histórico transparente.',
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      title: 'Sorteios Verificados',
      description: 'Todos os sorteios são auditáveis com hash criptográfico SHA-256 para total integridade.',
    },
    {
      icon: <Ticket className="w-6 h-6 text-cyan-400" />,
      title: 'Fácil Participação',
      description: 'Interface intuitiva e processo simplificado para emitir seus bilhetes em poucos segundos.',
    },
    {
      icon: <QrCode className="w-6 h-6 text-purple-400" />,
      title: 'Compartilhamento Rápido',
      description: 'Gere PINs e QR Codes exclusivos para compartilhar facilmente nas redes sociais e WhatsApp.',
    },
  ];

  return (
    <div className="text-white space-y-24 pb-16">
      {/* ── 1. HERO SECTION ────────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Glows de fundo */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-yellow-400/15 via-purple-600/20 to-transparent blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge de Destaque */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/25 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">
              Sorteios Auditáveis & Grupos Fechados
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Crie e Participe de{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              Sorteios Incríveis
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Sua plataforma completa para encontrar, participar e criar sorteios com transparência, segurança criptográfica e conformidade com a LGPD.
          </p>

          {/* Atalho de PIN no Hero */}
          <div className="max-w-md mx-auto pt-2">
            <form
              onSubmit={handlePinSubmit}
              className="flex flex-col sm:flex-row items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl"
            >
              <div className="relative w-full flex-1">
                <KeyRound className="w-5 h-5 text-yellow-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Digite o PIN do sorteio..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-white placeholder-white/40 text-sm font-semibold focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-yellow-400/20 whitespace-nowrap cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>Entrar no Sorteio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Botões de Ação Principais */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-2xl text-base shadow-xl shadow-yellow-400/30 transition transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <span>Acessar Meu Painel</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-2xl text-base shadow-xl shadow-yellow-400/30 transition transform hover:-translate-y-0.5"
                >
                  Começar Agora
                </Link>
                <Link
                  to="/participar"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl text-base transition backdrop-blur-md"
                >
                  Participar de Sorteio
                </Link>
              </>
            )}
            <Link
              to="/raffles"
              className="px-6 py-4 text-white/70 hover:text-white font-semibold text-base transition flex items-center space-x-1.5"
            >
              <span>Ver Sorteios Ativos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Banner do usuário autenticado */}
          {isAuthenticated && user && (
            <div className="max-w-xl mx-auto mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 flex items-center justify-between">
              <span>Logado como <strong className="text-white">{user.name}</strong></span>
              <Link to="/profile" className="text-yellow-400 hover:underline font-bold">Configurações &rarr;</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── 2. STATS & CONFIANÇA ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
            <div className="text-xs text-white/50 font-semibold uppercase tracking-wider">Auditável SHA-256</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">LGPD</div>
            <div className="text-xs text-white/50 font-semibold uppercase tracking-wider">Dados Criptografados</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-400/20 text-indigo-300 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">Instantâneo</div>
            <div className="text-xs text-white/50 font-semibold uppercase tracking-wider">Resultado Imediato</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-pink-400/20 text-pink-300 flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">Oficial</div>
            <div className="text-xs text-white/50 font-semibold uppercase tracking-wider">Garantia de Entrega</div>
          </div>
        </div>
      </section>

      {/* ── 3. POR QUE ESCOLHER O SORTEIOCLUB ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">Diferenciais Exclusivos</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Por que escolher o SorteioClub?</h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Descubra todas as possibilidades que nossa plataforma oferece para administradores e participantes de sorteios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-400/30 rounded-3xl p-6 transition duration-300 backdrop-blur-xl group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-yellow-300 transition">
                  {item.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. COMO FUNCIONA ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">Simples e Rápido</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Como Funciona</h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Participar ou organizar sorteios no SorteioClub leva menos de 2 minutos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-3xl p-8 relative overflow-hidden space-y-4">
            <div className="text-4xl font-black text-yellow-400/30">01</div>
            <h3 className="text-xl font-bold text-white">Acesse com PIN ou Convite</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Receba o PIN ou link do organizador do grupo fechado e entre instantaneamente no sorteio.
            </p>
          </div>

          <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-3xl p-8 relative overflow-hidden space-y-4">
            <div className="text-4xl font-black text-yellow-400/30">02</div>
            <h3 className="text-xl font-bold text-white">Confirme sua Participação</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Identifique-se com segurança protegida pela LGPD para garantir que seu bilhete seja único e válido.
            </p>
          </div>

          <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-3xl p-8 relative overflow-hidden space-y-4">
            <div className="text-4xl font-black text-yellow-400/30">03</div>
            <h3 className="text-xl font-bold text-white">Concorra com Auditoria</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Acompanhe o sorteio em tempo real com resultado criptografado e receba o prêmio com segurança.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. PERGUNTAS FREQUENTES (FAQ) ───────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 text-yellow-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Tire Suas Dúvidas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Perguntas Frequentes</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between space-x-4 cursor-pointer hover:bg-white/5 transition"
              >
                <span className="font-bold text-sm sm:text-base text-white">{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-yellow-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/50 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm text-white/70 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. CALL TO ACTION FINAL ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-400 text-slate-950 rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950">
              Pronto para Começar?
            </h2>
            <p className="text-base sm:text-lg text-slate-900/80 font-medium leading-relaxed">
              Junte-se a milhares de pessoas que já estão participando de sorteios incríveis no SorteioClub.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="px-8 py-4 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-2xl text-base shadow-xl transition transform hover:-translate-y-0.5"
            >
              Criar Conta Grátis
            </Link>
            <Link
              to="/participar"
              className="px-8 py-4 bg-slate-950/10 hover:bg-slate-950/20 border border-slate-950/20 text-slate-950 font-bold rounded-2xl text-base transition"
            >
              Entrar com PIN
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
