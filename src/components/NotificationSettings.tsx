import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationTest } from './NotificationTest';

interface NotificationSettingsProps {
  onClose: () => void;
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { permission, settings, requestPermission, updateSettings, isSupported, resetPermission } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    const success = await requestPermission();
    setIsLoading(false);
    
    if (success) {
      // 权限获取成功后，刷新权限状态
      setTimeout(() => {
        resetPermission();
      }, 100);
    }
  };

  const getPermissionStatusText = () => {
    switch (permission) {
      case 'granted':
        return { text: '已授权', color: 'text-green-600 dark:text-green-400' };
      case 'denied':
        return { text: '已拒绝', color: 'text-red-600 dark:text-red-400' };
      default:
        return { text: '未设置', color: 'text-yellow-600 dark:text-yellow-400' };
    }
  };

  const getPermissionHelp = () => {
    if (permission === 'denied') {
      return (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">
            通知权限已被拒绝，请按以下步骤手动开启：
          </p>
          <ol className="text-xs text-red-600 dark:text-red-400 space-y-1 ml-4">
            <li>1. 点击地址栏左侧的锁图标</li>
            <li>2. 找到"通知"选项</li>
            <li>3. 选择"允许"</li>
            <li>4. 刷新页面</li>
          </ol>
        </div>
      );
    }
    return null;
  };

  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            通知设置
          </h2>
          <div className="text-center py-8">
            <i className="fa-solid fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              您的浏览器不支持通知功能
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              请使用现代浏览器（Chrome、Firefox、Safari、Edge）
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getPermissionStatusText();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            通知设置
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-times text-gray-500"></i>
          </button>
        </div>

        <div className="space-y-4">
          {/* 通知权限状态 */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">
                  通知权限
                </h3>
                <p className={`text-sm ${statusInfo.color}`}>
                  {statusInfo.text}
                </p>
              </div>
              {permission !== 'granted' && (
                <button
                  onClick={handleEnableNotifications}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  {isLoading ? '请求中...' : '开启通知'}
                </button>
              )}
            </div>
            {getPermissionHelp()}
          </div>

          {/* 测试通知 */}
          {permission === 'granted' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    测试通知
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    确认通知功能正常工作
                  </p>
                </div>
                <NotificationTest />
              </div>
            </div>
          )}

          {/* 通知类型设置 */}
          {permission === 'granted' && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
                提醒类型
              </h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">
                    任务提醒
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    任务开始前15分钟提醒
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.taskReminders}
                    onChange={(e) => updateSettings({ taskReminders: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">
                    每日目标
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    晚上提醒未完成的任务
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.dailyGoals}
                    onChange={(e) => updateSettings({ dailyGoals: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">
                    学习休息
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    每45分钟提醒休息
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.studyBreaks}
                    onChange={(e) => updateSettings({ studyBreaks: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">
                    复习提醒
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    基于遗忘曲线的复习提醒
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reviewReminders}
                    onChange={(e) => updateSettings({ reviewReminders: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
