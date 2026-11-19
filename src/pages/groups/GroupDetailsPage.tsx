import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { api } from '../../services/api';
import {
  Users,
  Gift,
  Share2,
  Copy,
  Check,
  UserCheck,
  UserX,
  Plus,
  Clock,
  ArrowRight,
  ShieldAlert,
  Send,
} from 'lucide-react';

export const GroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'raffles' | 'members' | 'invites'>('raffles');

  // Modal de Confirmação para Remoção
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  // Convite
  const [inviteDays, setInviteDays] = useState(7);
  const [inviteUses, setInviteUses] = useState(10);
  const [targetEmail, setTargetEmail] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchGroupDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/groups/${id}`);
      setGroup(res.data);

      const isManager = res.data.managerId === user?.id || user?.role === 'SUPER_ADMIN';
      if (isManager) {
        const memRes = await api.get(`/groups/${id}/members`);
        setMembers(memRes.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const handleGenerateInvite = async (type: 'TOKEN_LINK' | 'INDIVIDUAL_EMAIL') => {
    setInviteLoading(true);
    try {
      const res = await api.post(`/groups/${id}/invitations`, {
        type,
        expiresInDays: inviteDays,
        maxUses: type === 'INDIVIDUAL_EMAIL' ? 1 : inviteUses,
        targetEmail: type === 'INDIVIDUAL_EMAIL' ? targetEmail : null,
      });
      setGeneratedInvite(res.data);
      if (type === 'INDIVIDUAL_EMAIL') {
        toast.success(`Convite emitido e enviado para ${targetEmail}!`, 'Convite Enviado');
        setTargetEmail('');
      } else {
        toast.success('Link de convite gerado com sucesso!', 'Link Criado');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao gerar convite.', 'Falha no Convite');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleApproveMember = async (memberUserId: string) => {
    try {
      await api.post(`/groups/${id}/members/${memberUserId}/approve`);
      toast.success('Participante aprovado com sucesso!', 'Membro Ativo');
      fetchGroupDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao aprovar membro.', 'Falha na Aprovação');
    }
  };

  const executeRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await api.delete(`/groups/${id}/members/${memberToRemove}`);
      toast.info('Participante removido do grupo.', 'Membro Removido');
      setMemberToRemove(null);
      fetchGroupDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao remover membro.', 'Falha ao Remover');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.info('Link copiado para a área de transferência!', 'Copiado');
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return <div className="py-20 text-center text-white/40">Carregando informações do grupo...</div>;
  }

  if (!group) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Acesso Restrito</h2>
        <p className="text-xs text-white/60">
          Este grupo é privado e seu acesso não foi autorizado ou ele não existe.
        </p>
        <Link to="/groups" className="inline-block text-xs font-bold text-yellow-400 hover:underline">
          Voltar para meus grupos
        </Link>
      </div>
    );
  }

  const isManager = group.managerId === user?.id || user?.role === 'SUPER_ADMIN';
  const inviteUrl = generatedInvite ? `${window.location.origin}/invite/${generatedInvite.token}` : '';
  const whatsappUrl = generatedInvite
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `Olá! Você foi convidado para o grupo fechado "${group.name}". Acesse e participe dos sorteios exclusivos: ${inviteUrl}`
      )}`
    : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header do Grupo */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 p-8 shadow-xl space-y-4 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {group.status}
              </span>
              <span className="text-xs text-white/60">
                Gestor: <strong className="text-white">{group.manager?.name}</strong>
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">{group.name}</h1>
            <p className="text-sm text-white/70 max-w-2xl">{group.description}</p>
          </div>

          <div className="flex items-center space-x-3">
            {isManager && (
              <Link
                to={`/admin/raffles/new?groupId=${group.id}`}
                className="inline-flex items-center px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-yellow-400/20 transition"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Criar Sorteio no Grupo
              </Link>
            )}
          </div>
        </div>

        {/* Abas */}
        <div className="flex border-b border-white/10 pt-4 space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('raffles')}
            className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'raffles'
                ? 'border-yellow-400 text-yellow-400 font-bold'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Sorteios ({group.raffles?.length || 0})</span>
          </button>

          {isManager && (
            <>
              <button
                onClick={() => setActiveTab('members')}
                className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
                  activeTab === 'members'
                    ? 'border-yellow-400 text-yellow-400 font-bold'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Membros ({members.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('invites')}
                className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
                  activeTab === 'invites'
                    ? 'border-yellow-400 text-yellow-400 font-bold'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>Convites & Compartilhamento</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'raffles' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Sorteios deste Grupo</h2>
          {group.raffles?.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-8 text-center text-white/60 text-xs">
              Nenhum sorteio publicado neste grupo no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.raffles.map((raffle: any) => (
                <div
                  key={raffle.id}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6 shadow-xl hover:border-yellow-400/40 hover:bg-white/15 transition space-y-3 text-white"
                >
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/80 border border-white/15">
                      {raffle.status}
                    </span>
                    <span className="text-sm font-black text-yellow-400">{raffle.prize}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{raffle.title}</h3>
                  <p className="text-xs text-white/60 line-clamp-2">{raffle.description}</p>

                  <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                    <div className="text-white/60 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-yellow-400" />
                      <span>{new Date(raffle.drawDateTime).toLocaleDateString('pt-BR')}</span>
                    </div>

                    <Link
                      to={`/raffles/${raffle.id}`}
                      className="inline-flex items-center text-xs font-bold text-yellow-400 hover:text-yellow-300 transition"
                    >
                      <span>Acessar</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && isManager && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 overflow-hidden shadow-xl text-white">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Membros Participantes</h2>
              <p className="text-xs text-white/60">
                Gerencie quem pode visualizar e concorrer aos prêmios deste grupo fechado.
              </p>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {members.map((m) => (
              <div key={m.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-white/5 transition">
                <div className="flex items-center space-x-4">
                  {m.user?.avatarUrl ? (
                    <img src={m.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-white/20" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/10 text-yellow-400 border border-white/15 flex items-center justify-center font-bold text-xs">
                      {m.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-white">{m.user?.name}</div>
                    <div className="text-xs text-white/50 flex items-center space-x-2">
                      <span>{m.user?.email}</span>
                      <span>•</span>
                      <span>CPF: {m.user?.cpfMasked || '***.***.***-**'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      m.status === 'ATIVO'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : m.status === 'PENDENTE'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {m.status}
                  </span>

                  {m.status === 'PENDENTE' && (
                    <button
                      onClick={() => handleApproveMember(m.userId)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow transition"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Aprovar</span>
                    </button>
                  )}

                  {m.userId !== group.managerId && (
                    <button
                      onClick={() => setMemberToRemove(m.userId)}
                      className="p-1.5 text-white/40 hover:text-rose-400 rounded-lg transition"
                      title="Remover membro"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'invites' && isManager && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
          {/* Gerador de Link Compartilhável */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-yellow-400" />
              <span>Gerar Link de Convite (WhatsApp / Redes)</span>
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Crie links com tokens criptográficos imprevisíveis para compartilhar com membros do seu grupo.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">Validade (Dias)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={inviteDays}
                  onChange={(e) => setInviteDays(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-xs focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">Limite de Utilizações</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={inviteUses}
                  onChange={(e) => setInviteUses(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-xs focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => handleGenerateInvite('TOKEN_LINK')}
              disabled={inviteLoading}
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-yellow-400/20"
            >
              {inviteLoading ? 'Gerando...' : 'Gerar Link Seguro'}
            </button>

            {generatedInvite && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-white/80">Link Gerado com Sucesso:</div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-mono text-white select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(inviteUrl)}
                    className="p-2 bg-white/10 border border-white/20 hover:bg-white/20 rounded-xl text-white"
                    title="Copiar link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition space-x-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Compartilhar no WhatsApp</span>
                </a>
              </div>
            )}
          </div>

          {/* Convite Individual por E-mail */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-yellow-400" />
              <span>Convite Individual por E-mail</span>
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Envie um convite exclusivo para um e-mail específico. O convite expira após 1 uso único.
            </p>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">E-mail do Convidado</label>
              <input
                type="email"
                placeholder="nome@exemplo.com.br"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleGenerateInvite('INDIVIDUAL_EMAIL')}
              disabled={inviteLoading || !targetEmail}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 shadow-lg shadow-purple-600/20"
            >
              Emitir Convite por E-mail
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Remover Membro */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        title="Remover Participante"
        message="Tem certeza que deseja remover este participante do grupo? Ele perderá acesso imediato aos sorteios privados vinculados."
        confirmText="Sim, Remover"
        cancelText="Voltar"
        variant="danger"
        onConfirm={executeRemoveMember}
        onCancel={() => setMemberToRemove(null)}
      />
    </div>
  );
};
