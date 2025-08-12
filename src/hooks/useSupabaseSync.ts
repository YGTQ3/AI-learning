import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useResource } from '@/contexts/ResourceContext';
import { toast } from 'sonner';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  autoSyncEnabled: boolean;
  error: string | null;
  lastSync: Date | null;
  lastAutoSync: Date | null;
}

export function useSupabaseSync() {
  const { user, isAuthenticated } = useAuth();
  const { tasks, manualSync: syncTasks, isSyncing: tasksSyncing } = useSchedule();
  const { resources, manualSync: syncResources, isSyncing: resourcesSyncing } = useResource();
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    autoSyncEnabled: true,
    error: null,
    lastSync: null,
    lastAutoSync: null,
  });

  const lastDataRef = useRef({ tasksLength: 0, resourcesLength: 0 });

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true, error: null }));
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 监听自动同步状态
  useEffect(() => {
    const isAutoSyncing = tasksSyncing || resourcesSyncing;
    setSyncStatus(prev => ({ ...prev, isSyncing: isAutoSyncing }));

    // 如果自动同步完成，更新最后自动同步时间
    if (!isAutoSyncing && (lastDataRef.current.tasksLength !== tasks.length || lastDataRef.current.resourcesLength !== resources.length)) {
      setSyncStatus(prev => ({ ...prev, lastAutoSync: new Date() }));
      lastDataRef.current = { tasksLength: tasks.length, resourcesLength: resources.length };
    }
  }, [tasksSyncing, resourcesSyncing, tasks.length, resources.length]);

  // 网络恢复时自动同步
  useEffect(() => {
    if (syncStatus.isOnline && isAuthenticated && !syncStatus.isSyncing) {
      const timeout = setTimeout(() => {
        console.log('网络恢复，执行自动同步...');
        manualSync(true); // 静默同步
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [syncStatus.isOnline, isAuthenticated]);

  const manualSync = async (silent = false) => {
    if (!syncStatus.isOnline || syncStatus.isSyncing || !isAuthenticated || !user) {
      if (!silent) {
        if (!isAuthenticated) {
          toast.error('请先登录');
        } else if (!syncStatus.isOnline) {
          toast.error('网络连接不可用');
        } else if (syncStatus.isSyncing) {
          toast.info('正在自动同步中...');
        }
      }
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
    
    if (!silent) {
      toast.loading('正在手动同步数据...', { id: 'manual-sync-toast' });
    }

    try {
      // 同步任务
      console.log('开始手动同步任务...');
      const taskResult = await syncTasks();
      
      // 同步资源
      console.log('开始手动同步资源...');
      const resourceResult = await syncResources();
      
      // 检查同步结果
      if (taskResult?.success && resourceResult?.success) {
        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          lastSync: new Date(),
          error: null,
        }));
        
        if (!silent) {
          toast.success('手动同步成功', { id: 'manual-sync-toast' });
        }
      } else {
        throw new Error('部分数据同步失败');
      }
    } catch (error) {
      console.error('手动同步失败:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : '同步失败',
      }));
      
      if (!silent) {
        toast.error('手动同步失败，请稍后重试', { id: 'manual-sync-toast' });
      }
    }
  };

  return {
    syncStatus,
    manualSync: () => manualSync(false),
  };
}




