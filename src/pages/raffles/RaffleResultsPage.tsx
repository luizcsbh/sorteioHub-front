import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Info,
  Lock,
} from 'lucide-react';

export const RaffleResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await api.get(`/raffles/${id}/results`);
        setResults(res.data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-white/40">Carregando resultados auditados...</div>;
  }

  if (!results) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Trophy className="w-12 h-12 text-white/30 mx-auto" />
        <h2 className="text-xl font-bold text-white">Resultados Indisponíveis</h2>
        <p className="text-xs text-white/60">
          Este sorteio ainda não foi realizado ou você não possui permissão para consultar.
        </p>
        <Link to="/raffles" className="inline-block text-xs font-bold text-yellow-400 hover:underline">
          Voltar aos sorteios
        </Link>
      </div>
    );
  }

  const { raffle, draw, winners } = results;
  const userWinner = winners.find((w: any) => w.isYou);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to={`/raffles/${id}`}
        className="inline-flex items-center text-xs font-semibold text-white/60 hover:text-yellow-400 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        <span>Voltar aos Detalhes do Sorteio</span>
      </Link>

      {/* Banner Comemorativo se o usuário for um dos contemplados */}
      {userWinner && (
        <div className="p-8 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 rounded-3xl text-slate-950 shadow-2xl shadow-yellow-400/20 relative overflow-hidden space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-black/10 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-950/70">
                Parabéns! Você foi Contemplado!
              </span>
              <h2 className="text-2xl font-black">Você Ganhou: {raffle.prize}</h2>
            </div>
          </div>

          <div className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-white space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-purple-700" />
              <span>Instruções de Resgate do Prêmio</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {userWinner.instructions || 'Entre em contato com o administrador do grupo para entrega do prêmio.'}
            </p>
          </div>
        </div>
      )}

      {/* Resultados Oficiais */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 shadow-xl p-8 space-y-6 text-white">
        <div className="text-center space-y-2 pb-6 border-b border-white/10">
          <div className="w-14 h-14 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded-2xl mx-auto flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">Resultado Oficial do Sorteio</h1>
          <p className="text-xs text-white/60 max-w-md mx-auto">
            Sorteio <strong className="text-white">{raffle.title}</strong> • Prêmio: <strong className="text-yellow-400">{raffle.prize}</strong>
          </p>
        </div>

        {/* Lista de Ganhadores */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
            Ganhadores Selecionados
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {winners.map((winner: any) => (
              <div
                key={winner.id}
                className={`p-5 rounded-2xl border transition flex items-center justify-between ${
                  winner.isYou
                    ? 'bg-yellow-400/20 border-yellow-400/40 shadow-lg text-white'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                      winner.rankPosition === 1
                        ? 'bg-yellow-400 text-slate-950'
                        : 'bg-white/10 text-white/80'
                    }`}
                  >
                    #{winner.rankPosition}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{winner.name}</span>
                      {winner.isYou && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-400 text-slate-950">
                          Você
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/50 flex items-center space-x-2 mt-0.5">
                      <span className="font-mono">CPF: {winner.cpfMasked}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 text-white/40">
                        <Lock className="w-3 h-3 text-yellow-400" />
                        <span>Protegido LGPD</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Contemplado</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Box de Auditoria Criptográfica */}
        {draw && (
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 text-xs text-white">
            <div className="flex items-center space-x-2 text-white font-bold uppercase tracking-wider text-xs">
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              <span>Evidências Criptográficas e Trilha de Auditoria</span>
            </div>

            <p className="text-white/70 text-[11px] leading-relaxed">
              O sorteio foi processado de forma determinística e imutável pelo motor de sorteios, utilizando
              geração aleatória criptográfica uniforme sem viés (Fisher-Yates via <code className="text-yellow-400">crypto.randomInt</code>).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <span className="text-white/50 text-[11px]">Total de Participantes Elegíveis:</span>
                <div className="font-bold text-white text-sm">{draw.totalEligible} participantes</div>
              </div>

              <div className="space-y-1">
                <span className="text-white/50 text-[11px]">Data/Hora da Execução (UTC/Local):</span>
                <div className="font-semibold text-white flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{new Date(draw.executedAt).toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <span className="text-white/50 text-[11px]">Hash SHA-256 do Conjunto de Inscritos:</span>
                <div className="p-2.5 bg-slate-950/60 border border-white/15 rounded-xl font-mono text-[11px] text-yellow-400 break-all select-all">
                  {draw.participantsHash}
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <span className="text-white/50 text-[11px]">Algoritmo Registrado:</span>
                <div className="font-mono text-white/80 text-[11px]">{draw.algorithm}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
