import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Informe seu e-mail cadastrado.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-black text-white tracking-tight">SorteioHub</h1>
          <p className="text-white/50 text-sm mt-1">Plataforma de Sorteios Privados</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-8">
          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-400/15 border border-emerald-400/30 rounded-full mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">E-mail Enviado!</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Se o e-mail <span className="text-white font-semibold">{email}</span> estiver cadastrado na plataforma,
                você receberá as instruções para redefinir sua senha em breve.
              </p>
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4 mb-6">
                <p className="text-yellow-300/80 text-xs leading-relaxed">
                  ⏱️ O link de redefinição expira em <strong>1 hora</strong>. Verifique também a pasta de spam.
                </p>
              </div>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black py-3 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Login
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Esqueceu a Senha?</h2>
                <p className="text-white/50 text-sm">
                  Informe seu e-mail e enviaremos as instruções para redefinir sua senha.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-5">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-white/70 text-sm font-semibold mb-2">
                    E-mail cadastrado
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      className="w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:outline-none py-3 pl-10 pr-4 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black py-3 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Enviar Instruções
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-white/50 hover:text-yellow-400 text-sm transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar ao Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
