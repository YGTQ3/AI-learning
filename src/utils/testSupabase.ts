import { supabase } from '@/lib/supabase';

export async function testSupabaseConnection() {
  try {
    // 测试数据库连接
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase 连接失败:', error);
      return false;
    }

    console.log('Supabase 连接成功:', data);
    return true;
  } catch (error) {
    console.error('Supabase 测试失败:', error);
    return false;
  }
}

// 在开发环境中调用测试
if (import.meta.env.DEV) {
  testSupabaseConnection();
}