import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      {isDark ? (
        <i className="fa-solid fa-sun text-yellow-500"></i>
      ) : (
        <i className="fa-solid fa-moon text-gray-600"></i>
      )}
    </button>
  );
}