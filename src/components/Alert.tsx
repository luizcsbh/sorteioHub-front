import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, ShieldCheck, X } from 'lucide-react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info' | 'lgpd';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return {
          container: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />,
          title: 'text-emerald-900',
        };
      case 'error':
        return {
          container: 'bg-rose-50/80 border-rose-200 text-rose-950',
          icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />,
          title: 'text-rose-900',
        };
      case 'warning':
        return {
          container: 'bg-amber-50/80 border-amber-200 text-amber-950',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />,
          title: 'text-amber-900',
        };
      case 'lgpd':
        return {
          container: 'bg-indigo-50/80 border-indigo-200 text-indigo-950',
          icon: <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />,
          title: 'text-indigo-900',
        };
      default:
        return {
          container: 'bg-slate-50/80 border-slate-200 text-slate-900',
          icon: <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />,
          title: 'text-slate-900',
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs leading-relaxed transition ${styles.container} ${className}`}>
      {styles.icon}
      <div className="flex-1 space-y-0.5">
        {title && <div className={`font-bold text-xs ${styles.title}`}>{title}</div>}
        <div className="opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
