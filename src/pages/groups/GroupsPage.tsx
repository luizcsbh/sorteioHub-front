import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Alert } from '../../components/Alert';
import { api } from '../../services/api';
import {
  Users,
  Plus,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';

export const GroupsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Criar Grupo
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [autoApprove, setAutoApprove] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Modal Entrar via Token
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{ text: string; success: boolean } | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post('/groups', {
        name: newGroupName,
        description: newGroupDesc,
        autoApprove,
      });
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
      setAutoApprove(false);
      toast.success('Grupo privado criado com sucesso!', 'Grupo Criado');
      fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao criar grupo.', 'Falha ao Criar');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinLoading(true);
    setJoinMessage(null);
    try {
      const res = await api.post(`/groups/join/${tokenInput.trim()}`);
      setJoinMessage({ text: res.data.message, success: true });
      toast.success(res.data.message, 'Convite Aceito');
      setTokenInput('');
      fetchGroups();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Código ou token de convite inválido.';
      setJoinMessage({ text: msg, success: false });
      toast.error(msg, 'Convite Inválido');
    } finally {
      setJoinLoading(false);
    }
  };

  const isManagerOrAdmin = user?.role === 'ADMINISTRATOR' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-7 h-7 text-indigo-600" />
            <span>Grupos Fechados</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comunidades fechadas exclusivas para realização e participação de sorteios
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
          >
            <KeyRound className="w-4 h-4 mr-1.5 text-indigo-600" />
            Entrar com Código / Token
          </button>

          {isManagerOrAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow transition"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Criar Novo Grupo
            </button>
          )}
        </div>
      </div>

      {/* Lista de Grupos */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Carregando grupos...</div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">Você ainda não participa de nenhum grupo</h3>
          <p className="text-xs text-slate-500">
            Peça o link de convite ao administrador do seu grupo fechado ou use um token de acesso para ingressar.
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow"
          >
            <KeyRound className="w-4 h-4 mr-1.5" />
            Inserir Token de Convite
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const isManager = group.managerId === user?.id || user?.role === 'SUPER_ADMIN';
            const membership = group.members?.[0];
            const isActive = isManager || membership?.status === 'ATIVO';

            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-indigo-200 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        group.status === 'ATIVO'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {group.status}
                    </span>

                    {isManager && (
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Você é o Gestor
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{group.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {group.description || 'Sem descrição cadastrada.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-3">
                    <div>
                      <strong>{group._count?.members || 1}</strong> membros
                    </div>
                    <div>
                      <strong>{group._count?.raffles || 0}</strong> sorteios
                    </div>
                  </div>

                  {isActive ? (
                    <Link
                      to={`/groups/${group.id}`}
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                    >
                      <span>Acessar</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  ) : (
                    <span className="text-amber-600 font-medium">Aprovação Pendente</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar Grupo */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Novo Grupo Fechado</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome do Grupo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Clientes VIP 2026, Colaboradores..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  placeholder="Explique o objetivo deste grupo e as regras..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Aprovação automática ao usar convite válido</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Se desativado, o participante entrará como pendente até você aprová-lo.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createLoading ? 'Criando...' : 'Salvar Grupo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Entrar via Token */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Ingressar com Convite</h2>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {joinMessage && (
              <Alert
                variant={joinMessage.success ? 'success' : 'error'}
                onClose={() => setJoinMessage(null)}
              >
                {joinMessage.text}
              </Alert>
            )}

            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Código ou Token do Convite
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cole o código do convite fornecido pelo gestor"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinMessage(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={joinLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {joinLoading ? 'Validando...' : 'Confirmar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
