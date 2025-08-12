import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LearningTask, ScheduleContextType } from '@/types/schedule';
import { useAuth } from './AuthContext';
import { supabaseSync } from '@/services/supabaseSync';

// 添加 UUID 生成函数
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

interface ScheduleProviderProps {
  children: ReactNode;
}

export function ScheduleProvider({ children }: ScheduleProviderProps) {
  const [tasks, setTasks] = useState<LearningTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // 从云端加载数据
  const loadFromCloud = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const cloudTasks = await supabaseSync.fetchTasks(user.id);
      setTasks(cloudTasks);
    } catch (error) {
      console.error('加载云端数据失败:', error);
      // 如果云端加载失败，尝试从本地加载
      loadFromLocal();
    } finally {
      setIsLoading(false);
    }
  };

  // 从本地加载数据时，验证和修复 ID 格式
  const loadFromLocal = () => {
    const savedTasks = localStorage.getItem('learningTasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // 修复无效的 ID
      const fixedTasks = parsedTasks.map((task: LearningTask) => {
        if (!task.id.includes('-')) {
          // 如果不是 UUID 格式，重新生成
          return { ...task, id: generateUUID() };
        }
        return task;
      });
      setTasks(fixedTasks);
    }
  };

  // 同步到云端
  const syncToCloud = async () => {
    if (!user || isSyncing) return;
    
    setIsSyncing(true);
    try {
      console.log('开始同步到云端，当前任务数量:', tasks.length); // 添加调试
      const result = await supabaseSync.syncTasks(user.id, tasks);
      console.log('同步结果:', result); // 添加调试
      return result;
    } catch (error) {
      console.error('同步失败:', error);
      return { success: false, error };
    } finally {
      setIsSyncing(false);
    }
  };

  // 初始化数据加载
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFromCloud();
    } else {
      loadFromLocal();
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // 保存到本地存储
  useEffect(() => {
    localStorage.setItem('learningTasks', JSON.stringify(tasks));
  }, [tasks]);

  // 自动同步到云端（防抖）
  useEffect(() => {
    if (!isAuthenticated || !user || tasks.length === 0) return;

    const timeoutId = setTimeout(() => {
      syncToCloud();
    }, 2000); // 2秒后同步

    return () => clearTimeout(timeoutId);
  }, [tasks, isAuthenticated, user]);

  const addTask = async (taskData: Omit<LearningTask, 'id' | 'createdAt'>) => {
    const newTask: LearningTask = {
      ...taskData,
      id: generateUUID(), // 使用 UUID 而不是时间戳
      createdAt: new Date().toISOString()
    };
    
    setTasks(prev => [...prev, newTask]);
    
    // 立即同步到云端
    if (user) {
      setTimeout(() => syncToCloud(), 100);
    }
  };

  const updateTask = async (id: string, updates: Partial<LearningTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
    
    if (user) {
      setTimeout(() => syncToCloud(), 100);
    }
  };

  const deleteTask = async (id: string) => {
    console.log('开始删除任务:', id);
    
    // 直接更新状态
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
    
    // 立即保存到 localStorage
    localStorage.setItem('learningTasks', JSON.stringify(newTasks));
    
    console.log('任务删除完成，剩余任务:', newTasks.length);
    
    // 立即同步到云端，使用新的任务列表
    if (user) {
      try {
        console.log('开始同步删除到云端...');
        const result = await supabaseSync.syncTasks(user.id, newTasks);
        console.log('删除同步结果:', result);
      } catch (error) {
        console.error('同步删除失败:', error);
      }
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    
    if (user) {
      setTimeout(() => syncToCloud(), 100);
    }
  };

  const getTasksByDate = (date: string) => {
    return tasks.filter(task => task.date === date);
  };

  // 手动同步函数
  const manualSync = async () => {
    if (!user) return { success: false, message: '请先登录' };
    return await syncToCloud();
  };

  const value = {
    tasks,
    isLoading,
    isSyncing,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTasksByDate,
    manualSync,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}











