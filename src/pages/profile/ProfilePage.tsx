import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User as UserIcon,
  MapPin,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Save,
  KeyRound,
  Search,
} from 'lucide-react';

const passwordRules = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: '1 letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: '1 letra minúscula', test: (v: string) => /[a-z]/.test(v) },
  { label: '1 número', test: (v: string) => /\d/.test(v) },
  { label: '1 caractere especial', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Estado do formulário de perfil
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'SP',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Estado do formulário de senha
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        cep: user.address?.cep || '',
        logradouro: user.address?.logradouro || '',
        numero: user.address?.numero || '',
        complemento: user.address?.complemento || '',
        bairro: user.address?.bairro || '',
        cidade: user.address?.cidade || '',
        estado: user.address?.estado || 'SP',
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCepLookup = async () => {
    const cepClean = profileForm.cep.replace(/\D/g, '');
    if (cepClean.length !== 8) {
      toast.warning('Informe um CEP válido com 8 dígitos.');
      return;
    }

    setIsSearchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error('CEP não encontrado.');
      } else {
        setProfileForm((prev) => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));
        toast.success('Endereço localizado com sucesso!');
      }
    } catch {
      toast.error('Não foi possível consultar o CEP no momento.');
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.warning('O nome não pode ficar em branco.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim() || null,
        address: {
          cep: profileForm.cep.trim(),
          logradouro: profileForm.logradouro.trim(),
          numero: profileForm.numero.trim(),
          complemento: profileForm.complemento?.trim() || null,
          bairro: profileForm.bairro.trim(),
          cidade: profileForm.cidade.trim(),
          estado: profileForm.estado.trim().toUpperCase(),
        },
      });
      toast.success('Dados cadastrais atualizados com sucesso!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Erro ao atualizar dados.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user?.hasPassword && !passwordForm.currentPassword) {
      toast.warning('Informe sua senha atual.');
      return;
    }

    if (!passwordForm.newPassword) {
      toast.warning('Informe a nova senha.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('A confirmação da nova senha não confere.');
      return;
    }

    const failedRule = passwordRules.find((r) => !r.test(passwordForm.newPassword));
    if (failedRule) {
      toast.error(`Requisito não atendido: ${failedRule.label}`);
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword || undefined,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      toast.success(user?.hasPassword ? 'Senha alterada com sucesso!' : 'Senha criada com sucesso!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Erro ao atualizar senha.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header do Perfil */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white text-3xl font-bold flex items-center justify-center shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3">
            <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 self-center md:self-auto">
              {user?.role}
            </span>
          </div>
          <p className="text-sm text-slate-500">{user?.email}</p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-600">
            {user?.cpfMasked && (
              <span className="flex items-center space-x-1 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>CPF: {user.cpfMasked}</span>
              </span>
            )}
            <span className="flex items-center space-x-1 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <span>Conformidade LGPD Ativa</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Dados Pessoais & Endereço</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Segurança & Senha</span>
        </button>
      </div>

      {/* Conteúdo: Dados Pessoais & Endereço */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-indigo-600" />
              <span>Informações Pessoais</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mantenha seus dados de contato e entrega sempre atualizados para recebimento de prêmios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={profileForm.name}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail (Identificador da Conta)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                name="phone"
                placeholder="(00) 00000-0000"
                value={profileForm.phone}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CPF (Protegido por Criptografia LGPD)
              </label>
              <input
                type="text"
                disabled
                value={user?.cpfMasked || 'Não cadastrado'}
                className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Seção Endereço */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span>Endereço</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CEP <span className="text-rose-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="cep"
                    required
                    placeholder="00000-000"
                    value={profileForm.cep}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCepLookup}
                    disabled={isSearchingCep}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                  >
                    {isSearchingCep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Logradouro <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="logradouro"
                  required
                  placeholder="Rua, Avenida, Praça..."
                  value={profileForm.logradouro}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="numero"
                  required
                  placeholder="Ex: 123"
                  value={profileForm.numero}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  name="complemento"
                  placeholder="Apto, Bloco..."
                  value={profileForm.complemento}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bairro <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="bairro"
                  required
                  placeholder="Bairro"
                  value={profileForm.bairro}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cidade <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="cidade"
                  required
                  placeholder="Cidade"
                  value={profileForm.cidade}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado (UF) <span className="text-rose-500">*</span>
                </label>
                <select
                  name="estado"
                  required
                  value={profileForm.estado}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50 cursor-pointer"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Conteúdo: Segurança & Senha */}
      {activeTab === 'security' && (
        <form onSubmit={handleSavePassword} className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <span>{user?.hasPassword ? 'Alterar Senha de Acesso' : 'Definir Senha de Acesso'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.hasPassword
                ? 'Atualize periodicamente sua senha para manter sua conta protegida.'
                : 'Você entrou utilizando sua conta Google. Defina uma senha para poder logar diretamente com e-mail e senha.'}
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            {user?.hasPassword && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Senha Atual <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Digite sua senha atual"
                    className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nova Senha <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Crie uma nova senha forte"
                  className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Indicador de Requisitos em Tempo Real */}
              {passwordForm.newPassword.length > 0 && (
                <div className="mt-3 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">Requisitos da senha:</span>
                  {passwordRules.map((r) => {
                    const pass = r.test(passwordForm.newPassword);
                    return (
                      <div key={r.label} className="flex items-center space-x-1.5 text-xs">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${pass ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={pass ? 'text-emerald-700 font-medium' : 'text-slate-400'}>{r.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmar Nova Senha <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Repita a nova senha"
                  className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordForm.confirmPassword.length > 0 &&
                passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">As senhas digitadas não coincidem.</p>
                )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50 cursor-pointer"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Atualizando Senha...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{user?.hasPassword ? 'Salvar Nova Senha' : 'Criar Senha de Acesso'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
