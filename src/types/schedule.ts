import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LearningTask, ScheduleContextType } from '@/types/schedule';

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}

interface ScheduleProviderProps {
  children: ReactNode;
}

export function ScheduleProvider({ children }: ScheduleProviderProps) {
  const [tasks, setTasks] = useState<LearningTask[]>([]);

  // 从localStorage加载数据
  useEffect(() => {
    const savedTasks = localStorage.getItem('learningTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // 初始化示例数据
      const initialTasks: LearningTask[] = [
        {
          id: '1',
          title: '数学练习',
          description: '完成代数基础练习题',
          startTime: '09:00',
          endTime: '10:30',
          date: new Date().toISOString().split('T')[0],
          completed: true,
          category: '数学',
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: '物理讲座',
          description: '观看牛顿定律视频课程',
          startTime: '14:00',
          endTime: '15:30',
          date: new Date().toISOString().split('T')[0],
          completed: false,
          category: '物理',
          priority: 'medium',
          createdAt: new Date().toISOString()
        }
      ];
      setTasks(initialTasks);
    }
  }, []);

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('learningTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<LearningTask, 'id' | 'createdAt'>) => {
    const newTask: LearningTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<LearningTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getTasksByDate = (date: string) => {
    return tasks.filter(task => task.date === date);
  };

  return (
    <ScheduleContext.Provider value={{
      tasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      getTasksByDate
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}
