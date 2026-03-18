import { useState, useRef, useEffect } from 'react';
import { Activity, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import Tooltip from './Tooltip';

type SystemHealth = 'online' | 'warning' | 'critical';

interface SystemStatusProps {
  health?: SystemHealth;
}

export default function SystemStatus({ health = 'online' }: SystemStatusProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const statusConfig: Record<SystemHealth, { color: string; bgColor: string; label: string }> = {
    online: { color: 'text-green-600', bgColor: 'bg-green-500', label: t('status.online') },
    warning: { color: 'text-amber-600', bgColor: 'bg-amber-500', label: t('status.warning') },
    critical: { color: 'text-red-600', bgColor: 'bg-red-500', label: t('status.critical') },
  };

  const config = statusConfig[health];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const subsystems = [
    { name: 'Manufacturing DT', status: 'online' as SystemHealth },
    { name: 'Logistics DT', status: 'online' as SystemHealth },
    { name: 'MO-DSS Engine', status: health },
    { name: 'Knowledge Graph', status: 'online' as SystemHealth },
    { name: 'Data Pipeline', status: health === 'critical' ? 'warning' as SystemHealth : 'online' as SystemHealth },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <Tooltip content={config.label} position="bottom">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
          aria-label={config.label}
        >
          <div className="relative">
            <Activity className={`w-4 h-4 ${config.color}`} />
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 ${config.bgColor} rounded-full ${health !== 'online' ? 'animate-pulse' : ''}`} />
          </div>
          <ChevronDown className="w-4 h-4 text-surface-400" />
        </button>
      </Tooltip>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-surface-200 rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-surface-100">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 ${config.bgColor} rounded-full`} />
              <span className="font-medium text-surface-900">{config.label}</span>
            </div>
          </div>
          <div className="py-2">
            {subsystems.map((system) => {
              const sysConfig = statusConfig[system.status];
              return (
                <div key={system.name} className="px-4 py-1.5 flex items-center justify-between">
                  <span className="text-sm text-surface-600">{system.name}</span>
                  <span className={`w-2 h-2 ${sysConfig.bgColor} rounded-full`} />
                </div>
              );
            })}
          </div>
          <div className="px-4 py-2 border-t border-surface-100">
            <p className="text-xs text-surface-500">Last updated: Just now</p>
          </div>
        </div>
      )}
    </div>
  );
}
