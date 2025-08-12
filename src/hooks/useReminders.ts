import { useEffect, useRef } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useNotifications } from './useNotifications';
import { LearningTask } from '@/types/schedule';

export function useReminders() {
  const { tasks } = useSchedule();
  const { sendNotification, settings } = useNotifications();
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // 清理所有定时器
  const clearAllReminders = () => {
    intervalsRef.current.forEach(interval => clearTimeout(interval));
    intervalsRef.current.clear();
  };

  // 设置任务提醒
  const setTaskReminder = (task: LearningTask) => {
    if (!settings.enabled || !settings.taskReminders) return;

    const now = new Date();
    const taskDate = new Date(`${task.date}T${task.startTime}`);
    
    // 提前15分钟提醒
    const reminderTime = new Date(taskDate.getTime() - 15 * 60 * 1000);
    
    if (reminderTime > now && !task.completed) {
      const timeout = setTimeout(() => {
        sendNotification('学习提醒', {
          body: `${task.title} 将在15分钟后开始`,
          tag: `task-${task.id}`,
        });
      }, reminderTime.getTime() - now.getTime());
      
      intervalsRef.current.add(timeout);
    }

    // 任务开始时提醒
    if (taskDate > now && !task.completed) {
      const timeout = setTimeout(() => {
        sendNotification('开始学习', {
          body: `现在开始：${task.title}`,
          tag: `task-start-${task.id}`,
        });
      }, taskDate.getTime() - now.getTime());
      
      intervalsRef.current.add(timeout);
    }
  };

  // 设置每日目标提醒
  const setDailyGoalReminder = () => {
    if (!settings.enabled || !settings.dailyGoals) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const todayTasks = tasks.filter(task => task.date === today);
    const completedTasks = todayTasks.filter(task => task.completed);
    
    // 如果还有未完成的任务，设置晚上8点提醒
    if (todayTasks.length > completedTasks.length) {
      const reminderTime = new Date();
      reminderTime.setHours(20, 0, 0, 0);
      
      if (reminderTime > now) {
        const timeout = setTimeout(() => {
          const remaining = todayTasks.length - completedTasks.length;
          sendNotification('每日学习目标', {
            body: `您今天还有 ${remaining} 个学习任务未完成`,
            tag: 'daily-goal',
          });
        }, reminderTime.getTime() - now.getTime());
        
        intervalsRef.current.add(timeout);
      }
    }
  };

  // 设置学习休息提醒
  const setStudyBreakReminder = () => {
    if (!settings.enabled || !settings.studyBreaks) return;

    // 每45分钟提醒休息
    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // 只在学习时间段提醒（9-22点）
      if (currentHour >= 9 && currentHour <= 22) {
        sendNotification('休息提醒', {
          body: '您已经学习了45分钟，建议休息5-10分钟',
          tag: 'study-break',
        });
      }
    }, 45 * 60 * 1000);

    intervalsRef.current.add(interval as any);
  };

  // 设置复习提醒（基于艾宾浩斯遗忘曲线）
  const setReviewReminder = (task: LearningTask) => {
    if (!settings.enabled || !settings.reviewReminders || !task.completed) return;

    const completedDate = new Date(task.createdAt);
    const reviewIntervals = [1, 3, 7, 15, 30]; // 天数

    reviewIntervals.forEach(days => {
      const reviewDate = new Date(completedDate.getTime() + days * 24 * 60 * 60 * 1000);
      const now = new Date();

      if (reviewDate > now) {
        const timeout = setTimeout(() => {
          sendNotification('复习提醒', {
            body: `建议复习：${task.title}`,
            tag: `review-${task.id}-${days}`,
          });
        }, reviewDate.getTime() - now.getTime());

        intervalsRef.current.add(timeout);
      }
    });
  };

  // 初始化所有提醒
  useEffect(() => {
    clearAllReminders();

    if (settings.enabled) {
      // 为所有任务设置提醒
      tasks.forEach(task => {
        setTaskReminder(task);
        if (task.completed) {
          setReviewReminder(task);
        }
      });

      // 设置每日目标提醒
      setDailyGoalReminder();

      // 设置学习休息提醒
      setStudyBreakReminder();
    }

    return clearAllReminders;
  }, [tasks, settings]);

  return {
    clearAllReminders,
    setTaskReminder,
    setDailyGoalReminder,
    setStudyBreakReminder,
    setReviewReminder,
  };
}