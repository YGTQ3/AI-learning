import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { TaskItem } from '@/components/TaskItem';
import { TaskForm } from '@/components/TaskForm';
import { UserMenu } from '@/components/UserMenu';
import { AuthModal } from '@/components/AuthModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationSettings } from '@/components/NotificationSettings';
import { useReminders } from '@/hooks/useReminders';

export default function Schedule() {
  const { isAuthenticated } = useAuth();
  const { getTasksByDate, tasks } = useSchedule();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  useReminders();
  
  const todayTasks = getTasksByDate(selectedDate);

  // 获取本周任务统计
  const getWeekStats = () => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekTasks = tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= weekStart && taskDate <= new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    });
    
    const completed = weekTasks.filter(task => task.completed).length;
    return { total: weekTasks.length, completed };
  };

  const weekStats = getWeekStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              AI学习助手
            </Link>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                首页
              </Link>
              <Link 
                to="/resources" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                资源库
              </Link>
              <Link 
                to="/schedule" 
                className="text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 dark:border-blue-400 pb-1"
              >
                学习计划
              </Link>
              <Link 
                to="/share" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                社交分享
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setShowNotificationSettings(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="通知设置"
            >
              <i className="fa-regular fa-bell"></i>
            </button>
            
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Page Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">学习计划</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                管理您的学习任务和进度
              </p>
            </div>
            
            {isAuthenticated && (
              <button
                onClick={() => setShowTaskForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-plus"></i>
                添加任务
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isAuthenticated ? (
          <>
            {/* Stats Section */}
            <section className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <i className="fa-solid fa-tasks text-blue-600 dark:text-blue-400 text-xl"></i>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{todayTasks.length}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">今日任务</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <i className="fa-solid fa-calendar-week text-green-600 dark:text-green-400 text-xl"></i>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{weekStats.total}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">本周任务</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <i className="fa-solid fa-chart-line text-purple-600 dark:text-purple-400 text-xl"></i>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {weekStats.total > 0 ? Math.round((weekStats.completed / weekStats.total) * 100) : 0}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">完成率</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Schedule Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">学习安排</h2>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  <i className="fa-solid fa-plus"></i>
                  添加任务
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                {todayTasks.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {todayTasks
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((task) => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <i className="fa-regular fa-calendar-xmark text-4xl mb-4"></i>
                    <p>这一天还没有安排任务</p>
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      添加第一个任务
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          /* Guest Content */
          <section className="text-center py-12">
            <div className="max-w-md mx-auto">
              <i className="fa-solid fa-calendar-alt text-6xl text-blue-600 dark:text-blue-400 mb-6"></i>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">管理您的学习计划</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                登录以创建和管理您的个性化学习计划，跟踪学习进度。
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
                >
                  立即开始
                </button>
                <div className="pt-4">
                  <Link
                    to="/resources"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <i className="fa-solid fa-book"></i>
                    先浏览学习资源
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Task Form Modal */}
      {showTaskForm && isAuthenticated && (
        <TaskForm onClose={() => setShowTaskForm(false)} />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
      )}
    </div>
  );
}



