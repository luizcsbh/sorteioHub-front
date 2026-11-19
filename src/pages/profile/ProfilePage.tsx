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

  // Estado do formulário de dados cadastrais
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
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Estado dos campos de senha
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado de envio
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileForm.name.trim()) {
      toast.warning('O nome não pode ficar em branco.');
      return;
    }

    const isChangingPassword = passwordForm.newPassword.trim().length > 0;

    // Se preencheu nova senha, valida os requisitos
    if (isChangingPassword) {
      if (user?.hasPassword && !passwordForm.currentPassword) {
        toast.warning('Informe sua senha atual para alterar para uma nova senha.');
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('A confirmação da nova senha não confere.');
        return;
      }

      const failedRule = passwordRules.find((r) => !r.test(passwordForm.newPassword));
      if (failedRule) {
        toast.error(`Requisito de senha não atendido: ${failedRule.label}`);
        return;
      }
    }

    setIsSaving(true);
    try {
      // 1. Atualiza dados cadastrais e endereço
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

      // 2. Se preencheu nova senha, atualiza a senha
      if (isChangingPassword) {
        await changePassword({
          currentPassword: passwordForm.currentPassword || undefined,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        toast.success('Perfil e nova senha salvos com sucesso!');
      } else {
        toast.success('Dados cadastrais atualizados com sucesso!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Erro ao salvar alterações do perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header do Perfil */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-white">
        <div className="relative">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/10 shadow-md border border-white/20"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-600 text-slate-950 text-3xl font-black flex items-center justify-center shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3">
            <h1 className="text-2xl font-black text-white">{user?.name}</h1>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 self-center md:self-auto">
              {user?.role}
            </span>
          </div>
          <p className="text-sm text-white/60">{user?.email}</p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-white/70">
            {user?.cpfMasked && (
              <span className="flex items-center space-x-1 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>CPF: {user.cpfMasked}</span>
              </span>
            )}
            <span className="flex items-center space-x-1 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-yellow-400" />
              <span>Conformidade LGPD Ativa</span>
            </span>
            <span className="flex items-center space-x-1 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{user?.hasPassword ? 'Senha Cadastrada' : 'Login via Google'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Formulário Principal Unificado */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Informações Pessoais */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 p-6 md:p-8 shadow-xl space-y-4 text-white">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-yellow-400" />
              <span>Informações Pessoais</span>
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Seus dados de identificação e contato na plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Nome Completo <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={profileForm.name}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                E-mail (Identificador da Conta)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 border border-white/10 bg-white/5 rounded-xl text-sm text-white/40 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                name="phone"
                placeholder="(00) 00000-0000"
                value={profileForm.phone}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                CPF (Protegido por Criptografia LGPD)
              </label>
              <input
                type="text"
                disabled
                value={user?.cpfMasked || 'Não cadastrado'}
                className="w-full px-3.5 py-2.5 border border-white/10 bg-white/5 rounded-xl text-sm text-white/40 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Seção 2: Endereço */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 p-6 md:p-8 shadow-xl space-y-4 text-white">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <span>Endereço</span>
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Endereço para entrega de prêmios e correspondências oficiais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
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
                  value={profileForm.cep}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCepLookup}
                  disabled={isSearchingCep}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                  title="Buscar endereço pelo CEP"
                >
                  {isSearchingCep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
                value={profileForm.logradouro}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
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
                placeholder="Ex: 123"
                value={profileForm.numero}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Complemento
              </label>
              <input
                type="text"
                name="complemento"
                placeholder="Apto, Bloco..."
                value={profileForm.complemento}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
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
                placeholder="Bairro"
                value={profileForm.bairro}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
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
                placeholder="Cidade"
                value={profileForm.cidade}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Estado (UF) <span className="text-rose-400">*</span>
              </label>
              <select
                name="estado"
                required
                value={profileForm.estado}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 border border-white/20 rounded-xl text-sm bg-slate-900 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              >
                {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                  <option key={uf} value={uf} className="bg-slate-900 text-white">
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Seção 3: Senha de Acesso */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 p-6 md:p-8 shadow-xl space-y-4 text-white">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-yellow-400" />
              <span>{user?.hasPassword ? 'Alterar Senha de Acesso' : 'Definir Senha de Acesso'}</span>
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              {user?.hasPassword
                ? 'Preencha os campos abaixo apenas se desejar trocar sua senha de acesso.'
                : 'Defina uma senha caso queira acessar a plataforma diretamente com seu e-mail e senha, sem depender exclusivamente da conta Google.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {user?.hasPassword && (
              <div className="md:col-span-2 max-w-md">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Digite sua senha atual"
                    className="w-full px-3.5 py-2.5 pr-10 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Deixe em branco para não alterar"
                  className="w-full px-3.5 py-2.5 pr-10 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Indicador de Requisitos em Tempo Real */}
              {passwordForm.newPassword.length > 0 && (
                <div className="mt-3 space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="text-[11px] font-bold text-white/70 block mb-1">Requisitos da senha:</span>
                  {passwordRules.map((r) => {
                    const pass = r.test(passwordForm.newPassword);
                    return (
                      <div key={r.label} className="flex items-center space-x-1.5 text-xs">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${pass ? 'text-emerald-400' : 'text-white/30'}`} />
                        <span className={pass ? 'text-emerald-300 font-medium' : 'text-white/40'}>{r.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Repita a nova senha"
                  className="w-full px-3.5 py-2.5 pr-10 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordForm.confirmPassword.length > 0 &&
                passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-400 font-medium">As senhas digitadas não coincidem.</p>
                )}
            </div>
          </div>
        </div>

        {/* Botão Salvar Todas as Alterações */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl shadow-lg shadow-yellow-400/20 transition disabled:opacity-50 cursor-pointer text-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando Perfil...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Todas as Alterações</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
