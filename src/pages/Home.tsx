import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { TaskItem } from '@/components/TaskItem';
import { TaskForm } from '@/components/TaskForm';
import { AuthModal } from '@/components/AuthModal';
import { UserMenu } from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationSettings } from '@/components/NotificationSettings';
import { useReminders } from '@/hooks/useReminders';
import { useResource } from '@/contexts/ResourceContext';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { getTasksByDate } = useSchedule();
  const { resources } = useResource(); // 使用真实的资源数据
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  
  const todayTasks = getTasksByDate(selectedDate);
  const completedTasks = todayTasks.filter(task => task.completed);

  // 初始化提醒系统
  useReminders();

  // Social sharing function
  const shareResource = (resourceId: number, title: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'AI学习助手',
        text: `查看这个资源：${title}`,
        url: window.location.href,
      }).catch((error) => console.log('分享错误:', error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('链接已复制到剪贴板！'))
        .catch(err => console.error('复制失败: ', err));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">AI学习助手</h1>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className="text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 dark:border-blue-400 pb-1"
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
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-2">
              {isAuthenticated ? `欢迎回来，${user?.username}！` : '欢迎使用AI学习助手！'}
            </h2>
            <p className="opacity-90 mb-4">
              {isAuthenticated 
                ? '继续您的学习之旅，跟踪进度并发现新资源。'
                : '请登录以开始您的个性化学习之旅。'
              }
            </p>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/resources"
                className="inline-flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-book"></i>
                浏览资源库
              </Link>
              {isAuthenticated && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="inline-flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <i className="fa-solid fa-plus"></i>
                  添加学习任务
                </button>
              )}
            </div>
          </div>
        </section>

        {isAuthenticated ? (
          <>
            {/* Quick Stats */}
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
                
                <Link to="/resources" className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <i className="fa-solid fa-book text-green-600 dark:text-green-400 text-xl"></i>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{resources.length}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">学习资源</p>
                    </div>
                  </div>
                </Link>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <i className="fa-solid fa-chart-line text-purple-600 dark:text-purple-400 text-xl"></i>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">完成进度</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Today's Tasks */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">今日任务</h2>
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <i className="fa-solid fa-plus"></i>
                    添加任务
                  </button>
                </div>
              </div>

              {todayTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todayTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
                  <i className="fa-solid fa-calendar-check text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                  <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {selectedDate === new Date().toISOString().split('T')[0] ? '今天还没有任务' : '这天没有安排任务'}
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500 mb-6">
                    点击添加任务开始规划你的学习时间
                  </p>
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    添加第一个任务
                  </button>
                </div>
              )}
            </section>

            {/* Learning Resources */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">学习资源</h2>
                <Link 
                  to="/resources" 
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  查看全部
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
              
              {resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {resources.slice(0, 3).map((resource) => (
                    <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                        <i className="fa-solid fa-book text-4xl text-white opacity-70"></i>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                            {resource.category}
                          </span>
                          <div className="flex items-center text-yellow-500 text-sm">
                            <i className="fa-solid fa-star mr-1"></i>
                            <span>{resource.rating}</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">{resource.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{resource.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
                  <i className="fa-solid fa-book text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                  <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
                    还没有学习资源
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500 mb-6">
                    添加一些学习资源来丰富你的知识库
                  </p>
                  <Link
                    to="/resources"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors inline-block"
                  >
                    添加资源
                  </Link>
                </div>
              )}
            </section>
          </>
        ) : (
          /* Guest Content */
          <section className="text-center py-12">
            <div className="max-w-md mx-auto">
              <i className="fa-solid fa-graduation-cap text-6xl text-blue-600 dark:text-blue-400 mb-6"></i>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">开始您的学习之旅</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                登录或注册以访问个性化学习计划、进度跟踪和丰富的学习资源。
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
                >
                  立即开始
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  已有账户？
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                  >
                    点击登录
                  </button>
                </p>
                <div className="pt-4">
                  <Link
                    to="/resources"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <i className="fa-solid fa-book"></i>
                    先浏览资源库
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>AI学习助手 © {new Date().getFullYear()}</p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {showTaskForm && isAuthenticated && (
        <TaskForm onClose={() => setShowTaskForm(false)} />
      )}

      {showNotificationSettings && (
        <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
      )}
    </div>
  );
}





