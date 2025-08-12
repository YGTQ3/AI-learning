import { supabase } from '@/lib/supabase';

export async function testShareDatabase() {
  console.log('=== 测试分享功能数据库 ===');
  
  try {
    // 测试 share_posts 表
    console.log('测试 share_posts 表...');
    const { data: posts, error: postsError } = await supabase
      .from('share_posts')
      .select('*')
      .limit(1);
    
    if (postsError) {
      console.error('❌ share_posts 表错误:', postsError);
    } else {
      console.log('✅ share_posts 表连接成功:', posts);
    }

    // 测试 share_comments 表
    console.log('测试 share_comments 表...');
    const { data: comments, error: commentsError } = await supabase
      .from('share_comments')
      .select('*')
      .limit(1);
    
    if (commentsError) {
      console.error('❌ share_comments 表错误:', commentsError);
    } else {
      console.log('✅ share_comments 表连接成功:', comments);
    }

    // 测试 share_likes 表
    console.log('测试 share_likes 表...');
    const { data: likes, error: likesError } = await supabase
      .from('share_likes')
      .select('*')
      .limit(1);
    
    if (likesError) {
      console.error('❌ share_likes 表错误:', likesError);
    } else {
      console.log('✅ share_likes 表连接成功:', likes);
    }

    // 测试创建动态
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      console.log('测试创建动态...');
      const { data: newPost, error: createError } = await supabase
        .from('share_posts')
        .insert({
          user_id: user.user.id,
          username: user.user.email?.split('@')[0] || 'testuser',
          content: '测试动态',
          type: 'progress'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ 创建动态失败:', createError);
      } else {
        console.log('✅ 创建动态成功:', newPost);
        
        // 删除测试动态
        await supabase.from('share_posts').delete().eq('id', newPost.id);
        console.log('🗑️ 测试动态已删除');
      }
    } else {
      console.log('⚪ 未登录，跳过创建测试');
    }

  } catch (error) {
    console.error('❌ 测试过程中发生异常:', error);
  }
}

// 暴露到全局
if (typeof window !== 'undefined') {
  (window as any).testShareDatabase = testShareDatabase;
}