import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Alert } from '../../components/Alert';
import { api } from '../../services/api';
import {
  Send,
  Upload,
  Plus,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  X,
  ShieldAlert,
} from 'lucide-react';

export const CampaignsPage: React.FC = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Criar Campanha
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campForm, setCampForm] = useState({
    groupId: '',
    title: '',
    subject: '',
    body: '',
  });

  // Modal Importar Contatos
  const [showImportModal, setShowImportModal] = useState(false);
  const [rawContactsText, setRawContactsText] = useState('');
  const [importResult, setImportResult] = useState<any>(null);

  // Confirmação de Disparo
  const [campaignToSend, setCampaignToSend] = useState<string | null>(null);

  // Relatório Modal
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campRes, grpRes] = await Promise.all([
        api.get('/admin/campaigns'),
        api.get('/groups'),
      ]);
      setCampaigns(campRes.data);
      setGroups(grpRes.data);
      if (grpRes.data.length > 0 && !campForm.groupId) {
        setCampForm((prev) => ({ ...prev, groupId: grpRes.data[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/campaigns', campForm);
      setShowCreateModal(false);
      setCampForm({ groupId: groups[0]?.id || '', title: '', subject: '', body: '' });
      toast.success('Campanha de e-mail criada com sucesso!', 'Campanha Salva');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao criar campanha.', 'Falha ao Criar');
    }
  };

  const handleImportContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = rawContactsText.split('\n').filter((l) => l.trim().length > 0);
    const contacts: Array<{ email: string; name?: string }> = [];

    for (const line of lines) {
      const parts = line.split(/[;,]/);
      const email = parts[0]?.trim();
      const name = parts[1]?.trim();
      if (email && email.includes('@')) {
        contacts.push({ email, name });
      }
    }

    if (contacts.length === 0) {
      toast.warning('Nenhum e-mail válido foi reconhecido na lista informada.', 'Formato Inválido');
      return;
    }

    try {
      const res = await api.post('/admin/campaigns/import', { contacts });
      setImportResult(res.data);
      setRawContactsText('');
      toast.success(`${res.data.imported} contatos importados com sucesso!`, 'Importação Concluída');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao importar contatos.', 'Falha na Importação');
    }
  };

  const executeSendCampaign = async () => {
    if (!campaignToSend) return;
    try {
      const res = await api.post(`/admin/campaigns/${campaignToSend}/send`);
      toast.success(res.data.message, 'Disparo Concluído');
      setCampaignToSend(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao enviar campanha.', 'Falha no Disparo');
    }
  };

  const handleViewReport = async (id: string) => {
    try {
      const res = await api.get(`/admin/campaigns/${id}/report`);
      setSelectedReport(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao carregar relatório.', 'Falha no Relatório');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Send className="w-7 h-7 text-yellow-400" />
            <span>Campanhas de E-mail & Convites</span>
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Envio em lotes, importação de contatos (CSV/XLSX) e conformidade com a LGPD
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setShowImportModal(true);
              setImportResult(null);
            }}
            className="inline-flex items-center px-4 py-2 border border-white/20 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur transition shadow-sm"
          >
            <Upload className="w-4 h-4 mr-1.5 text-yellow-400" />
            Importar Contatos
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-yellow-400/20 transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nova Campanha
          </button>
        </div>
      </div>

      {/* Regra de Ouro LGPD */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start space-x-3 text-xs text-white/80">
        <ShieldAlert className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white">Regras de Proteção de Dados (LGPD):</span>
          <p className="text-white/70 leading-relaxed">
            A importação de listas de e-mails destina-se estritamente ao envio de convites legítimos. A importação
            <strong className="text-white"> não cadastra usuários automaticamente</strong> nem <strong className="text-white">registra participação prévia</strong>.
            Cada participante deve aceitar os termos e autenticar-se com sua própria conta Google.
          </p>
        </div>
      </div>

      {/* Lista de Campanhas */}
      {loading ? (
        <div className="py-20 text-center text-white/40">Carregando campanhas...</div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-12 text-center text-white/60 text-xs">
          Nenhuma campanha criada ainda. Crie uma nova campanha ou importe contatos para começar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6 shadow-xl hover:border-yellow-400/40 hover:bg-white/15 transition flex flex-col justify-between space-y-4 text-white"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      camp.status === 'SENT'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : camp.status === 'PROCESSING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/10 text-white/70 border border-white/15'
                    }`}
                  >
                    {camp.status}
                  </span>
                  <span className="text-[11px] text-white/50">Grupo: {camp.group?.name}</span>
                </div>

                <h3 className="text-base font-bold text-white">{camp.title}</h3>
                <div className="text-xs text-white/60">
                  Assunto: <span className="font-medium text-white/90">{camp.subject}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-white/50">
                  {camp.sentAt ? `Enviado em: ${new Date(camp.sentAt).toLocaleDateString('pt-BR')}` : 'Rascunho'}
                </span>

                <div className="flex items-center space-x-2">
                  {camp.status !== 'SENT' && (
                    <button
                      onClick={() => setCampaignToSend(camp.id)}
                      className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-yellow-400/20 flex items-center space-x-1 transition"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Disparar</span>
                    </button>
                  )}

                  {camp.status === 'SENT' && (
                    <button
                      onClick={() => handleViewReport(camp.id)}
                      className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition"
                    >
                      Relatório
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar Campanha */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/15 space-y-4 text-white">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Nova Campanha de E-mail</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-white/80 mb-1">Grupo Alvo *</label>
                <select
                  required
                  value={campForm.groupId}
                  onChange={(e) => setCampForm({ ...campForm, groupId: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-xl bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-white/80 mb-1">Título Interno *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Convite Geral - Sorteio de Páscoa"
                  value={campForm.title}
                  onChange={(e) => setCampForm({ ...campForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block font-medium text-white/80 mb-1">Assunto do E-mail *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Você foi convidado para concorrer ao nosso prêmio exclusivo!"
                  value={campForm.subject}
                  onChange={(e) => setCampForm({ ...campForm, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block font-medium text-white/80 mb-1">Mensagem do E-mail *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Olá! Estamos realizando um sorteio privado em nosso grupo fechado..."
                  value={campForm.body}
                  onChange={(e) => setCampForm({ ...campForm, body: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-white/20 rounded-xl font-medium text-white hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl shadow-lg shadow-yellow-400/20 transition"
                >
                  Salvar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Importar Contatos */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/15 space-y-4 text-white">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-yellow-400" />
                <span>Importar Lista de Contatos (CSV / Texto)</span>
              </h2>
              <button onClick={() => setShowImportModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {importResult && (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs space-y-1 text-emerald-300">
                <div className="font-bold flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{importResult.message}</span>
                </div>
                <div>Importados: <strong>{importResult.imported}</strong></div>
                <div>Duplicados descartados: <strong>{importResult.duplicates}</strong></div>
                <div className="text-[11px] text-emerald-400/80 pt-1">{importResult.notice}</div>
              </div>
            )}

            <form onSubmit={handleImportContacts} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-white/80 mb-1">
                  Cole os contatos no formato: <code className="text-yellow-400">email, nome</code> (um por linha):
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={`contato1@exemplo.com.br, Carlos Silva\ncontato2@exemplo.com.br, Maria Santos\ncontato3@exemplo.com.br, João Pereira`}
                  value={rawContactsText}
                  onChange={(e) => setRawContactsText(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border border-white/20 rounded-xl font-medium text-white hover:bg-white/10 transition"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl shadow-lg shadow-yellow-400/20 transition"
                >
                  Processar e Importar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Relatório de Campanha */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-white/15 space-y-4 max-h-[85vh] overflow-y-auto text-white">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">Relatório da Campanha</h2>
                <p className="text-xs text-white/60">{selectedReport.campaign?.title}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-white/50 text-[10px]">Total Destinatários</div>
                <div className="text-lg font-bold text-white">{selectedReport.metrics?.totalRecipients}</div>
              </div>
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                <div className="text-emerald-400 text-[10px]">Entregues</div>
                <div className="text-lg font-bold text-emerald-300">{selectedReport.metrics?.sent}</div>
              </div>
              <div className="p-3 bg-yellow-400/20 border border-yellow-400/30 rounded-xl">
                <div className="text-yellow-400 text-[10px]">Taxa de Entrega</div>
                <div className="text-lg font-bold text-yellow-300">{selectedReport.metrics?.deliveryRate}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-white/80">Amostra de Destinatários:</div>
              <div className="max-h-48 overflow-y-auto divide-y divide-white/10 text-xs border border-white/10 rounded-xl">
                {selectedReport.sampleRecipients?.map((r: any, idx: number) => (
                  <div key={idx} className="p-2.5 flex justify-between items-center hover:bg-white/5">
                    <div>
                      <span className="font-medium text-white">{r.email}</span>
                      {r.name && <span className="text-white/40 ml-2">({r.name})</span>}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition"
              >
                Fechar Relatório
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Modal - Disparar Campanha */}
      <ConfirmModal
        isOpen={!!campaignToSend}
        title="Disparar Campanha"
        message="Tem certeza que deseja disparar esta campanha agora? Os e-mails serão enviados imediatamente para todos os destinatários do grupo."
        confirmText="Sim, Disparar Agora"
        variant="warning"
        onConfirm={executeSendCampaign}
        onCancel={() => setCampaignToSend(null)}
      />
    </div>
  );
};
