import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, MapPin, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';

export const CompleteProfilePage: React.FC = () => {
  const { user, completeProfile, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cpf: '',
    phone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'SP',
    acceptTerms: false,
    acceptPrivacyPolicy: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!needsProfileCompletion && user?.isCpfValidated) {
      navigate('/dashboard');
    }
  }, [needsProfileCompletion, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCepLookup = async () => {
    const cepClean = form.cep.replace(/\D/g, '');
    if (cepClean.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm((prev) => ({
            ...prev,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || 'SP',
          }));
        }
      } catch (err) {
        console.error('Falha ao consultar CEP:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.acceptTerms || !form.acceptPrivacyPolicy) {
      setError('É obrigatório aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeProfile({
        ...form,
        estado: form.estado.toUpperCase(),
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao concluir cadastro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900/80 via-indigo-950/80 to-purple-950/80 border-b border-white/10 px-8 py-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <UserCheck className="w-8 h-8 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Conclua seu Cadastro Único</h1>
          </div>
          <p className="text-white/70 text-sm">
            Para garantir a integridade dos sorteios e a entrega de prêmios, informe seu CPF e endereço.
            Você fará isso apenas uma vez e poderá participar de todos os seus grupos autorizados.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-white/10 pb-2">
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
              <span>Dados Pessoais & Validação de CPF</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Nome Completo</label>
                <input
                  type="text"
                  disabled
                  value={user?.name || ''}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">E-mail Google</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  CPF <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="cpf"
                  required
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm"
                />
                <p className="text-[11px] text-white/50 mt-1">
                  O CPF é criptografado e validado por algoritmo oficial.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Telefone com DDD <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="(11) 99999-9999"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-white/10 pb-2">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <span>Endereço</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  CEP <span className="text-rose-400">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="cep"
                    required
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={handleChange}
                    onBlur={handleCepLookup}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleCepLookup}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Buscar
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Logradouro <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="logradouro"
                  required
                  placeholder="Rua, Avenida, Praça..."
                  value={form.logradouro}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Número <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="numero"
                  required
                  placeholder="123"
                  value={form.numero}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  placeholder="Apto 42, Bloco B"
                  value={form.complemento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Bairro <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="bairro"
                  required
                  placeholder="Centro"
                  value={form.bairro}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Cidade <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="cidade"
                  required
                  placeholder="São Paulo"
                  value={form.cidade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Estado (UF) <span className="text-rose-400">*</span>
                </label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/20 rounded-xl text-sm bg-slate-900 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                >
                  {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                    <option key={uf} value={uf} className="bg-slate-900 text-white">{uf}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Consentimento LGPD */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400">
              Conformidade e Proteção de Dados (LGPD)
            </h3>

            <label className="flex items-start space-x-3 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={form.acceptTerms}
                onChange={handleChange}
                className="mt-0.5 rounded border-white/20 text-yellow-400 focus:ring-yellow-400 bg-white/10"
              />
              <span>
                Declaro que li e concordo com os <strong className="text-white">Termos de Uso</strong> da plataforma, reconhecendo que a participação em sorteios requer cumprimento das regras específicas de cada grupo.
              </span>
            </label>

            <label className="flex items-start space-x-3 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                name="acceptPrivacyPolicy"
                checked={form.acceptPrivacyPolicy}
                onChange={handleChange}
                className="mt-0.5 rounded border-white/20 text-yellow-400 focus:ring-yellow-400 bg-white/10"
              />
              <span>
                Concordo com a <strong className="text-white">Política de Privacidade</strong> e autorizo a coleta do meu CPF e endereço para finalidade estrita de validação de elegibilidade e entrega de prêmios.
              </span>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 text-sm font-black rounded-xl text-slate-950 bg-yellow-400 hover:bg-yellow-300 shadow-lg shadow-yellow-400/20 transition disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Salvando...' : 'Concluir Cadastro e Prosseguir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
