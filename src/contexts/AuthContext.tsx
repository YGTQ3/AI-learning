import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  supabaseUser: SupabaseUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 监听认证状态变化
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        
        if (session?.user) {
          setSupabaseUser(session.user);
          
          // 获取用户详细信息
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData && !error) {
            setUser({
              id: userData.id,
              username: userData.username,
              email: userData.email,
              createdAt: userData.created_at,
            });
            setIsAuthenticated(true);
          }
        } else {
          setUser(null);
          setSupabaseUser(null);
          setIsAuthenticated(false);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message === 'Invalid login credentials' 
          ? '邮箱或密码错误' 
          : '登录失败，请重试'
        );
        return false;
      }

      if (data.user) {
        toast.success('登录成功！');
        return true;
      }

      return false;
    } catch (error) {
      toast.error('登录失败，请重试');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // 1. 注册用户
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        toast.error(authError.message === 'User already registered' 
          ? '该邮箱已被注册' 
          : '注册失败，请重试'
        );
        return false;
      }

      if (authData.user) {
        // 2. 使用安全函数创建用户资料
        const { error: profileError } = await supabase.rpc('create_user_profile', {
          user_id: authData.user.id,
          user_email: email,
          user_name: username
        });

        if (profileError) {
          console.error('创建用户资料错误:', profileError);
          toast.error('创建用户资料失败: ' + profileError.message);
          return false;
        }

        // 3. 创建默认设置
        await supabase
          .from('user_settings')
          .insert({
            user_id: authData.user.id,
            theme: 'light',
            notifications: {
              enabled: false,
              taskReminders: true,
              dailyGoals: true,
              studyBreaks: true,
              reviewReminders: true,
            },
          });

        toast.success('注册成功！请检查邮箱验证链接');
        return true;
      }

      return false;
    } catch (error) {
      toast.error('注册失败，请重试');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('退出失败');
      } else {
        toast.success('已安全退出');
      }
    } catch (error) {
      toast.error('退出失败');
    }
  };

  const value = {
    user,
    supabaseUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


