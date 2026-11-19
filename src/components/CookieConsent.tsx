import React, { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const COOKIE_STORAGE_KEY = 'sorteiohub_cookies_consent';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!consent) {
      // Delay pequeno para uma animação suave de entrada
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({ accepted: 'essential_only', date: new Date().toISOString() }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-950/90 text-white backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/15 relative">
        <button
          onClick={handleAcceptEssential}
          className="absolute top-3 right-3 text-white/40 hover:text-white transition p-1"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-yellow-400/10 text-yellow-400 rounded-xl border border-yellow-400/20 flex-shrink-0 mt-0.5">
            <Cookie className="w-6 h-6" />
          </div>

          <div className="space-y-2 pr-4">
            <div className="flex items-center space-x-1.5">
              <h4 className="text-sm font-bold text-white">Privacidade e Cookies</h4>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Utilizamos cookies essenciais para autenticação, segurança e conformidade com a LGPD. Ao continuar, você concorda com nossos{' '}
              <Link to="/legal" className="text-yellow-400 hover:text-yellow-300 underline font-medium">
                Termos e Política de Privacidade
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 mt-4 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            Apenas Necessários
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-md shadow-yellow-400/20 transition cursor-pointer"
          >
            Aceitar Todos
          </button>
        </div>
      </div>
    </div>
  );
};
