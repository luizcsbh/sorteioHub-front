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
          icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
          iconBg: 'bg-rose-50 text-rose-600',
          btnConfirm: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
        };
      case 'warning':
        return {
          icon: <ShieldAlert className="w-6 h-6 text-amber-600" />,
          iconBg: 'bg-amber-50 text-amber-600',
          btnConfirm: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
        };
      default:
        return {
          icon: <HelpCircle className="w-6 h-6 text-indigo-600" />,
          iconBg: 'bg-indigo-50 text-indigo-600',
          btnConfirm: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[9998] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <span className="text-[11px] text-slate-400">Confirmação de Ação</span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
          {message}
        </p>

        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition ${styles.btnConfirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
