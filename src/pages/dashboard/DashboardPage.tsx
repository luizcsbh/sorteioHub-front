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
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Aberto
          </span>
        );
      case 'DRAWN':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Sorteado
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-white/10 text-white/70 border border-white/15">
            Rascunho
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white border border-white/15 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm mb-3">
            SorteioClub • Grupos Fechados & Sorteios Auditáveis
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Olá, {user?.name}!</h1>
          <p className="text-white/60 text-sm mt-1">
            Seja bem-vindo ao seu painel exclusivo de sorteios e grupos fechados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {(user?.role === 'ADMINISTRATOR' || user?.role === 'SUPER_ADMIN') && (
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-yellow-400/20 transition"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Criar Novo Sorteio
            </Link>
          )}

          <Link
            to="/groups"
            className="inline-flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm backdrop-blur-sm border border-white/20 transition"
          >
            <Users className="w-4 h-4 mr-1.5" />
            Meus Grupos
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/15 shadow-xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{groups.length}</div>
            <div className="text-xs font-semibold text-white/60">Grupos Vinculados</div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/15 shadow-xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{raffles.length}</div>
            <div className="text-xs font-semibold text-white/60">Sorteios Disponíveis</div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/15 shadow-xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {raffles.filter((r) => r.winners?.some((w: any) => w.user?.id === user?.id)).length}
            </div>
            <div className="text-xs font-semibold text-white/60">Prêmios Conquistados</div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/15 shadow-xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-400">CPF Validado</div>
            <div className="text-xs text-white/60">{user?.cpfMasked || 'Protegido LGPD'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section: Sorteios com Filtros */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">Sorteios</h2>
              <p className="text-xs text-white/60">Sorteios autorizados dos seus grupos fechados</p>
            </div>

            {/* Filtros sem scroll horizontal */}
            <div className="flex items-center flex-wrap gap-1.5">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    filter === tab.id
                      ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20'
                      : 'bg-white/10 border border-white/15 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-white/50 text-sm">Carregando sorteios...</div>
          ) : raffles.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-8 text-center space-y-3">
              <Gift className="w-10 h-10 text-white/30 mx-auto" />
              <h3 className="text-base font-bold text-white">Nenhum sorteio encontrado</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
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
                    className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6 hover:border-yellow-400/40 transition space-y-4 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(raffle.status)}
                          <span className="text-xs font-semibold text-white/50">
                            Grupo: {raffle.group?.name}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white">{raffle.title}</h3>
                        <p className="text-xs text-white/70 line-clamp-2">{raffle.description}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-[11px] font-black uppercase text-yellow-300 tracking-wider">
                          Prêmio
                        </div>
                        <div className="text-base font-black text-white">{raffle.prize}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/60">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-yellow-400" />
                          <span>
                            Sorteio em: {new Date(raffle.drawDateTime).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(raffle.drawDateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div>
                          <strong className="text-white">{raffle._count?.participants || 0}</strong> inscritos
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {hasParticipated && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Inscrito</span>
                          </span>
                        )}

                        {raffle.status === 'DRAWN' ? (
                          <Link
                            to={`/raffles/${raffle.id}/results`}
                            className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
                          >
                            <span>Ver Resultado</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        ) : (
                          <Link
                            to={`/raffles/${raffle.id}`}
                            className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-black bg-yellow-400 hover:bg-yellow-300 text-slate-950 transition shadow-md shadow-yellow-400/20"
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
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <Bell className="w-4 h-4 text-yellow-400" />
                <span>Notificações</span>
              </h3>
              <span className="text-xs text-white/50 font-semibold">Recentes</span>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-4">Nenhuma notificação recente.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl border text-xs transition ${
                      notif.status === 'READ'
                        ? 'bg-white/5 border-white/10 text-white/50'
                        : 'bg-purple-600/20 border-purple-500/30 text-white font-medium'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-white">{notif.title}</span>
                      {notif.status !== 'READ' && (
                        <button
                          onClick={() => markNotificationAsRead(notif.id)}
                          className="text-[10px] text-yellow-400 hover:underline"
                        >
                          Lida
                        </button>
                      )}
                    </div>
                    <p className="text-white/70 text-[11px] leading-relaxed">{notif.message}</p>
                    {notif.actionUrl && (
                      <Link
                        to={notif.actionUrl}
                        className="inline-flex items-center space-x-1 text-[11px] text-yellow-300 font-bold mt-2 hover:underline"
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
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Meus Grupos</span>
              </h3>
              <Link to="/groups" className="text-xs font-bold text-yellow-400 hover:underline">
                Ver todos
              </Link>
            </div>

            {groups.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-4">Você ainda não participa de grupos.</p>
            ) : (
              <div className="space-y-2">
                {groups.slice(0, 4).map((group) => (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition border border-transparent hover:border-white/15 text-xs text-white"
                  >
                    <div>
                      <div className="font-bold text-white">{group.name}</div>
                      <div className="text-[11px] text-white/50">
                        {group._count?.members || 1} membros • {group._count?.raffles || 0} sorteios
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/40" />
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
