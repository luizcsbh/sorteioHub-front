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
          container: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />,
          title: 'text-emerald-300 font-bold',
        };
      case 'error':
        return {
          container: 'bg-rose-500/15 border-rose-500/30 text-rose-200',
          icon: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />,
          title: 'text-rose-300 font-bold',
        };
      case 'warning':
        return {
          container: 'bg-amber-500/15 border-amber-500/30 text-amber-200',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />,
          title: 'text-amber-300 font-bold',
        };
      case 'lgpd':
        return {
          container: 'bg-yellow-400/15 border-yellow-400/30 text-yellow-200',
          icon: <ShieldCheck className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />,
          title: 'text-yellow-300 font-bold',
        };
      default:
        return {
          container: 'bg-white/10 border-white/15 text-white',
          icon: <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />,
          title: 'text-white font-bold',
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
