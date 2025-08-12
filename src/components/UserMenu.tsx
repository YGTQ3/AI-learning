import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:block text-gray-700 dark:text-gray-300">{user.username}</span>
        <i className={`fa-solid fa-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          
          <button
            onClick={() => {
              setIsOpen(false);
              // TODO: 实现个人资料编辑
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <i className="fa-regular fa-user"></i>
            个人资料
          </button>
          
          <button
            onClick={() => {
              setIsOpen(false);
              // TODO: 实现设置页面
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <i className="fa-solid fa-cog"></i>
            设置
          </button>
          
          <hr className="my-1 border-gray-200 dark:border-gray-700" />
          
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <i className="fa-solid fa-sign-out-alt"></i>
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}