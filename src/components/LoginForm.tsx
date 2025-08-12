import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginFormData } from '@/types/auth';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onClose: () => void;
}

export function LoginForm({ onSwitchToRegister, onClose }: LoginFormProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    setIsLoading(true);
    const success = await login(formData.email, formData.password);
    setIsLoading(false);
    
    if (success) {
      onClose();
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    const success = await login('demo@example.com', 'demo123');
    setIsLoading(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">登录账户</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">欢迎回到AI学习助手</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            邮箱地址
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="输入您的邮箱"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            密码
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="输入您的密码"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <i className="fa-solid fa-spinner fa-spin"></i>}
          {isLoading ? '登录中...' : '登录'}
        </button>
      </form>

      <div className="mt-4">
        <button
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors"
        >
          使用演示账户登录
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          还没有账户？
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
          >
            立即注册
          </button>
        </p>
      </div>
    </div>
  );
}