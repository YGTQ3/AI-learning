import { supabase } from '@/lib/supabase';

// 生成随机 UUID 的兼容函数
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // 备用方案：生成简单的随机 ID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function debugAuthIssues() {
  console.log('=== Supabase 调试信息 ===');
  
  // 1. 检查环境变量
  console.log('环境变量检查:');
  console.log('- VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || '❌ 未设置');
  console.log('- VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置');
  
  // 2. 检查 Supabase 客户端
  console.log('\nSupabase 客户端检查:');
  try {
    console.log('- 客户端初始化:', supabase ? '✅ 成功' : '❌ 失败');
  } catch (error) {
    console.error('- 客户端初始化:', '❌ 异常', error);
  }

  // 3. 检查数据库连接
  console.log('\n数据库连接检查:');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('- 数据库连接:', '❌ 失败', error.message);
      console.error('- 错误详情:', error);
    } else {
      console.log('- 数据库连接:', '✅ 成功');
    }
  } catch (err) {
    console.error('- 数据库连接:', '❌ 异常', err);
  }

  // 4. 检查当前会话
  console.log('\n用户会话检查:');
  try {
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('- 会话获取:', '❌ 失败', sessionError.message);
    } else {
      console.log('- 会话状态:', session?.session?.user ? '✅ 已登录' : '⚪ 未登录');
      if (session?.session?.user) {
        console.log('- 用户邮箱:', session.session.user.email);
        console.log('- 用户ID:', session.session.user.id);
      }
    }
  } catch (err) {
    console.error('- 会话检查:', '❌ 异常', err);
  }

  // 5. 检查用户表结构
  console.log('\n用户表检查:');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('- 用户表查询:', '❌ 失败', error.message);
      console.error('- 可能原因: 表不存在或权限不足');
    } else {
      console.log('- 用户表查询:', '✅ 成功');
      console.log('- 表结构预览:', data);
    }
  } catch (err) {
    console.error('- 用户表查询:', '❌ 异常', err);
  }

  // 6. 检查认证配置
  console.log('\n认证配置检查:');
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError && authError.message !== 'Auth session missing!') {
      console.error('- 认证服务:', '❌ 异常', authError.message);
    } else {
      console.log('- 认证服务:', '✅ 正常');
    }
  } catch (err) {
    console.error('- 认证服务:', '❌ 异常', err);
  }

  // 7. 测试基本操作权限
  console.log('\n权限检查:');
  try {
    // 测试读取权限
    const { data: readTest, error: readError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    console.log('- 读取权限:', readError ? '❌ 无权限' : '✅ 有权限');
    
    // 获取当前认证用户来测试写入
    const { data: authUser } = await supabase.auth.getUser();
    
    if (authUser.user) {
      // 如果用户已登录，测试写入权限
      console.log('- 检测到已登录用户，测试写入权限...');
      const { error: writeError } = await supabase
        .from('users')
        .upsert({
          id: authUser.user.id,
          email: authUser.user.email || 'test@example.com',
          username: 'testuser'
        })
        .select();
      
      if (writeError) {
        console.log('- 写入权限:', '❌ 无权限或其他限制');
        console.log('- 写入错误:', writeError.message);
      } else {
        console.log('- 写入权限:', '✅ 有权限');
      }
    } else {
      // 如果用户未登录，跳过写入测试
      console.log('- 写入权限:', '⚪ 跳过测试（需要登录用户）');
      console.log('- 原因: users 表的 id 必须是有效的认证用户 ID');
    }
  } catch (err) {
    console.error('- 权限检查:', '❌ 异常', err);
  }

  console.log('\n=== 调试检查完成 ===');
  console.log('💡 提示: 如果发现问题，请检查:');
  console.log('1. .env 文件中的环境变量');
  console.log('2. Supabase 项目设置');
  console.log('3. 数据库表和 RLS 策略');
  console.log('4. 网络连接');
}

// 测试注册功能
export async function testRegistration() {
  console.log('\n=== 测试注册功能 ===');
  
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'test123456';
  const testUsername = `testuser${Date.now()}`;
  
  console.log('测试数据:');
  console.log('- 邮箱:', testEmail);
  console.log('- 密码:', testPassword);
  console.log('- 用户名:', testUsername);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { username: testUsername }
      }
    });
    
    if (error) {
      console.error('❌ 注册失败:', error.message);
      console.error('错误详情:', error);
      return false;
    }
    
    console.log('✅ 注册成功!');
    console.log('用户数据:', data.user);
    
    // 检查用户是否需要邮箱验证
    if (data.user && !data.user.email_confirmed_at) {
      console.log('📧 需要邮箱验证');
    }
    
    return true;
  } catch (err) {
    console.error('❌ 注册异常:', err);
    return false;
  }
}

// 检查必需的 hooks 和 contexts
export function checkDependencies() {
  console.log('\n=== 依赖检查 ===');
  
  // 这里可以添加对必需文件的检查
  const requiredFiles = [
    'contexts/AuthContext',
    'hooks/useSupabaseSync',
    'components/SyncStatusBar'
  ];
  
  requiredFiles.forEach(file => {
    try {
      // 这里只是示例，实际检查需要根据具体情况
      console.log(`- ${file}: 需要手动检查`);
    } catch (err) {
      console.error(`- ${file}: ❌ 缺失`);
    }
  });
}





