import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
        >
          <i className="fa-solid fa-times"></i>
        </button>

        {mode === 'login' ? (
          <LoginForm
            onSwitchToRegister={() => setMode('register')}
            onClose={onClose}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setMode('login')}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}