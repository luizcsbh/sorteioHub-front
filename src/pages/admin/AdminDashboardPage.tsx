import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Pagination } from '../../components/Pagination';
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
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  Filter,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [reports, setReports] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReportTab, setActiveReportTab] = useState<'users' | 'groups' | 'raffles' | 'winners' | 'invites' | 'audit'>('users');

  // Gestão de Usuários & Paginação
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotalItems, setUserTotalItems] = useState(0);

  // Trilha de Auditoria & Paginação
  const [auditList, setAuditList] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditTotalItems, setAuditTotalItems] = useState(0);

  // Paginação dos Relatórios em Abas
  const [groupsPage, setGroupsPage] = useState(1);
  const [groupsPageSize, setGroupsPageSize] = useState(10);

  const [rafflesPage, setRafflesPage] = useState(1);
  const [rafflesPageSize, setRafflesPageSize] = useState(10);

  const [winnersPage, setWinnersPage] = useState(1);
  const [winnersPageSize, setWinnersPageSize] = useState(10);

  const [invitesPage, setInvitesPage] = useState(1);
  const [invitesPageSize, setInvitesPageSize] = useState(10);

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

  const fetchUsers = async (page = userPage, limit = userPageSize) => {
    setUsersLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          search: userSearchQuery || undefined,
          role: userRoleFilter || undefined,
          page,
          limit,
        },
      });
      if (res.data?.users && res.data?.pagination) {
        setUsersList(res.data.users);
        setUserTotalPages(res.data.pagination.totalPages);
        setUserTotalItems(res.data.pagination.total);
        setUserPage(res.data.pagination.page);
      } else if (Array.isArray(res.data)) {
        setUsersList(res.data);
        setUserTotalItems(res.data.length);
        setUserTotalPages(Math.ceil(res.data.length / limit) || 1);
        setUserPage(page);
      }
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      toast.error(err.response?.data?.error || 'Erro ao carregar lista de usuários.', 'Erro');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAuditLogs = async (page = auditPage, limit = auditPageSize) => {
    setAuditLoading(true);
    try {
      const res = await api.get('/admin/audit-logs', {
        params: {
          search: auditSearchQuery || undefined,
          action: auditActionFilter !== 'ALL' ? auditActionFilter : undefined,
          page,
          limit,
        },
      });
      if (res.data?.logs && res.data?.pagination) {
        setAuditList(res.data.logs);
        setAuditTotalPages(res.data.pagination.totalPages);
        setAuditTotalItems(res.data.pagination.total);
        setAuditPage(res.data.pagination.page);
      }
    } catch (err: any) {
      console.error('Erro ao carregar trilha de auditoria:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: string, userName: string) => {
    setUpdatingUserId(targetUserId);
    try {
      await api.patch(`/admin/users/${targetUserId}/role`, { role: newRole });
      const roleLabel =
        newRole === 'SUPER_ADMIN'
          ? 'Super Administrador'
          : newRole === 'ADMINISTRATOR'
          ? 'Administrador'
          : 'Participante';
      toast.success(`Papel de ${userName} alterado para ${roleLabel}!`, 'Papel Atualizado');
      fetchUsers(userPage, userPageSize);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Não foi possível alterar o papel do usuário.', 'Erro');
    } finally {
      setUpdatingUserId(null);
    }
  };

  useEffect(() => {
    loadAdminData();
    fetchUsers(1, userPageSize);
    fetchAuditLogs(1, auditPageSize);
  }, []);

  useEffect(() => {
    if (activeReportTab === 'users') {
      setUserPage(1);
      fetchUsers(1, userPageSize);
    } else if (activeReportTab === 'audit') {
      setAuditPage(1);
      fetchAuditLogs(1, auditPageSize);
    }
  }, [userRoleFilter, activeReportTab]);

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
    return <div className="py-20 text-center text-white/40">Carregando painel administrativo...</div>;
  }

  const ind = dashboard?.indicators || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Shield className="w-7 h-7 text-yellow-400" />
            <span>Painel Administrativo & Governança</span>
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Indicadores gerenciais, auditoria e relatórios de sorteios e grupos fechados
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/campaigns"
            className="inline-flex items-center px-4 py-2 border border-white/20 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur transition shadow-sm"
          >
            <Send className="w-4 h-4 mr-1.5 text-yellow-400" />
            Campanhas & E-mails
          </Link>

          <button
            onClick={() => setShowRaffleModal(true)}
            className="inline-flex items-center px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-yellow-400/20 transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo Sorteio
          </button>
        </div>
      </div>

      {/* 10 Indicadores Conforme prompt.json */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-xl space-y-1">
          <div className="text-[11px] font-medium text-white/60">Total de Usuários</div>
          <div className="text-2xl font-bold text-white">{ind.totalUsers || 0}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-xl space-y-1">
          <div className="text-[11px] font-medium text-white/60">Total de Grupos</div>
          <div className="text-2xl font-bold text-white">{ind.totalGroups || 0}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-xl space-y-1">
          <div className="text-[11px] font-medium text-white/60">Membros Ativos</div>
          <div className="text-2xl font-bold text-emerald-400">{ind.activeMembers || 0}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-xl space-y-1">
          <div className="text-[11px] font-medium text-white/60">Total de Sorteios</div>
          <div className="text-2xl font-bold text-yellow-400">{ind.totalRaffles || 0}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-xl space-y-1">
          <div className="text-[11px] font-medium text-white/60">Sorteios em Andamento</div>
          <div className="text-2xl font-bold text-indigo-400">{ind.activeRaffles || 0}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-xl space-y-1">
          <div className="text-[11px] font-medium text-white/60">Sorteios Encerrados</div>
          <div className="text-2xl font-bold text-white/80">{ind.finishedRaffles || 0}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-xl space-y-1">
          <div className="text-[11px] font-medium text-white/60">Total de Participações</div>
          <div className="text-2xl font-bold text-violet-400">{ind.totalParticipations || 0}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-xl space-y-1">
          <div className="text-[11px] font-medium text-white/60">Total de Ganhadores</div>
          <div className="text-2xl font-bold text-amber-400">{ind.totalWinners || 0}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-xl space-y-1">
          <div className="text-[11px] font-medium text-white/60">Total de Notificações</div>
          <div className="text-2xl font-bold text-white">{ind.totalNotifications || 0}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-xl space-y-1">
          <div className="text-[11px] font-medium text-white/60">Falhas de Envio</div>
          <div className="text-2xl font-bold text-rose-400">{ind.failedNotifications || 0}</div>
        </div>
      </div>

      {/* Relatórios e Auditoria */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 shadow-xl overflow-hidden text-white">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-yellow-400" />
              <span>Relatórios Oficiais e Auditoria</span>
            </h2>
            <p className="text-xs text-white/60">
              Dados consolidados para conformidade com a LGPD e fiscalização regulatória
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {[
              { id: 'users', label: 'Gestão de Usuários' },
              { id: 'groups', label: 'Por Grupo' },
              { id: 'raffles', label: 'Por Sorteio' },
              { id: 'winners', label: 'Ganhadores' },
              { id: 'invites', label: 'Convites' },
              { id: 'audit', label: 'Trilha de Auditoria' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeReportTab === tab.id
                    ? 'bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeReportTab === 'users' && (
            <div className="space-y-4">
              {/* Barra de Filtro e Busca */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-2 border-b border-white/10">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1, userPageSize)}
                    placeholder="Buscar por nome, e-mail ou telefone... (Pressione Enter)"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/10 text-white placeholder-white/40"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="text-xs px-3 py-2 rounded-xl border border-white/20 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="" className="bg-slate-900 text-white">Todos os Papéis</option>
                    <option value="PARTICIPANT" className="bg-slate-900 text-white">Apenas Participantes</option>
                    <option value="ADMINISTRATOR" className="bg-slate-900 text-white">Apenas Administradores</option>
                    <option value="SUPER_ADMIN" className="bg-slate-900 text-white">Apenas Super Admins</option>
                  </select>

                  <button
                    onClick={() => fetchUsers(1, userPageSize)}
                    disabled={usersLoading}
                    className="p-2 rounded-xl border border-white/20 hover:bg-white/20 text-white transition disabled:opacity-50"
                    title="Recarregar Usuários"
                  >
                    <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Tabela de Usuários */}
              {usersLoading ? (
                <div className="py-12 text-center text-white/40 text-xs">
                  Carregando lista de usuários...
                </div>
              ) : usersList.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-xs">
                  Nenhum usuário encontrado com os filtros aplicados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 uppercase text-[10px]">
                        <th className="pb-3">Usuário</th>
                        <th className="pb-3">Papel Atual</th>
                        <th className="pb-3">Contato</th>
                        <th className="pb-3">CPF (LGPD)</th>
                        <th className="pb-3">Participações</th>
                        <th className="pb-3 text-right">Ação de Permissão</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {usersList.map((u: any) => {
                        const isSelf = currentUser?.id === u.id;
                        return (
                          <tr key={u.id} className="hover:bg-white/5 transition">
                            <td className="py-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm">
                                  {u.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <div className="font-semibold text-white flex items-center space-x-1.5">
                                    <span>{u.name}</span>
                                    {isSelf && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                                        Você
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-white/40">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3">
                              {u.role === 'SUPER_ADMIN' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  <Shield className="w-3 h-3 mr-1 text-purple-400" />
                                  Super Admin
                                </span>
                              ) : u.role === 'ADMINISTRATOR' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                                  <Shield className="w-3 h-3 mr-1 text-yellow-400" />
                                  Administrador
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/70 border border-white/15">
                                  <Users className="w-3 h-3 mr-1 text-white/50" />
                                  Participante
                                </span>
                              )}
                            </td>

                            <td className="py-3 text-white/70">
                              {u.phone || <span className="text-white/30">Não informado</span>}
                            </td>

                            <td className="py-3 font-mono text-white/60">
                              {u.cpfMasked || <span className="text-white/30">Não informado</span>}
                            </td>

                            <td className="py-3 text-white/70">
                              <span className="text-white font-semibold">{u._count?.tickets || 0}</span> bilhetes
                              {' · '}
                              <span className="text-white font-semibold">{u._count?.groupMemberships || 0}</span> grupos
                            </td>

                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                {u.role === 'PARTICIPANT' && (
                                  <>
                                    <button
                                      disabled={updatingUserId === u.id}
                                      onClick={() => handleRoleChange(u.id, 'ADMINISTRATOR', u.name)}
                                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 transition border border-yellow-400/30 flex items-center space-x-1 disabled:opacity-50"
                                      title="Promover usuário a Administrador"
                                    >
                                      <UserCheck className="w-3 h-3 mr-1" />
                                      Tornar Admin
                                    </button>
                                    <button
                                      disabled={updatingUserId === u.id}
                                      onClick={() => handleRoleChange(u.id, 'SUPER_ADMIN', u.name)}
                                      className="px-2 py-1 rounded-lg text-[11px] font-bold bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition border border-purple-500/30 disabled:opacity-50"
                                      title="Promover a Super Admin"
                                    >
                                      Super Admin
                                    </button>
                                  </>
                                )}

                                {u.role === 'ADMINISTRATOR' && (
                                  <>
                                    <button
                                      disabled={updatingUserId === u.id}
                                      onClick={() => handleRoleChange(u.id, 'SUPER_ADMIN', u.name)}
                                      className="px-2 py-1 rounded-lg text-[11px] font-bold bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition border border-purple-500/30 disabled:opacity-50"
                                      title="Promover a Super Admin"
                                    >
                                      Super Admin
                                    </button>
                                    <button
                                      disabled={updatingUserId === u.id}
                                      onClick={() => handleRoleChange(u.id, 'PARTICIPANT', u.name)}
                                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 text-white/70 hover:bg-white/20 transition border border-white/20 flex items-center space-x-1 disabled:opacity-50"
                                      title="Rebaixar para Participante comum"
                                    >
                                      <UserX className="w-3 h-3 mr-1" />
                                      Tornar Participante
                                    </button>
                                  </>
                                )}

                                {u.role === 'SUPER_ADMIN' && (
                                  <>
                                    <button
                                      disabled={updatingUserId === u.id}
                                      onClick={() => handleRoleChange(u.id, 'ADMINISTRATOR', u.name)}
                                      className="px-2 py-1 rounded-lg text-[11px] font-bold bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 transition border border-yellow-400/30 disabled:opacity-50"
                                      title="Mudar para Administrador comum"
                                    >
                                      Tornar Admin
                                    </button>
                                    <button
                                      disabled={updatingUserId === u.id}
                                      onClick={() => handleRoleChange(u.id, 'PARTICIPANT', u.name)}
                                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 text-white/70 hover:bg-white/20 transition border border-white/20 flex items-center space-x-1 disabled:opacity-50"
                                      title="Rebaixar para Participante"
                                    >
                                      <UserX className="w-3 h-3 mr-1" />
                                      Tornar Participante
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Paginação de Usuários */}
              <Pagination
                currentPage={userPage}
                totalPages={userTotalPages}
                totalItems={userTotalItems}
                pageSize={userPageSize}
                onPageChange={(newPage) => {
                  setUserPage(newPage);
                  fetchUsers(newPage, userPageSize);
                }}
                onPageSizeChange={(newSize) => {
                  setUserPageSize(newSize);
                  setUserPage(1);
                  fetchUsers(1, newSize);
                }}
                pageSizeOptions={[10, 25, 50]}
                itemName="usuários"
              />
            </div>
          )}

          {activeReportTab === 'groups' && (() => {
            const allGroups = reports?.participantsByGroup || [];
            const total = allGroups.length;
            const totalPages = Math.ceil(total / groupsPageSize) || 1;
            const paginated = allGroups.slice(
              (groupsPage - 1) * groupsPageSize,
              groupsPage * groupsPageSize
            );

            return (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 uppercase text-[10px]">
                        <th className="pb-3">Grupo</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Membros</th>
                        <th className="pb-3">Sorteios</th>
                        <th className="pb-3">Convites Emitidos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {paginated.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-white/40">
                            Nenhum grupo encontrado.
                          </td>
                        </tr>
                      ) : (
                        paginated.map((g: any) => (
                          <tr key={g.id} className="hover:bg-white/5 transition">
                            <td className="py-3 font-semibold text-white">{g.name}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/80 border border-white/15">
                                {g.status}
                              </span>
                            </td>
                            <td className="py-3 text-white/70">{g._count?.members || 0}</td>
                            <td className="py-3 text-white/70">{g._count?.raffles || 0}</td>
                            <td className="py-3 text-white/70">{g._count?.invitations || 0}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={groupsPage}
                  totalPages={totalPages}
                  totalItems={total}
                  pageSize={groupsPageSize}
                  onPageChange={(p) => setGroupsPage(p)}
                  onPageSizeChange={(size) => {
                    setGroupsPageSize(size);
                    setGroupsPage(1);
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  itemName="grupos"
                />
              </div>
            );
          })()}

          {activeReportTab === 'raffles' && (() => {
            const allRaffles = reports?.participantsByRaffle || [];
            const total = allRaffles.length;
            const totalPages = Math.ceil(total / rafflesPageSize) || 1;
            const paginated = allRaffles.slice(
              (rafflesPage - 1) * rafflesPageSize,
              rafflesPage * rafflesPageSize
            );

            return (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 uppercase text-[10px]">
                        <th className="pb-3">Sorteio</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Data Prevista</th>
                        <th className="pb-3">Inscritos</th>
                        <th className="pb-3">Ganhadores</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {paginated.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-white/40">
                            Nenhum sorteio encontrado.
                          </td>
                        </tr>
                      ) : (
                        paginated.map((r: any) => (
                          <tr key={r.id} className="hover:bg-white/5 transition">
                            <td className="py-3 font-semibold text-white">{r.title}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/80 border border-white/15">
                                {r.status}
                              </span>
                            </td>
                            <td className="py-3 text-white/70">{new Date(r.drawDateTime).toLocaleDateString('pt-BR')}</td>
                            <td className="py-3 text-white/70">{r._count?.participants || 0}</td>
                            <td className="py-3 text-white/70">{r._count?.winners || 0}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={rafflesPage}
                  totalPages={totalPages}
                  totalItems={total}
                  pageSize={rafflesPageSize}
                  onPageChange={(p) => setRafflesPage(p)}
                  onPageSizeChange={(size) => {
                    setRafflesPageSize(size);
                    setRafflesPage(1);
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  itemName="sorteios"
                />
              </div>
            );
          })()}

          {activeReportTab === 'winners' && (() => {
            const allWinners = reports?.winnersReport || [];
            const total = allWinners.length;
            const totalPages = Math.ceil(total / winnersPageSize) || 1;
            const paginated = allWinners.slice(
              (winnersPage - 1) * winnersPageSize,
              winnersPage * winnersPageSize
            );

            return (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 uppercase text-[10px]">
                        <th className="pb-3">Sorteio</th>
                        <th className="pb-3">Prêmio</th>
                        <th className="pb-3">Ganhador</th>
                        <th className="pb-3">CPF Mascarado (LGPD)</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {paginated.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-white/40">
                            Nenhum ganhador registrado até o momento.
                          </td>
                        </tr>
                      ) : (
                        paginated.map((w: any) => (
                          <tr key={w.id} className="hover:bg-white/5 transition">
                            <td className="py-3 font-semibold text-white">{w.raffle?.title}</td>
                            <td className="py-3 text-yellow-400 font-bold">{w.raffle?.prize}</td>
                            <td className="py-3 text-white">{w.user?.name}</td>
                            <td className="py-3 font-mono text-white/60">{w.user?.cpfMasked}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {w.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={winnersPage}
                  totalPages={totalPages}
                  totalItems={total}
                  pageSize={winnersPageSize}
                  onPageChange={(p) => setWinnersPage(p)}
                  onPageSizeChange={(size) => {
                    setWinnersPageSize(size);
                    setWinnersPage(1);
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  itemName="ganhadores"
                />
              </div>
            );
          })()}

          {activeReportTab === 'invites' && (() => {
            const allInvites = reports?.invitations || [];
            const total = allInvites.length;
            const totalPages = Math.ceil(total / invitesPageSize) || 1;
            const paginated = allInvites.slice(
              (invitesPage - 1) * invitesPageSize,
              invitesPage * invitesPageSize
            );

            return (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 uppercase text-[10px]">
                        <th className="pb-3">Grupo</th>
                        <th className="pb-3">Tipo</th>
                        <th className="pb-3">Usos / Limite</th>
                        <th className="pb-3">Expira em</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {paginated.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-white/40">
                            Nenhum convite emitido.
                          </td>
                        </tr>
                      ) : (
                        paginated.map((inv: any) => (
                          <tr key={inv.id} className="hover:bg-white/5 transition">
                            <td className="py-3 font-semibold text-white">{inv.group?.name}</td>
                            <td className="py-3 text-white/70">{inv.type}</td>
                            <td className="py-3 text-white/70">
                              {inv.currentUses} / {inv.maxUses || 'Ilimitado'}
                            </td>
                            <td className="py-3 text-white/70">
                              {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString('pt-BR') : 'Sem expiração'}
                            </td>
                            <td className="py-3">
                              {inv.isRevoked ? (
                                <span className="text-rose-400 font-bold">Revogado</span>
                              ) : (
                                <span className="text-emerald-400 font-bold">Ativo</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={invitesPage}
                  totalPages={totalPages}
                  totalItems={total}
                  pageSize={invitesPageSize}
                  onPageChange={(p) => setInvitesPage(p)}
                  onPageSizeChange={(size) => {
                    setInvitesPageSize(size);
                    setInvitesPage(1);
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  itemName="convites"
                />
              </div>
            );
          })()}

          {activeReportTab === 'audit' && (
            <div className="space-y-4">
              {/* Filtros da Trilha de Auditoria */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-2 border-b border-white/10">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchAuditLogs(1, auditPageSize)}
                    placeholder="Buscar ação, entidade ou detalhes... (Pressione Enter)"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/10 text-white placeholder-white/40"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={auditActionFilter}
                    onChange={(e) => {
                      setAuditActionFilter(e.target.value);
                      setAuditPage(1);
                    }}
                    className="text-xs px-3 py-2 rounded-xl border border-white/20 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="ALL" className="bg-slate-900 text-white">Todas as Ações</option>
                    <option value="USER_LOGIN" className="bg-slate-900 text-white">Login de Usuário</option>
                    <option value="CPF_VALIDATED" className="bg-slate-900 text-white">CPF Validado</option>
                    <option value="DRAW_EXECUTED" className="bg-slate-900 text-white">Sorteio Executado</option>
                    <option value="USER_ROLE_UPDATED" className="bg-slate-900 text-white">Papel Alterado</option>
                    <option value="RAFFLE_CREATED" className="bg-slate-900 text-white">Sorteio Criado</option>
                    <option value="RAFFLE_PUBLISHED" className="bg-slate-900 text-white">Sorteio Publicado</option>
                  </select>

                  <button
                    onClick={() => fetchAuditLogs(1, auditPageSize)}
                    disabled={auditLoading}
                    className="p-2 rounded-xl border border-white/20 hover:bg-white/20 text-white transition disabled:opacity-50"
                    title="Recarregar Auditoria"
                  >
                    <RefreshCw className={`w-4 h-4 ${auditLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Lista de Auditoria */}
              {auditLoading ? (
                <div className="py-12 text-center text-white/40 text-xs">
                  Carregando trilha de auditoria...
                </div>
              ) : (auditList.length > 0 ? auditList : (reports?.recentAudit || [])).length === 0 ? (
                <div className="py-12 text-center text-white/40 text-xs">
                  Nenhum registro de auditoria encontrado.
                </div>
              ) : (
                <div className="space-y-3">
                  {(auditList.length > 0 ? auditList : (reports?.recentAudit || [])).map((log: any) => (
                    <div
                      key={log.id}
                      className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-white flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 text-[10px] font-bold border border-yellow-400/30">
                            {log.action}
                          </span>
                          <span>
                            {log.entity} #{log.entityId || 'N/A'}
                          </span>
                          {log.user && (
                            <span className="text-[11px] text-white/50">
                              por <strong className="text-white/80">{log.user.name}</strong> ({log.user.email})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-white/60 font-mono break-all">
                          {typeof log.details === 'object'
                            ? JSON.stringify(log.details)
                            : log.details || 'Sem detalhes adicionais'}
                        </div>
                      </div>

                      <div className="text-[11px] text-white/40 shrink-0 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paginação de Auditoria */}
              <Pagination
                currentPage={auditPage}
                totalPages={auditTotalPages}
                totalItems={auditTotalItems}
                pageSize={auditPageSize}
                onPageChange={(newPage) => {
                  setAuditPage(newPage);
                  fetchAuditLogs(newPage, auditPageSize);
                }}
                onPageSizeChange={(newSize) => {
                  setAuditPageSize(newSize);
                  setAuditPage(1);
                  fetchAuditLogs(1, newSize);
                }}
                pageSizeOptions={[10, 25, 50]}
                itemName="registros de auditoria"
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar Sorteio */}
      {showRaffleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-white/15 space-y-4 max-h-[90vh] overflow-y-auto text-white">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Criar Novo Sorteio</h2>
              <button onClick={() => setShowRaffleModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRaffleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-white/80 mb-1">Grupo Vinculado *</label>
                <select
                  required
                  value={raffleForm.groupId}
                  onChange={(e) => setRaffleForm({ ...raffleForm, groupId: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-xl bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-white/80 mb-1">Título do Sorteio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sorteio de Páscoa 2026"
                    value={raffleForm.title}
                    onChange={(e) => setRaffleForm({ ...raffleForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block font-medium text-white/80 mb-1">Prêmio a ser Conquistado *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: iPhone 16 Pro 256GB"
                    value={raffleForm.prize}
                    onChange={(e) => setRaffleForm({ ...raffleForm, prize: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-white/80 mb-1">Descrição Detalhada *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Descreva a finalidade e detalhes do prêmio..."
                  value={raffleForm.description}
                  onChange={(e) => setRaffleForm({ ...raffleForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-white/80 mb-1">Qtd. Ganhadores</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={raffleForm.numberOfWinners}
                    onChange={(e) => setRaffleForm({ ...raffleForm, numberOfWinners: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block font-medium text-white/80 mb-1">Inscrições até</label>
                  <input
                    type="datetime-local"
                    value={raffleForm.participationEndDate}
                    onChange={(e) => setRaffleForm({ ...raffleForm, participationEndDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block font-medium text-white/80 mb-1">Data/Hora Sorteio</label>
                  <input
                    type="datetime-local"
                    value={raffleForm.drawDateTime}
                    onChange={(e) => setRaffleForm({ ...raffleForm, drawDateTime: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-white/80 mb-1">Regulamento e Elegibilidade</label>
                <textarea
                  rows={2}
                  placeholder="Descreva os requisitos para entrega e condições legais..."
                  value={raffleForm.rules}
                  onChange={(e) => setRaffleForm({ ...raffleForm, rules: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block font-medium text-white/80 mb-1">Instruções Exclusivas para Ganhadores</label>
                <textarea
                  rows={2}
                  placeholder="Instruções privadas visíveis apenas para quem for sorteado (ex: chave de envio, local de retirada)..."
                  value={raffleForm.winnerInstructions}
                  onChange={(e) => setRaffleForm({ ...raffleForm, winnerInstructions: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowRaffleModal(false)}
                  className="px-4 py-2 border border-white/20 rounded-xl font-medium text-white hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createRaffleLoading}
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl transition shadow-lg shadow-yellow-400/20 disabled:opacity-50"
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
