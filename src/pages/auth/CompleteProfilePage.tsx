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
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-violet-700 px-8 py-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <UserCheck className="w-8 h-8 text-indigo-200" />
            <h1 className="text-2xl font-bold">Conclua seu Cadastro Único</h1>
          </div>
          <p className="text-indigo-100 text-sm">
            Para garantir a integridade dos sorteios e a entrega de prêmios, informe seu CPF e endereço.
            Você fará isso apenas uma vez e poderá participar de todos os seus grupos autorizados.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2 border-b pb-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Dados Pessoais & Validação de CPF</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  disabled
                  value={user?.name || ''}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">E-mail Google</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CPF <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="cpf"
                  required
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  O CPF é criptografado e validado por algoritmo oficial.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Telefone com DDD <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="(11) 99999-9999"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2 border-b pb-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span>Endereço de Entrega de Prêmios</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CEP <span className="text-rose-500">*</span>
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleCepLookup}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                  >
                    Buscar
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Logradouro <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="logradouro"
                  required
                  placeholder="Rua, Avenida, Praça..."
                  value={form.logradouro}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Número <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="numero"
                  required
                  placeholder="123"
                  value={form.numero}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  placeholder="Apto 42, Bloco B"
                  value={form.complemento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bairro <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="bairro"
                  required
                  placeholder="Centro"
                  value={form.bairro}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cidade <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="cidade"
                  required
                  placeholder="São Paulo"
                  value={form.cidade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Estado (UF) <span className="text-rose-500">*</span>
                </label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                >
                  {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Consentimento LGPD */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Conformidade e Proteção de Dados (LGPD)
            </h3>

            <label className="flex items-start space-x-3 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={form.acceptTerms}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                Declaro que li e concordo com os <strong>Termos de Uso</strong> da plataforma, reconhecendo que a participação em sorteios requer cumprimento das regras específicas de cada grupo.
              </span>
            </label>

            <label className="flex items-start space-x-3 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                name="acceptPrivacyPolicy"
                checked={form.acceptPrivacyPolicy}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                Concordo com a <strong>Política de Privacidade</strong> e autorizo a coleta do meu CPF e endereço para finalidade estrita de validação de elegibilidade e entrega de prêmios.
              </span>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition disabled:opacity-50"
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
