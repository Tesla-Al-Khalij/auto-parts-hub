import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => void | Promise<void>;
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const handleRefresh = () => {
    if (onRefresh) {
      return onRefresh();
    }
    // Default: reload the page
    window.location.reload();
  };

  const { pullDistance, isRefreshing, progress, shouldRefresh } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    maxPull: 120,
  });

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div
        className={cn(
          "fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-center transition-opacity duration-200",
          pullDistance > 10 || isRefreshing ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: `${Math.max(pullDistance - 40, 16)}px`,
        }}
      >
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border shadow-lg transition-all duration-200",
            shouldRefresh && "bg-primary border-primary",
            isRefreshing && "bg-primary border-primary"
          )}
        >
          <RefreshCw
            className={cn(
              "h-5 w-5 transition-all duration-200",
              shouldRefresh ? "text-primary-foreground" : "text-muted-foreground",
              isRefreshing && "text-primary-foreground animate-spin"
            )}
            style={{
              transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content with pull transform */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
