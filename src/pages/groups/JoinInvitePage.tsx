import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Users, CheckCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const JoinInvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated, user, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // Salva URL para retornar após o login
      localStorage.setItem('sorteiohub_return_url', `/invite/${token}`);
      navigate('/login');
      return;
    }

    if (needsProfileCompletion) {
      navigate('/complete-profile');
      return;
    }

    async function processJoin() {
      setLoading(true);
      try {
        const res = await api.post(`/groups/join/${token}`);
        setResult(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao processar convite.');
      } finally {
        setLoading(false);
      }
    }

    processJoin();
  }, [token, isAuthenticated, needsProfileCompletion, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 p-8 shadow-2xl text-center space-y-6 text-white">
        <div className="w-16 h-16 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded-2xl mx-auto flex items-center justify-center">
          <Users className="w-8 h-8" />
        </div>

        {loading ? (
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Validando seu Convite...</h2>
            <p className="text-xs text-white/60">
              Verificando autorização criptográfica e limites de utilização.
            </p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Não foi possível entrar</h2>
            <p className="text-xs text-rose-300 bg-rose-500/20 p-3 rounded-xl border border-rose-500/30">
              {error}
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition"
            >
              Ir para o Início
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Convite Processado!</h2>
            <p className="text-xs text-emerald-300 bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30 font-medium">
              {result?.message}
            </p>

            <Link
              to="/groups"
              className="inline-flex items-center px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-yellow-400/20 transition space-x-1.5"
            >
              <span>Acessar Meus Grupos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
