import { useState } from 'react';
import { debugAuthIssues, testRegistration, testLogin } from '@/utils/debugAuth';
import { supabase } from '@/lib/supabase';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [debugOutput, setDebugOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const runDebug = async () => {
    setIsRunning(true);
    setDebugOutput('正在运行调试检查...\n');
    
    // 重定向 console.log 到我们的输出
    const originalLog = console.log;
    const originalError = console.error;
    
    let output = '';
    console.log = (...args) => {
      output += args.join(' ') + '\n';
      originalLog(...args);
    };
    console.error = (...args) => {
      output += 'ERROR: ' + args.join(' ') + '\n';
      originalError(...args);
    };

    try {
      await debugAuthIssues();
      
      // 额外检查
      output += '\n=== 额外检查 ===\n';
      
      // 检查环境变量
      output += `Supabase URL: ${import.meta.env.VITE_SUPABASE_URL || '未设置'}\n`;
      output += `Supabase Key: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? '已设置' : '未设置'}\n`;
      
      // 检查当前用户
      const { data: user } = await supabase.auth.getUser();
      output += `当前用户: ${user.user ? user.user.email : '未登录'}\n`;
      
    } catch (error) {
      output += `调试过程中出错: ${error}\n`;
    } finally {
      // 恢复原始的 console 方法
      console.log = originalLog;
      console.error = originalError;
      
      setDebugOutput(output);
      setIsRunning(false);
    }
  };

  const runTestRegistration = async () => {
    const originalLog = console.log;
    const originalError = console.error;
    
    let output = debugOutput;
    console.log = (...args) => {
      output += args.join(' ') + '\n';
      originalLog(...args);
    };
    console.error = (...args) => {
      output += 'ERROR: ' + args.join(' ') + '\n';
      originalError(...args);
    };

    try {
      await testRegistration();
    } catch (error) {
      output += `测试注册过程中出错: ${error}\n`;
    } finally {
      console.log = originalLog;
      console.error = originalError;
      setDebugOutput(output);
    }
  };

  const showRLSHelp = () => {
    const helpText = `
=== RLS (行级安全) 配置指南 ===

问题: 401 Unauthorized 错误
原因: Supabase 启用了行级安全策略，但没有配置相应的策略

解决方案:

1. 【推荐】配置 RLS 策略:
   - 打开 Supabase 控制台
   - 进入 Authentication > Policies
   - 为 users 表创建策略:
   
   策略名称: "Users can view own profile"
   表: users
   操作: SELECT
   目标角色: authenticated
   USING 表达式: auth.uid() = id
   
   策略名称: "Users can insert own profile"
   表: users  
   操作: INSERT
   目标角色: authenticated
   WITH CHECK 表达式: auth.uid() = id

2. 【临时】禁用 RLS (仅用于测试):
   - 在 SQL 编辑器中运行:
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   
3. 【开发】允许匿名访问 (不推荐生产环境):
   - 创建策略允许 anon 角色访问

4. 确保用户表结构正确:
   CREATE TABLE users (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT NOT NULL,
     username TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

当前建议: 先尝试注册一个用户，然后登录后再测试数据库访问
`;
    
    setDebugOutput(prev => prev + helpText);
  };

  if (!import.meta.env.DEV) return null;

  // 临时隐藏调试面板
  return null;
}



