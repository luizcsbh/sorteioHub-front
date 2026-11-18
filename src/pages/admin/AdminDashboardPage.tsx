import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import {
  Shield,
  Users,
  Gift,
  Trophy,
  Bell,
  AlertTriangle,
  FileText,
  Plus,
  Play,
  CheckCircle,
  Clock,
  Send,
  X,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<any>(null);
  const [reports, setReports] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReportTab, setActiveReportTab] = useState<'groups' | 'raffles' | 'winners' | 'invites' | 'audit'>('groups');

  // Modal Criar Sorteio
  const [showRaffleModal, setShowRaffleModal] = useState(false);
  const [raffleForm, setRaffleForm] = useState({
    groupId: '',
    title: '',
    description: '',
    prize: '',
    rules: '',
    winnerInstructions: '',
    numberOfWinners: 1,
    maxEntriesPerPerson: 1,
    participationStartDate: new Date().toISOString().slice(0, 16),
    participationEndDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    drawDateTime: new Date(Date.now() + 8 * 86400000).toISOString().slice(0, 16),
    legalAuthorizationCode: '',
  });
  const [createRaffleLoading, setCreateRaffleLoading] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, repRes, grpRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/reports'),
        api.get('/groups'),
      ]);
      setDashboard(dashRes.data);
      setReports(repRes.data);
      setGroups(grpRes.data);
      if (grpRes.data.length > 0 && !raffleForm.groupId) {
        setRaffleForm((prev) => ({ ...prev, groupId: grpRes.data[0].id }));
      }
    } catch (err) {
      console.error('Erro ao carregar dados administrativos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateRaffleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateRaffleLoading(true);
    try {
      await api.post('/admin/raffles', {
        ...raffleForm,
        numberOfWinners: Number(raffleForm.numberOfWinners),
        maxEntriesPerPerson: Number(raffleForm.maxEntriesPerPerson),
        participationStartDate: new Date(raffleForm.participationStartDate).toISOString(),
        participationEndDate: new Date(raffleForm.participationEndDate).toISOString(),
        drawDateTime: new Date(raffleForm.drawDateTime).toISOString(),
      });
      setShowRaffleModal(false);
      loadAdminData();
      toast.success('Sorteio criado com sucesso em modo rascunho!', 'Sorteio Salvo');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao criar sorteio.', 'Falha ao Criar');
    } finally {
      setCreateRaffleLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Carregando painel administrativo...</div>;
  }

  const ind = dashboard?.indicators || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Shield className="w-7 h-7 text-indigo-600" />
            <span>Painel Administrativo & Governança</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Indicadores gerenciais, auditoria e relatórios de sorteios e grupos fechados
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/campaigns"
            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
          >
            <Send className="w-4 h-4 mr-1.5 text-indigo-600" />
            Campanhas & E-mails
          </Link>

          <button
            onClick={() => setShowRaffleModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo Sorteio
          </button>
        </div>
      </div>

      {/* 10 Indicadores Conforme prompt.json */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-slate-500">Total de Usuários</div>
          <div className="text-2xl font-bold text-slate-900">{ind.totalUsers || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-slate-500">Total de Grupos</div>
          <div className="text-2xl font-bold text-slate-900">{ind.totalGroups || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-slate-500">Membros Ativos</div>
          <div className="text-2xl font-bold text-emerald-600">{ind.activeMembers || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-slate-500">Total de Sorteios</div>
          <div className="text-2xl font-bold text-slate-900">{ind.totalRaffles || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-slate-500">Sorteios em Andamento</div>
          <div className="text-2xl font-bold text-indigo-600">{ind.activeRaffles || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-slate-500">Sorteios Encerrados</div>
          <div className="text-2xl font-bold text-slate-900">{ind.finishedRaffles || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-slate-500">Total de Participações</div>
          <div className="text-2xl font-bold text-violet-600">{ind.totalParticipations || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-slate-500">Total de Ganhadores</div>
          <div className="text-2xl font-bold text-amber-600">{ind.totalWinners || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-slate-500">Total de Notificações</div>
          <div className="text-2xl font-bold text-slate-900">{ind.totalNotifications || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-slate-500">Falhas de Envio</div>
          <div className="text-2xl font-bold text-rose-600">{ind.failedNotifications || 0}</div>
        </div>
      </div>

      {/* Relatórios e Auditoria */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Relatórios Oficiais e Auditoria</span>
            </h2>
            <p className="text-xs text-slate-500">
              Dados consolidados para conformidade com a LGPD e fiscalização regulatória
            </p>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto">
            {[
              { id: 'groups', label: 'Por Grupo' },
              { id: 'raffles', label: 'Por Sorteio' },
              { id: 'winners', label: 'Ganhadores' },
              { id: 'invites', label: 'Convites' },
              { id: 'audit', label: 'Trilha de Auditoria' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeReportTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeReportTab === 'groups' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Grupo</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Membros</th>
                    <th className="pb-3">Sorteios</th>
                    <th className="pb-3">Convites Emitidos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports?.participantsByGroup?.map((g: any) => (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-800">{g.name}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {g.status}
                        </span>
                      </td>
                      <td className="py-3">{g._count?.members || 0}</td>
                      <td className="py-3">{g._count?.raffles || 0}</td>
                      <td className="py-3">{g._count?.invitations || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReportTab === 'raffles' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Sorteio</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Data Prevista</th>
                    <th className="pb-3">Inscritos</th>
                    <th className="pb-3">Ganhadores</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports?.participantsByRaffle?.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-800">{r.title}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3">{new Date(r.drawDateTime).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3">{r._count?.participants || 0}</td>
                      <td className="py-3">{r._count?.winners || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReportTab === 'winners' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Sorteio</th>
                    <th className="pb-3">Prêmio</th>
                    <th className="pb-3">Ganhador</th>
                    <th className="pb-3">CPF Mascarado (LGPD)</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports?.winnersReport?.map((w: any) => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-800">{w.raffle?.title}</td>
                      <td className="py-3 text-indigo-700 font-medium">{w.raffle?.prize}</td>
                      <td className="py-3">{w.user?.name}</td>
                      <td className="py-3 font-mono text-slate-500">{w.user?.cpfMasked}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReportTab === 'invites' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Grupo</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Usos / Limite</th>
                    <th className="pb-3">Expira em</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports?.invitations?.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-800">{inv.group?.name}</td>
                      <td className="py-3">{inv.type}</td>
                      <td className="py-3">
                        {inv.currentUses} / {inv.maxUses || 'Ilimitado'}
                      </td>
                      <td className="py-3">
                        {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString('pt-BR') : 'Sem expiração'}
                      </td>
                      <td className="py-3">
                        {inv.isRevoked ? (
                          <span className="text-rose-600 font-semibold">Revogado</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Ativo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReportTab === 'audit' && (
            <div className="space-y-3">
              {reports?.recentAudit?.map((log: any) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-800 flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                        {log.action}
                      </span>
                      <span>{log.entity} #{log.entityId}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {log.details || 'Sem detalhes adicionais'}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar Sorteio */}
      {showRaffleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b">
              <h2 className="text-lg font-bold text-slate-900">Criar Novo Sorteio</h2>
              <button onClick={() => setShowRaffleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRaffleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Grupo Vinculado *</label>
                <select
                  required
                  value={raffleForm.groupId}
                  onChange={(e) => setRaffleForm({ ...raffleForm, groupId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Título do Sorteio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sorteio de Páscoa 2026"
                    value={raffleForm.title}
                    onChange={(e) => setRaffleForm({ ...raffleForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Prêmio a ser Conquistado *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: iPhone 16 Pro 256GB"
                    value={raffleForm.prize}
                    onChange={(e) => setRaffleForm({ ...raffleForm, prize: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Descrição Detalhada *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Descreva a finalidade e detalhes do prêmio..."
                  value={raffleForm.description}
                  onChange={(e) => setRaffleForm({ ...raffleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Qtd. Ganhadores</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={raffleForm.numberOfWinners}
                    onChange={(e) => setRaffleForm({ ...raffleForm, numberOfWinners: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Inscrições até</label>
                  <input
                    type="datetime-local"
                    value={raffleForm.participationEndDate}
                    onChange={(e) => setRaffleForm({ ...raffleForm, participationEndDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Data/Hora Sorteio</label>
                  <input
                    type="datetime-local"
                    value={raffleForm.drawDateTime}
                    onChange={(e) => setRaffleForm({ ...raffleForm, drawDateTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Regulamento e Elegibilidade</label>
                <textarea
                  rows={2}
                  placeholder="Descreva os requisitos para entrega e condições legais..."
                  value={raffleForm.rules}
                  onChange={(e) => setRaffleForm({ ...raffleForm, rules: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Instruções Exclusivas para Ganhadores</label>
                <textarea
                  rows={2}
                  placeholder="Instruções privadas visíveis apenas para quem for sorteado (ex: chave de envio, local de retirada)..."
                  value={raffleForm.winnerInstructions}
                  onChange={(e) => setRaffleForm({ ...raffleForm, winnerInstructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowRaffleModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createRaffleLoading}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createRaffleLoading ? 'Salvando...' : 'Salvar Sorteio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
