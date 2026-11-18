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
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Gift className="w-7 h-7 text-indigo-600" />
            <span>Sorteios Autorizados</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Participe dos sorteios ativos vinculados aos seus grupos fechados
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por sorteio, prêmio ou grupo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Carregando sorteios...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          Nenhum sorteio encontrado para a busca.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((raffle) => {
            const hasParticipated = raffle.participants?.length > 0;
            return (
              <div
                key={raffle.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-indigo-200 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        raffle.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : raffle.status === 'DRAWN'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {raffle.status === 'PUBLISHED'
                        ? 'Aberto'
                        : raffle.status === 'DRAWN'
                        ? 'Sorteado'
                        : raffle.status}
                    </span>
                    <span className="text-xs text-slate-400">Grupo: {raffle.group?.name}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{raffle.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{raffle.description}</p>
                  </div>

                  <div className="p-3 bg-indigo-50/50 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Prêmio:</span>
                    <span className="text-sm font-bold text-indigo-700">{raffle.prize}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(raffle.drawDateTime).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {hasParticipated && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center space-x-0.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Inscrito</span>
                      </span>
                    )}

                    <Link
                      to={raffle.status === 'DRAWN' ? `/raffles/${raffle.id}/results` : `/raffles/${raffle.id}`}
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700"
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
