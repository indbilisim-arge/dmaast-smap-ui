import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import Tooltip from './Tooltip';

interface AutoRefreshProps {
  intervalMs?: number;
  onRefresh: () => void;
  showLastUpdated?: boolean;
}

export default function AutoRefresh({
  intervalMs = 60000,
  onRefresh,
  showLastUpdated = true,
}: AutoRefreshProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(intervalMs / 1000);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastUpdated(new Date());
      setCountdown(intervalMs / 1000);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, intervalMs]);

  useEffect(() => {
    if (isPaused) return;

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleRefresh();
          return intervalMs / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [isPaused, intervalMs, handleRefresh]);

  const formatLastUpdated = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center gap-2">
      {showLastUpdated && (
        <span className="text-xs text-surface-500 hidden sm:inline">
          Updated: {formatLastUpdated(lastUpdated)}
        </span>
      )}

      {!isPaused && (
        <div className="flex items-center gap-1 px-2 py-1 bg-surface-100 rounded text-xs text-surface-600">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span>{countdown}s</span>
        </div>
      )}

      <div className="flex items-center">
        <Tooltip content={isPaused ? 'Resume auto-refresh' : 'Pause auto-refresh'}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-lg transition-colors ${
              isPaused
                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                : 'text-surface-500 hover:bg-surface-100'
            }`}
            aria-label={isPaused ? 'Resume auto-refresh' : 'Pause auto-refresh'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </Tooltip>

        <Tooltip content="Refresh now">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-surface-500 hover:bg-surface-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh now"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

interface RefreshIndicatorProps {
  isRefreshing: boolean;
  lastUpdated?: Date;
}

export function RefreshIndicator({ isRefreshing, lastUpdated }: RefreshIndicatorProps) {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex items-center gap-2 text-xs text-surface-500">
      {isRefreshing ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Updating...</span>
        </>
      ) : lastUpdated ? (
        <>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          <span>Last updated: {formatTime(lastUpdated)}</span>
        </>
      ) : null}
    </div>
  );
}
