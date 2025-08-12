import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterFormData } from '@/types/auth';
import { toast } from 'sonner';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onClose: () => void;
}

export function RegisterForm({ onSwitchToLogin, onClose }: RegisterFormProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error('请输入用户名');
      return false;
    }
    
    if (formData.username.length < 2) {
      toast.error('用户名至少需要2个字符');
      return false;
    }

    if (!formData.email) {
      toast.error('请输入邮箱地址');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('请输入有效的邮箱地址');
      return false;
    }

    if (!formData.password) {
      toast.error('请输入密码');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('密码至少需要6个字符');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const success = await register(formData.username, formData.email, formData.password);
    setIsLoading(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">创建账户</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">加入AI学习助手，开始您的学习之旅</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            用户名
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="输入您的用户名"
            required
          />
        </div>

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
              placeholder="输入密码（至少6位）"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            确认密码
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="再次输入密码"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <i className="fa-solid fa-spinner fa-spin"></i>}
          {isLoading ? '注册中...' : '注册'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          已有账户？
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
          >
            立即登录
          </button>
        </p>
      </div>
    </div>
  );
}