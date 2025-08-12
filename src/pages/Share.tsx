import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useResource } from '@/contexts/ResourceContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useShare } from '@/contexts/ShareContext';
import { UserMenu } from '@/components/UserMenu';
import { AuthModal } from '@/components/AuthModal';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';

interface SharePost {
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

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

export default function Share() {
  const { user, isAuthenticated } = useAuth();
  const { resources } = useResource();
  const { tasks } = useSchedule();
  const { posts, isLoading, createPost, addComment, toggleLike, deletePost, deleteComment } = useShare(); // 添加删除功能
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [shareType, setShareType] = useState<'progress' | 'resource' | 'achievement'>('progress');

  // 获取用户学习统计
  const getUserStats = () => {
    if (!isAuthenticated) return null;
    
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const favoriteResources = resources.filter(resource => resource.isFavorite).length;
    
    return {
      completedTasks,
      totalTasks,
      favoriteResources,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const stats = getUserStats();

  // 发布新动态
  const handlePost = async () => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }

    if (!newPost.trim()) {
      toast.error('请输入分享内容');
      return;
    }

    await createPost(newPost, shareType, shareType === 'progress' ? stats : undefined);
    setNewPost('');
  };

  // 点赞功能
  const handleLike = async (postId: string) => {
    await toggleLike(postId);
  };

  // 添加评论
  const handleComment = async (postId: string, content: string) => {
    await addComment(postId, content);
  };

  // 删除动态
  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
  };

  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              AI学习助手
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                首页
              </Link>
              <Link 
                to="/resources" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                资源库
              </Link>
              <Link 
                to="/schedule" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                学习计划
              </Link>
              <Link 
                to="/share" 
                className="text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 dark:border-blue-400 pb-1"
              >
                社交分享
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <i className="fa-regular fa-bell"></i>
            </button>
            
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Page Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">社交分享</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                分享学习进度，与同学交流心得
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {isAuthenticated ? (
            <>
              {/* 发布新动态 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="mb-3">
                      <select
                        value={shareType}
                        onChange={(e) => setShareType(e.target.value as any)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                      >
                        <option value="progress">学习进度</option>
                        <option value="resource">资源分享</option>
                        <option value="achievement">学习成就</option>
                      </select>
                    </div>
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="分享你的学习心得..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                    {shareType === 'progress' && stats && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          📊 当前进度：完成 {stats.completedTasks}/{stats.totalTasks} 个任务 ({stats.completionRate}%)
                        </p>
                      </div>
                    )}
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={handlePost}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        发布
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 动态列表 */}
              <div className="space-y-6">
                {posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onLike={handleLike}
                    onComment={handleComment}
                    onDeletePost={handleDeletePost} // 添加删除动态
                    onDeleteComment={handleDeleteComment} // 添加删除评论
                    currentUser={user}
                  />
                ))}
              </div>
            </>
          ) : (
            /* 未登录状态 */
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <i className="fa-solid fa-users text-6xl text-blue-600 dark:text-blue-400 mb-6"></i>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">加入学习社区</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  登录后可以分享学习进度，与其他学习者交流心得，获得学习动力。
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
                >
                  立即加入
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

// 动态卡片组件
function PostCard({ 
  post, 
  onLike, 
  onComment, 
  onDeletePost, 
  onDeleteComment, 
  currentUser 
}: { 
  post: SharePost; 
  onLike: (id: string) => void;
  onComment: (id: string, content: string) => void;
  onDeletePost: (id: string) => void;
  onDeleteComment: (id: string) => void;
  currentUser: any;
}) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'progress': return 'fa-chart-line';
      case 'resource': return 'fa-share';
      case 'achievement': return 'fa-trophy';
      default: return 'fa-comment';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'progress': return 'text-blue-600 dark:text-blue-400';
      case 'resource': return 'text-green-600 dark:text-green-400';
      case 'achievement': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment('');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
      {/* 用户信息 */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {post.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">{post.username}</h3>
              <i className={`fa-solid ${getTypeIcon(post.type)} ${getTypeColor(post.type)} text-sm`}></i>
              <span className="text-sm text-gray-500 dark:text-gray-400">{formatTime(post.createdAt)}</span>
            </div>
            {/* 删除按钮 - 只有作者可以看到 */}
            {currentUser && currentUser.id === post.userId && (
              <button
                onClick={() => onDeletePost(post.id)}
                className="text-red-500 hover:text-red-700 p-1"
                title="删除动态"
              >
                <i className="fa-solid fa-trash text-sm"></i>
              </button>
            )}
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-2">{post.content}</p>

          {/* 进度数据显示 */}
          {post.type === 'progress' && post.data && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                📊 完成进度：{post.data.completedTasks}/{post.data.totalTasks} 个任务 ({post.data.completionRate}%)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 互动按钮 */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
        >
          <i className="fa-solid fa-heart"></i>
          <span>{post.likes}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
        >
          <i className="fa-solid fa-comment"></i>
          <span>{post.comments.length}</span>
        </button>
      </div>

      {/* 评论区域 */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* 评论列表 */}
          <div className="space-y-3 mb-4">
            {post.comments.map(comment => (
              <div key={comment.id} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {comment.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{comment.username}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(comment.createdAt)}</span>
                    </div>
                    {/* 删除评论按钮 - 只有评论作者可以看到 */}
                    {currentUser && currentUser.id === comment.userId && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="删除评论"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 添加评论 */}
          {currentUser && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="写个评论..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                />
                <button
                  onClick={handleSubmitComment}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  发送
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

