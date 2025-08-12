import { useNotifications } from '@/hooks/useNotifications';

export function NotificationTest() {
  const { sendNotification, permission } = useNotifications();

  const testNotification = () => {
    if (permission === 'granted') {
      sendNotification('测试通知', {
        body: '这是一个测试通知，说明通知功能正常工作！',
        tag: 'test',
      });
    }
  };

  if (permission !== 'granted') return null;

  return (
    <button
      onClick={testNotification}
      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
    >
      测试通知
    </button>
  );
}