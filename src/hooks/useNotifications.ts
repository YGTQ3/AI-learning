import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  dailyGoals: boolean;
  studyBreaks: boolean;
  reviewReminders: boolean;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      taskReminders: true,
      dailyGoals: true,
      studyBreaks: true,
      reviewReminders: true,
    };
  });

  // 检查浏览器支持
  const isSupported = 'Notification' in window;

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }, [settings]);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('您的浏览器不支持通知功能');
      return false;
    }

    try {
      // 检查当前权限状态
      if (Notification.permission === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }));
        toast.success('通知权限已开启');
        return true;
      }

      if (Notification.permission === 'denied') {
        toast.error('通知权限已被拒绝，请在浏览器设置中手动开启');
        return false;
      }

      // 请求权限
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }));
        toast.success('通知权限已开启！');
        return true;
      } else if (result === 'denied') {
        toast.error('通知权限被拒绝，您可以在浏览器设置中重新开启');
        return false;
      } else {
        toast.warning('通知权限请求被忽略');
        return false;
      }
    } catch (error) {
      console.error('请求通知权限失败:', error);
      toast.error('请求通知权限时出现错误');
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported) {
      console.warn('浏览器不支持通知');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('没有通知权限');
      return;
    }

    if (!settings.enabled) {
      console.warn('通知功能已关闭');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: false,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // 自动关闭通知
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('发送通知失败:', error);
      toast.error('发送通知失败');
    }
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // 重置权限状态（用于调试）
  const resetPermission = () => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  };

  return {
    permission,
    settings,
    requestPermission,
    sendNotification,
    updateSettings,
    resetPermission,
    isSupported,
  };
}
