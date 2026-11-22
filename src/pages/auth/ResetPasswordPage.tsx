import { useState, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-emerald-400' : 'text-white/40'}`}>
      <CheckCircle className={`w-3 h-3 ${met ? 'opacity-100' : 'opacity-30'}`} />
      {label}
    </div>
  );
}

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const rules = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const allRulesMet = Object.values(rules).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allRulesMet) {
      setError('A nova senha não atende aos requisitos mínimos de segurança.');
      return;
    }
    if (!passwordsMatch) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!token) {
      setError('Token de redefinição inválido. Solicite um novo link.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Ocorreu um erro. O link pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md text-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-400/15 border border-emerald-400/30 rounded-full mb-5">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Senha Redefinida!</h2>
            <p className="text-white/60 text-sm mb-6">
              Sua senha foi alterada com sucesso. Você será redirecionado para o login em instantes...
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20"
            >
              Ir para o Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">SorteioClub</h1>
          <p className="text-white/50 text-sm mt-1">Plataforma de Sorteios Privados</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-yellow-400/10 border border-yellow-400/30 rounded-xl mb-3">
              <Lock className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Nova Senha</h2>
            <p className="text-white/50 text-sm">
              Crie uma nova senha segura para sua conta.
            </p>
          </div>

          {!token && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-semibold">Link Inválido</p>
                <p className="text-red-400/70 text-xs mt-1">Este link de redefinição é inválido. Solicite um novo.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New password */}
            <div>
              <label className="block text-white/70 text-sm font-semibold mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none py-3 pl-10 pr-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password rules */}
              {newPassword.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <PasswordRule met={rules.length} label="Mínimo 8 caracteres" />
                  <PasswordRule met={rules.upper} label="Letra maiúscula" />
                  <PasswordRule met={rules.lower} label="Letra minúscula" />
                  <PasswordRule met={rules.number} label="Número" />
                  <PasswordRule met={rules.special} label="Caractere especial" />
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-white/70 text-sm font-semibold mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className={`w-full bg-white/10 border rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none py-3 pl-10 pr-11 text-sm ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-emerald-500/50'
                        : 'border-red-500/50'
                      : 'border-white/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p className={`text-xs mt-1 ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                  {passwordsMatch ? '✓ As senhas coincidem' : '✗ As senhas não coincidem'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black py-3 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Redefinir Senha
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1.5 text-white/50 hover:text-yellow-400 text-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Solicitar novo link
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
