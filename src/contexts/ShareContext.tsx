import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { shareSync, SharePost } from '@/services/shareSync';
import { toast } from 'sonner';

interface ShareContextType {
  posts: SharePost[];
  isLoading: boolean;
  createPost: (content: string, type: 'progress' | 'resource' | 'achievement', data?: any) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>; // 添加删除动态
  deleteComment: (commentId: string) => Promise<void>; // 添加删除评论
  refreshPosts: () => Promise<void>;
}

const ShareContext = createContext<ShareContextType | undefined>(undefined);

export const useShare = () => {
  const context = useContext(ShareContext);
  if (!context) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  return context;
};

export function ShareProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<SharePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // 加载分享动态
  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const cloudPosts = await shareSync.fetchPosts();
      setPosts(cloudPosts);
    } catch (error) {
      console.error('加载分享动态失败:', error);
      // 降级到本地存储
      const savedPosts = localStorage.getItem('sharePosts');
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadPosts();
  }, []);

  // 保存到本地存储
  useEffect(() => {
    localStorage.setItem('sharePosts', JSON.stringify(posts));
  }, [posts]);

  // 创建新动态（乐观更新）
  const createPost = useCallback(async (
    content: string,
    type: SharePost['type'],
    data?: any
  ): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast.error('请先登录');
      return false;
    }

    // 乐观更新：立即添加到本地状态
    const optimisticPost: SharePost = {
      id: `temp-${Date.now()}`,
      userId: user.id,
      username: user.username,
      content,
      type,
      data,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      isLiked: false,
    };

    setPosts(prev => [optimisticPost, ...prev]);

    try {
      const result = await shareSync.createPost(user.id, user.username, content, type, data);

      if (result.success && result.data) {
        // 替换临时动态为真实动态
        setPosts(prev => prev.map(post =>
          post.id === optimisticPost.id ? result.data! : post
        ));
        toast.success(result.message || '分享成功！');
        return true;
      } else {
        // 移除失败的临时动态
        setPosts(prev => prev.filter(post => post.id !== optimisticPost.id));
        toast.error(result.error || '分享失败');
        return false;
      }
    } catch (error) {
      // 移除失败的临时动态
      setPosts(prev => prev.filter(post => post.id !== optimisticPost.id));
      toast.error('分享失败，请稍后重试');
      return false;
    }
  }, [isAuthenticated, user]);

  // 添加评论（乐观更新）
  const addComment = useCallback(async (postId: string, content: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast.error('请先登录');
      return false;
    }

    // 乐观更新：立即添加评论到本地状态
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      postId,
      userId: user.id,
      username: user.username,
      content,
      createdAt: new Date().toISOString(),
    };

    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, optimisticComment] }
        : post
    ));

    try {
      const result = await shareSync.addComment(postId, user.id, user.username, content);

      if (result.success && result.data) {
        // 替换临时评论为真实评论
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id === optimisticComment.id ? result.data! : comment
                )
              }
            : post
        ));
        toast.success(result.message || '评论成功');
        return true;
      } else {
        // 移除失败的临时评论
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, comments: post.comments.filter(comment => comment.id !== optimisticComment.id) }
            : post
        ));
        toast.error(result.error || '评论失败');
        return false;
      }
    } catch (error) {
      // 移除失败的临时评论
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, comments: post.comments.filter(comment => comment.id !== optimisticComment.id) }
          : post
      ));
      toast.error('评论失败，请稍后重试');
      return false;
    }
  }, [isAuthenticated, user]);

  // 点赞（乐观更新）
  const toggleLike = useCallback(async (postId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast.error('请先登录');
      return false;
    }

    // 乐观更新：立即更新本地状态
    const currentPost = posts.find(post => post.id === postId);
    if (!currentPost) return false;

    const wasLiked = currentPost.isLiked;
    const newLikesCount = wasLiked ? currentPost.likes - 1 : currentPost.likes + 1;

    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, isLiked: !wasLiked, likes: newLikesCount }
        : post
    ));

    try {
      const result = await shareSync.toggleLike(postId, user.id);

      if (result.success && result.data) {
        // 更新为服务器返回的真实数据
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, isLiked: result.data!.liked, likes: result.data!.likesCount }
            : post
        ));
        return true;
      } else {
        // 回滚乐观更新
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, isLiked: wasLiked, likes: currentPost.likes }
            : post
        ));
        toast.error(result.error || '操作失败');
        return false;
      }
    } catch (error) {
      // 回滚乐观更新
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, isLiked: wasLiked, likes: currentPost.likes }
          : post
      ));
      toast.error('操作失败，请稍后重试');
      return false;
    }
  }, [isAuthenticated, user, posts]);

  const refreshPosts = useCallback(async () => {
    await loadPosts();
  }, [loadPosts]);

  // 删除动态
  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast.error('请先登录');
      return false;
    }

    if (!confirm('确定要删除这条动态吗？')) {
      return false;
    }

    // 乐观更新：立即从本地状态移除
    const originalPosts = posts;
    setPosts(prev => prev.filter(post => post.id !== postId));

    try {
      const result = await shareSync.deletePost(postId, user.id);

      if (result.success) {
        toast.success(result.message || '动态已删除');
        return true;
      } else {
        // 回滚：恢复动态
        setPosts(originalPosts);
        toast.error(result.error || '删除失败');
        return false;
      }
    } catch (error) {
      // 回滚：恢复动态
      setPosts(originalPosts);
      toast.error('删除失败，请稍后重试');
      return false;
    }
  }, [isAuthenticated, user, posts]);

  // 删除评论
  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast.error('请先登录');
      return false;
    }

    if (!confirm('确定要删除这条评论吗？')) {
      return false;
    }

    // 乐观更新：立即从本地状态移除评论
    const originalPosts = posts;
    setPosts(prev => prev.map(post => ({
      ...post,
      comments: post.comments.filter(comment => comment.id !== commentId)
    })));

    try {
      const result = await shareSync.deleteComment(commentId, user.id);

      if (result.success) {
        toast.success(result.message || '评论已删除');
        return true;
      } else {
        // 回滚：恢复评论
        setPosts(originalPosts);
        toast.error(result.error || '删除失败');
        return false;
      }
    } catch (error) {
      // 回滚：恢复评论
      setPosts(originalPosts);
      toast.error('删除失败，请稍后重试');
      return false;
    }
  }, [isAuthenticated, user, posts]);

  const value = {
    posts,
    isLoading,
    createPost,
    addComment,
    toggleLike,
    deletePost, // 添加到 value
    deleteComment, // 添加到 value
    refreshPosts,
  };

  return (
    <ShareContext.Provider value={value}>
      {children}
    </ShareContext.Provider>
  );
}
