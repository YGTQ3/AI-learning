import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import App from "./App.tsx";
import "./index.css";

// 导入调试工具
import { debugAuthIssues } from './utils/debugAuth';
import { testShareDatabase } from '@/utils/debugShare';

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  
  if (!savedTheme) {
    localStorage.setItem('theme', theme);
  }
};

initTheme();

// 在开发环境中运行调试
if (import.meta.env.DEV) {
  // 将调试函数暴露到全局
  (window as any).debugAuth = debugAuthIssues;
  (window as any).testShareDatabase = testShareDatabase;
  
  // 自动运行一次调试
  setTimeout(() => {
    console.log('🔍 运行 Supabase 调试检查...');
    debugAuthIssues();
  }, 1000);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        theme="system"
        position="top-right"
        richColors
      />
    </BrowserRouter>
  </StrictMode>
);



