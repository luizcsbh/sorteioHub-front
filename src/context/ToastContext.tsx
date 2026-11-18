import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4500) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (message: string, title?: string, duration?: number) =>
      addToast('success', message, title || 'Sucesso', duration),
    error: (message: string, title?: string, duration?: number) =>
      addToast('error', message, title || 'Erro', duration),
    warning: (message: string, title?: string, duration?: number) =>
      addToast('warning', message, title || 'Atenção', duration),
    info: (message: string, title?: string, duration?: number) =>
      addToast('info', message, title || 'Informação', duration),
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
          accent: 'bg-emerald-500',
        };
      case 'error':
        return {
          bg: 'bg-white border-rose-200 text-slate-800 shadow-rose-500/10',
          icon: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
          accent: 'bg-rose-500',
        };
      case 'warning':
        return {
          bg: 'bg-white border-amber-200 text-slate-800 shadow-amber-500/10',
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
          accent: 'bg-amber-500',
        };
      case 'info':
        return {
          bg: 'bg-white border-indigo-200 text-slate-800 shadow-indigo-500/10',
          icon: <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />,
          accent: 'bg-indigo-500',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}

      {/* Container de Toasts no topo à direita */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const style = getToastStyles(t.type);
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-2xl border shadow-xl transition-all duration-300 transform translate-y-0 opacity-100 relative overflow-hidden backdrop-blur-md ${style.bg}`}
            >
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${style.accent}`} />
              <div className="pt-0.5">{style.icon}</div>
              <div className="flex-1 space-y-0.5">
                {t.title && <div className="text-xs font-bold text-slate-900">{t.title}</div>}
                <div className="text-xs text-slate-600 leading-relaxed">{t.message}</div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser utilizado dentro de um ToastProvider');
  }
  return context;
}
