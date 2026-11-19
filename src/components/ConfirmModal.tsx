import React from 'react';
import { AlertTriangle, HelpCircle, ShieldAlert, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-rose-400" />,
          iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
          btnConfirm: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 font-bold',
        };
      case 'warning':
        return {
          icon: <ShieldAlert className="w-6 h-6 text-yellow-400" />,
          iconBg: 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30',
          btnConfirm: 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black shadow-lg shadow-yellow-400/20',
        };
      default:
        return {
          icon: <HelpCircle className="w-6 h-6 text-yellow-400" />,
          iconBg: 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30',
          btnConfirm: 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black shadow-lg shadow-yellow-400/20',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[9998] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 transition-all">
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/15 space-y-5 text-white animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <span className="text-[11px] text-white/50">Confirmação de Ação</span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-white/40 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-white/80 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
          {message}
        </p>

        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-semibold text-white hover:bg-white/10 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs transition cursor-pointer ${styles.btnConfirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
