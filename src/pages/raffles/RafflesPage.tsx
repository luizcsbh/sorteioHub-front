import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Gift, Clock, ArrowRight, CheckCircle, Search } from 'lucide-react';

export const RafflesPage: React.FC = () => {
  const [raffles, setRaffles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/raffles');
        setRaffles(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = raffles.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.prize.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.group?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-2">
            <Gift className="w-8 h-8 text-yellow-400" />
            <span>Sorteios Autorizados</span>
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Participe dos sorteios ativos vinculados aos seus grupos fechados
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
          <input
            type="text"
            placeholder="Buscar por sorteio, prêmio ou grupo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-white/50 text-sm">Carregando sorteios...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-12 text-center text-white/60 text-xs">
          Nenhum sorteio encontrado para a busca.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((raffle) => {
            const hasParticipated = raffle.participants?.length > 0;
            return (
              <div
                key={raffle.id}
                className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6 hover:border-yellow-400/40 transition flex flex-col justify-between space-y-4 shadow-xl text-white overflow-hidden"
              >
                <div className="space-y-3 min-w-0">
                  <div className="flex justify-between items-start">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        raffle.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : raffle.status === 'DRAWN'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-white/10 text-white/70 border border-white/15'
                      }`}
                    >
                      {raffle.status === 'PUBLISHED'
                        ? 'Aberto'
                        : raffle.status === 'DRAWN'
                        ? 'Sorteado'
                        : raffle.status}
                    </span>
                    <span className="text-xs text-white/50 truncate max-w-[150px]">Grupo: {raffle.group?.name}</span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-white break-words">{raffle.title}</h3>
                    <p className="text-xs text-white/70 line-clamp-2 mt-1 break-words">{raffle.description}</p>
                  </div>

                  <div className="p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/70">Prêmio:</span>
                    <span className="text-sm font-black text-yellow-300">{raffle.prize}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="text-white/50 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{new Date(raffle.drawDateTime).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {hasParticipated && (
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center space-x-0.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Inscrito</span>
                      </span>
                    )}

                    <Link
                      to={raffle.status === 'DRAWN' ? `/raffles/${raffle.id}/results` : `/raffles/${raffle.id}`}
                      className="inline-flex items-center text-xs font-bold text-yellow-400 hover:text-yellow-300 hover:underline"
                    >
                      <span>{raffle.status === 'DRAWN' ? 'Resultado' : 'Ver Detalhes'}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
