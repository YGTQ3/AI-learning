import { supabase } from '@/lib/supabase';

export interface SharePost {
  id: string;
  userId: string;
  username: string;
  content: string;
  type: 'progress' | 'resource' | 'achievement';
  data?: any;
  createdAt: string;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

export class ShareSyncService {
  // 获取所有分享动态
  async fetchPosts(): Promise<SharePost[]> {
    try {
      console.log('开始获取分享动态...');
      
      const { data: posts, error } = await supabase
        .from('share_posts')
        .select(`
          *,
          share_comments (
            id,
            user_id,
            username,
            content,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      console.log('数据库查询结果:', { posts, error });

      if (error) {
        console.error('数据库查询错误:', error);
        throw error;
      }

      // 获取点赞数
      const postsWithLikes = await Promise.all(
        (posts || []).map(async (post) => {
          const { count } = await supabase
            .from('share_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          return {
            id: post.id,
            userId: post.user_id,
            username: post.username,
            content: post.content,
            type: post.type,
            data: post.data,
            createdAt: post.created_at,
            likes: count || 0,
            comments: post.share_comments?.map((comment: any) => ({
              id: comment.id,
              userId: comment.user_id,
              username: comment.username,
              content: comment.content,
              createdAt: comment.created_at,
            })) || [],
          };
        })
      );

      console.log('处理后的动态:', postsWithLikes);
      return postsWithLikes;
    } catch (error) {
      console.error('获取分享动态失败:', error);
      return [];
    }
  }

  // 创建新动态
  async createPost(userId: string, username: string, content: string, type: string, data?: any) {
    try {
      const { data: result, error } = await supabase
        .from('share_posts')
        .insert({
          user_id: userId,
          username,
          content,
          type,
          data,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error('创建动态失败:', error);
      return { success: false, error };
    }
  }

  // 添加评论
  async addComment(postId: string, userId: string, username: string, content: string) {
    try {
      const { data, error } = await supabase
        .from('share_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          username,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('添加评论失败:', error);
      return { success: false, error };
    }
  }

  // 点赞/取消点赞
  async toggleLike(postId: string, userId: string) {
    try {
      // 检查是否已点赞
      const { data: existingLike } = await supabase
        .from('share_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // 取消点赞
        const { error } = await supabase
          .from('share_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) throw error;
        return { success: true, liked: false };
      } else {
        // 添加点赞
        const { error } = await supabase
          .from('share_likes')
          .insert({
            post_id: postId,
            user_id: userId,
          });

        if (error) throw error;
        return { success: true, liked: true };
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      return { success: false, error };
    }
  }

  // 删除动态
  async deletePost(postId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('share_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId); // 确保只能删除自己的动态

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('删除动态失败:', error);
      return { success: false, error };
    }
  }

  // 删除评论
  async deleteComment(commentId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('share_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId); // 确保只能删除自己的评论

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('删除评论失败:', error);
      return { success: false, error };
    }
  }
}

export const shareSync = new ShareSyncService();



