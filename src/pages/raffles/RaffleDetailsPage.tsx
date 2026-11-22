import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Alert } from '../../components/Alert';
import { api } from '../../services/api';
import {
  Gift,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  FileText,
  Play,
  XCircle,
  Trophy,
  ArrowRight,
  Ticket,
  Copy,
  Share2,
  QrCode,
  ExternalLink,
  KeyRound,
  Users,
} from 'lucide-react';

export const RaffleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [raffle, setRaffle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [agreeRules, setAgreeRules] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);

  // Modais de Confirmação
  const [showDrawConfirm, setShowDrawConfirm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // PIN = primeiros 8 chars do UUID em maiúsculo (curto e fácil de lembrar)
  const getPin = (raffleId: string) => raffleId.slice(0, 8).toUpperCase();
  const getShareLink = (raffleId: string) =>
    `${window.location.origin}/participar/${raffleId.slice(0, 8).toUpperCase()}`;
  const getFullLink = (raffleId: string) =>
    `${window.location.origin}/participar/${raffleId}`;

  const copyPin = (raffleId: string) => {
    navigator.clipboard.writeText(getPin(raffleId));
    toast.info('PIN copiado! Envie para os participantes.', 'PIN Copiado');
  };
  const copyLink = (raffleId: string) => {
    navigator.clipboard.writeText(getShareLink(raffleId));
    toast.info('Link curto copiado! Envie para os participantes.', 'Link Copiado');
  };
  const copyFullLink = (raffleId: string) => {
    navigator.clipboard.writeText(getFullLink(raffleId));
    toast.info('Link completo copiado.', 'Link Copiado');
  };

  const fetchRaffle = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/raffles/${id}`);
      setRaffle(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaffle();
  }, [id]);

  const handleParticipate = async () => {
    if (!agreeRules) {
      setActionError('Você precisa aceitar as regras e regulamento para participar.');
      toast.warning('Aceite o regulamento para prosseguir.', 'Atenção');
      return;
    }
    setActionError(null);
    setSubmitting(true);
    try {
      await api.post(`/raffles/${id}/participate`, { acceptedRules: true });
      toast.success('Inscrição confirmada com sucesso! Seu bilhete foi emitido.', 'Boa Sorte!');
      fetchRaffle();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erro ao participar do sorteio.';
      setActionError(msg);
      toast.error(msg, 'Erro na Inscrição');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    try {
      await api.post(`/admin/raffles/${id}/publish`);
      toast.success('Sorteio publicado com sucesso! Os membros foram notificados.', 'Sorteio Aberto');
      fetchRaffle();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao publicar sorteio.', 'Falha na Publicação');
    }
  };

  const executeDraw = async () => {
    setShowDrawConfirm(false);
    try {
      await api.post(`/admin/raffles/${id}/draw`);
      toast.success('Sorteio realizado com sucesso pelo motor criptográfico!', 'Sorteio Concluído');
      navigate(`/raffles/${id}/results`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao realizar sorteio.', 'Falha no Motor');
    }
  };

  const executeCancelRaffle = async () => {
    if (!cancelReason.trim()) {
      toast.warning('Informe o motivo do cancelamento.', 'Justificativa Obrigatória');
      return;
    }
    try {
      await api.put(`/admin/raffles/${id}`, { cancellationReason: cancelReason });
      setShowCancelModal(false);
      toast.info('Sorteio cancelado com justificativa registrada.', 'Sorteio Cancelado');
      fetchRaffle();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao cancelar sorteio.', 'Falha ao Cancelar');
    }
  };

  const copyTicket = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.info('Código do bilhete copiado para a área de transferência!', 'Copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Carregando detalhes do sorteio...</div>;
  }

  if (!raffle) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sorteio Não Encontrado</h2>
        <p className="text-xs text-slate-500">
          Você não tem autorização para visualizar este sorteio ou ele foi removido.
        </p>
        <Link to="/raffles" className="inline-block text-xs font-semibold text-indigo-600 hover:underline">
          Voltar para sorteios
        </Link>
      </div>
    );
  }

  const isManager = raffle.isManager;
  const hasParticipated = raffle.hasParticipated;
  const participation = raffle.userParticipation;
  const isCpfReady = user?.isCpfValidated;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Action Bar (se for gestor) */}
      {isManager && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center space-x-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">Painel de Gestão do Sorteio</span>
            <span className="text-slate-400">• Status: <strong>{raffle.status}</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {raffle.status === 'DRAFT' && (
              <button
                onClick={handlePublish}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Publicar Sorteio
              </button>
            )}

            {raffle.status === 'PUBLISHED' && (
              <button
                onClick={() => setShowDrawConfirm(true)}
                className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Realizar Sorteio Agora</span>
              </button>
            )}

            {raffle.status !== 'DRAWN' && raffle.status !== 'CANCELLED' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-medium transition"
              >
                Cancelar
              </button>
            )}

            {/* Botão Compartilhar PIN (sempre visível para gestor) */}
            <button
              onClick={() => setShowSharePanel((v) => !v)}
              className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg text-xs font-black transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartilhar PIN / Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Painel de compartilhamento de PIN */}
      {raffle && isManager && showSharePanel && (
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-900/50 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg">
                <KeyRound className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Compartilhar Acesso ao Sorteio</h3>
                <p className="text-xs text-white/60">
                  Envie o PIN ou link para os participantes entrarem no sorteio
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSharePanel(false)}
              className="text-white/50 hover:text-white transition text-xs"
            >
              Fechar ✕
            </button>
          </div>

          {/* PIN em destaque */}
          <div className="text-center space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-yellow-300">
              PIN do Sorteio — Os participantes digitam isso na tela de entrada
            </div>
            <div className="inline-flex items-center space-x-4 bg-white/10 border border-white/20 rounded-2xl px-8 py-4">
              <span className="text-5xl sm:text-6xl font-black tracking-widest font-mono text-yellow-400 select-all">
                {getPin(raffle.id)}
              </span>
              <button
                onClick={() => copyPin(raffle.id)}
                className="p-3 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/40 text-yellow-300 transition"
                title="Copiar PIN"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Link curto e link completo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center space-x-1.5">
                <Share2 className="w-3.5 h-3.5" />
                <span>Link Curto (Recomendado)</span>
              </div>
              <div className="font-mono text-xs text-yellow-200 break-all bg-black/20 rounded-xl px-3 py-2 select-all">
                {getShareLink(raffle.id)}
              </div>
              <button
                onClick={() => copyLink(raffle.id)}
                className="w-full py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Link Curto</span>
              </button>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center space-x-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Link Completo (UUID)</span>
              </div>
              <div className="font-mono text-xs text-purple-200 break-all bg-black/20 rounded-xl px-3 py-2 select-all">
                {getFullLink(raffle.id)}
              </div>
              <button
                onClick={() => copyFullLink(raffle.id)}
                className="w-full py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Link Completo</span>
              </button>
            </div>
          </div>

          {/* Como funciona */}
          <div className="pt-2 border-t border-white/10 text-xs text-white/50 space-y-1">
            <div className="font-semibold text-white/70 text-[11px] uppercase tracking-wider">
              Como os participantes entram:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center pt-1">
              {[
                { step: '1', label: 'Acessa', desc: 'sorteioclub.com.br/participar' },
                { step: '2', label: 'Digita', desc: `PIN: ${getPin(raffle.id)}` },
                { step: '3', label: 'Concorre!', desc: 'Bilhete emitido automaticamente 🎉' },
              ].map(({ step, label, desc }) => (
                <div key={step} className="bg-white/5 rounded-xl p-2 border border-white/10">
                  <div className="text-yellow-400 font-black text-sm">{step}</div>
                  <div className="font-bold text-white/80 text-xs">{label}</div>
                  <div className="text-white/50 text-[10px]">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Card Principal */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden text-white">
        <div className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-white/60">
                <span className="font-bold text-yellow-300">Grupo: {raffle.group?.name}</span>
                <span>•</span>
                <span>{raffle._count?.participants || 0} participantes inscritos</span>
              </div>
              <h1 className="text-3xl font-black text-white">{raffle.title}</h1>
            </div>

            <div className="p-5 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 rounded-2xl text-right shadow-lg">
              <div className="text-[11px] uppercase font-black tracking-wider text-slate-950/70">Prêmio Oficial</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950">{raffle.prize}</div>
              <div className="text-[11px] font-bold text-slate-950/80 mt-0.5">
                {raffle.numberOfWinners} contemplado{raffle.numberOfWinners > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <p className="text-sm text-white/70 leading-relaxed">{raffle.description}</p>

          {/* Cronograma */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <div className="text-[11px] font-semibold text-white/50">Início das Inscrições</div>
              <div className="text-xs font-bold text-white">
                {new Date(raffle.participationStartDate).toLocaleDateString('pt-BR')} às{' '}
                {new Date(raffle.participationStartDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <div className="text-[11px] font-semibold text-white/50">Término das Inscrições</div>
              <div className="text-xs font-bold text-white">
                {new Date(raffle.participationEndDate).toLocaleDateString('pt-BR')} às{' '}
                {new Date(raffle.participationEndDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl space-y-1">
              <div className="text-[11px] font-bold text-yellow-300">Data do Sorteio</div>
              <div className="text-xs font-black text-yellow-200">
                {new Date(raffle.drawDateTime).toLocaleDateString('pt-BR')} às{' '}
                {new Date(raffle.drawDateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Regulamento */}
          {raffle.rules && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-yellow-300">
                <FileText className="w-4 h-4 text-yellow-400" />
                <span>Regulamento & Condições de Participação</span>
              </div>
              <p className="text-xs text-white/70 whitespace-pre-line leading-relaxed">
                {raffle.rules}
              </p>
            </div>
          )}

          {/* Área de Inscrição / Bilhete */}
          <div className="pt-4 border-t border-white/10">
            {raffle.status === 'DRAWN' ? (
              <div className="p-6 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-sm font-bold text-white">Este sorteio já foi realizado!</div>
                  <div className="text-xs text-purple-200">
                    O motor criptográfico gerou as evidências e os ganhadores oficiais.
                  </div>
                </div>

                <Link
                  to={`/raffles/${raffle.id}/results`}
                  className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-yellow-400/20 flex items-center space-x-1.5 transition"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Ver Ganhadores & Evidências</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            ) : hasParticipated ? (
              <div className="p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-base font-bold text-white">Você está participando deste sorteio!</h3>
                    <p className="text-xs text-emerald-200">
                      Sua inscrição foi confirmada e sua elegibilidade auditada. Guarde seu código de bilhete:
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 max-w-md">
                  <div className="flex-1 p-3 bg-white/10 border border-emerald-500/40 rounded-xl font-mono text-sm font-black text-yellow-300 flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Ticket className="w-4 h-4 text-yellow-400" />
                      <span>{participation?.ticketCode}</span>
                    </span>
                    <button
                      onClick={() => copyTicket(participation?.ticketCode)}
                      className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition"
                      title="Copiar código"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-white/50">
                  Confirmado em: {new Date(participation?.confirmedAt).toLocaleString('pt-BR')}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {actionError && (
                  <Alert variant="error" onClose={() => setActionError(null)}>
                    {actionError}
                  </Alert>
                )}

                {!isCpfReady ? (
                  <Alert variant="warning" title="Validação de CPF Obrigatória (LGPD)">
                    <p className="mb-3">
                      Conforme as diretrizes de integridade e a LGPD, é obrigatório cadastrar e validar seu CPF para concorrer.
                    </p>
                    <Link
                      to="/complete-profile"
                      className="inline-block px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-yellow-400/20 transition"
                    >
                      Cadastrar CPF e Endereço Agora
                    </Link>
                  </Alert>
                ) : (
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <label className="flex items-start space-x-3 text-xs text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeRules}
                        onChange={(e) => setAgreeRules(e.target.checked)}
                        className="mt-0.5 rounded text-yellow-400 focus:ring-yellow-400"
                      />
                      <span>
                        Li e concordo com todos os termos do <strong>Regulamento deste sorteio</strong> e confirmo que meus dados de contato e endereço para entrega do prêmio estão atualizados.
                      </span>
                    </label>

                    <button
                      onClick={handleParticipate}
                      disabled={submitting || !agreeRules}
                      className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-xs font-black transition shadow-lg shadow-yellow-400/25 disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>{submitting ? 'Confirmando...' : 'Confirmar Minha Participação'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação: Executar Sorteio */}
      <ConfirmModal
        isOpen={showDrawConfirm}
        title="Realizar Sorteio Agora"
        message="Deseja realmente acionar o motor criptográfico seguro para selecionar os ganhadores deste sorteio? Esta operação gera registros imutáveis e não poderá ser desfeita."
        confirmText="Iniciar Sorteio Criptográfico"
        cancelText="Voltar"
        variant="primary"
        onConfirm={executeDraw}
        onCancel={() => setShowDrawConfirm(false)}
      />

      {/* Modal Cancelar Sorteio */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cancelar Sorteio</h3>
            <p className="text-xs text-slate-500">
              Informe a justificativa do cancelamento. Esta informação será enviada aos participantes inscritos.
            </p>
            <textarea
              rows={3}
              required
              placeholder="Motivo do cancelamento..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={executeCancelRaffle}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
