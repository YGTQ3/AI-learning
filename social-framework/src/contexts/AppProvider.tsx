// 应用根Provider，组合所有Context
import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider } from './NotificationContext';
import { SocialProvider } from './SocialContext';
import { LearningProvider } from './LearningContext';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <LearningProvider>
              <SocialProvider>
                {children}
                <Toaster 
                  position="top-right"
                  richColors
                  closeButton
                  duration={4000}
                />
              </SocialProvider>
            </LearningProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default AppProvider;
