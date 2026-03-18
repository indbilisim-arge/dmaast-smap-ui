import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastConfig: Record<ToastType, { icon: typeof AlertTriangle; bgColor: string; borderColor: string; iconColor: string }> = {
  success: { icon: CheckCircle, bgColor: 'bg-green-50', borderColor: 'border-green-200', iconColor: 'text-green-600' },
  error: { icon: AlertCircle, bgColor: 'bg-red-50', borderColor: 'border-red-200', iconColor: 'text-red-600' },
  warning: { icon: AlertTriangle, bgColor: 'bg-amber-50', borderColor: 'border-amber-200', iconColor: 'text-amber-600' },
  info: { icon: Info, bgColor: 'bg-blue-50', borderColor: 'border-blue-200', iconColor: 'text-blue-600' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => {
          const config = toastConfig[toast.type];
          const Icon = config.icon;
          return (
            <div
              key={toast.id}
              className={`${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4 animate-slide-in flex items-start gap-3`}
              role="alert"
            >
              <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900">{toast.title}</p>
                {toast.message && (
                  <p className="text-sm text-surface-600 mt-1">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-surface-400 hover:text-surface-600 transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
