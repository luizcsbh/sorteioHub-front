import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Gift,
  Users,
  Trophy,
  Bell,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Plus,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>('todos');
  const [raffles, setRaffles] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [rafflesRes, groupsRes, notifRes] = await Promise.all([
          api.get(`/raffles?filter=${filter}`),
          api.get('/groups'),
          api.get('/notifications'),
        ]);
        setRaffles(rafflesRes.data);
        setGroups(groupsRes.data);
        setNotifications(notifRes.data.slice(0, 5));
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filter]);

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'READ' } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Aberto</span>;
      case 'DRAWN':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Sorteado</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">Cancelado</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">Rascunho</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-sm mb-3">
            SorteioHub • Grupos Fechados & Sorteios Auditáveis
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.name}!</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Seja bem-vindo ao seu painel exclusivo de sorteios e grupos fechados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(user?.role === 'ADMINISTRATOR' || user?.role === 'SUPER_ADMIN') && (
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2.5 bg-white text-indigo-700 font-semibold rounded-xl text-sm shadow hover:bg-indigo-50 transition"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Criar Novo Sorteio
            </Link>
          )}

          <Link
            to="/groups"
            className="inline-flex items-center px-4 py-2.5 bg-indigo-800/60 hover:bg-indigo-800 text-white font-medium rounded-xl text-sm backdrop-blur-sm border border-indigo-400/30 transition"
          >
            <Users className="w-4 h-4 mr-1.5" />
            Meus Grupos
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{groups.length}</div>
            <div className="text-xs font-medium text-slate-500">Grupos Vinculados</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{raffles.length}</div>
            <div className="text-xs font-medium text-slate-500">Sorteios Disponíveis</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {raffles.filter((r) => r.winners?.some((w: any) => w.user?.id === user?.id)).length}
            </div>
            <div className="text-xs font-medium text-slate-500">Prêmios Conquistados</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-700">CPF Validado</div>
            <div className="text-xs text-slate-500">{user?.cpfMasked || 'Protegido LGPD'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section: Sorteios com Filtros */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sorteios</h2>
              <p className="text-xs text-slate-500">Sorteios autorizados dos seus grupos fechados</p>
            </div>

            {/* Filtros conforme especificado no prompt */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 sm:pb-0">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'em_andamento', label: 'Em Andamento' },
                { id: 'encerrados', label: 'Encerrados' },
                { id: 'sorteados', label: 'Sorteados' },
                { id: 'ganhadores', label: 'Minhas Premiações' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    filter === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400">Carregando sorteios...</div>
          ) : raffles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <Gift className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-semibold text-slate-800">Nenhum sorteio encontrado</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Não há sorteios disponíveis para este filtro no momento. Fique atento às notificações do seu grupo!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {raffles.map((raffle) => {
                const hasParticipated = raffle.participants?.length > 0;
                return (
                  <div
                    key={raffle.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-indigo-200 transition space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(raffle.status)}
                          <span className="text-xs font-medium text-slate-400">
                            Grupo: {raffle.group?.name}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{raffle.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2">{raffle.description}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-semibold uppercase text-indigo-600 tracking-wider">
                          Prêmio
                        </div>
                        <div className="text-base font-bold text-slate-900">{raffle.prize}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Sorteio em: {new Date(raffle.drawDateTime).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(raffle.drawDateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div>
                          <strong>{raffle._count?.participants || 0}</strong> inscritos
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {hasParticipated && (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Inscrito</span>
                          </span>
                        )}

                        {raffle.status === 'DRAWN' ? (
                          <Link
                            to={`/raffles/${raffle.id}/results`}
                            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                          >
                            <span>Ver Resultado</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        ) : (
                          <Link
                            to={`/raffles/${raffle.id}`}
                            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                          >
                            <span>Detalhes & Participar</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: Notificações & Grupos */}
        <div className="space-y-6">
          {/* Central de Notificações */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <span>Notificações</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Recentes</span>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhuma notificação recente.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl border text-xs transition ${
                      notif.status === 'READ'
                        ? 'bg-slate-50/50 border-slate-100 text-slate-500'
                        : 'bg-indigo-50/40 border-indigo-100 text-slate-800 font-medium'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-slate-900">{notif.title}</span>
                      {notif.status !== 'READ' && (
                        <button
                          onClick={() => markNotificationAsRead(notif.id)}
                          className="text-[10px] text-indigo-600 hover:underline"
                        >
                          Lida
                        </button>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{notif.message}</p>
                    {notif.actionUrl && (
                      <Link
                        to={notif.actionUrl}
                        className="inline-flex items-center space-x-1 text-[11px] text-indigo-600 font-semibold mt-2 hover:underline"
                      >
                        <span>Acessar</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Atalho Meus Grupos */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Meus Grupos</span>
              </h3>
              <Link to="/groups" className="text-xs font-semibold text-indigo-600 hover:underline">
                Ver todos
              </Link>
            </div>

            {groups.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Você ainda não participa de grupos.</p>
            ) : (
              <div className="space-y-2">
                {groups.slice(0, 4).map((group) => (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{group.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {group._count?.members || 1} membros • {group._count?.raffles || 0} sorteios
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
