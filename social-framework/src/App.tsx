import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/contexts';
import { Layout } from '@/components/layout';

// 页面组件
import HomePage from '@/pages/HomePage';
import SocialPage from '@/pages/SocialPage';
import LearningPage from '@/pages/LearningPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';

// 认证相关页面
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* 主要页面 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/profile/:userId?" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* 认证页面 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* 404页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
