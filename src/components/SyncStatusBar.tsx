import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function SyncStatusBar() {
  const { user } = useAuth();
  const { syncStatus, manualSync } = useSupabaseSync();

  // 未登录用户不显示同步状态
  if (!user) return null;

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'bg-red-500';
    if (syncStatus.isSyncing) return 'bg-blue-500';
    if (syncStatus.error) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return '离线';
    if (syncStatus.isSyncing) return '自动同步中...';
    if (syncStatus.error) return '同步失败';
    if (syncStatus.lastAutoSync) {
      const timeDiff = Date.now() - syncStatus.lastAutoSync.getTime();
      if (timeDiff < 5000) return '自动同步完成';
    }
    return '自动同步已启用';
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return 'fa-wifi-slash';
    if (syncStatus.isSyncing) return 'fa-spinner fa-spin';
    if (syncStatus.error) return 'fa-exclamation-triangle';
    return 'fa-check';
  };

  const getSyncButtonText = () => {
    if (syncStatus.isSyncing) return '同步中...';
    return '手动同步';
  };

  const getLastSyncText = () => {
    if (syncStatus.lastAutoSync) {
      const timeDiff = Date.now() - syncStatus.lastAutoSync.getTime();
      if (timeDiff < 60000) return '刚刚自动同步';
      return `${Math.floor(timeDiff / 60000)}分钟前自动同步`;
    }
    if (syncStatus.lastSync) {
      return `手动同步: ${syncStatus.lastSync.toLocaleTimeString()}`;
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 状态指示器 */}
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", getStatusColor())} />
            <i className={cn("text-sm", getStatusIcon())} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getStatusText()}
            </span>
          </div>

          {/* 最后同步时间 */}
          {getLastSyncText() && (
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {getLastSyncText()}
            </span>
          )}

          {/* 错误信息 */}
          {syncStatus.error && (
            <span className="text-xs text-red-600 dark:text-red-400">
              {syncStatus.error}
            </span>
          )}
        </div>

        {/* 手动同步按钮 */}
        <button
          onClick={manualSync}
          disabled={syncStatus.isSyncing || !syncStatus.isOnline}
          className={cn(
            "px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2",
            "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          title="手动同步所有数据（作为自动同步的补充保障）"
        >
          <i className={cn(
            "fa-solid",
            syncStatus.isSyncing ? "fa-spinner fa-spin" : "fa-sync-alt"
          )} />
          {getSyncButtonText()}
        </button>
      </div>
    </div>
  );
}

