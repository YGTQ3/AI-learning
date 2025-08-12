// 社交功能相关类型定义

export interface Post {
  id: string;
  authorId: string;
  author: PostAuthor;
  content: string;
  type: PostType;
  attachments?: PostAttachment[];
  tags?: string[];
  visibility: PostVisibility;
  createdAt: string;
  updatedAt?: string;
  stats: PostStats;
  userInteraction?: UserPostInteraction;
  metadata?: PostMetadata;
}

export interface PostAuthor {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  level: number;
  isVerified?: boolean;
}

export type PostType = 
  | 'text'           // 纯文本动态
  | 'progress'       // 学习进度分享
  | 'resource'       // 资源分享
  | 'achievement'    // 成就展示
  | 'question'       // 问题求助
  | 'discussion'     // 讨论话题
  | 'poll';          // 投票

export type PostVisibility = 'public' | 'friends' | 'private';

export interface PostAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'link';
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  size?: number;
  duration?: number; // 音视频时长（秒）
}

export interface PostStats {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
}

export interface UserPostInteraction {
  isLiked: boolean;
  isBookmarked: boolean;
  isShared: boolean;
  likedAt?: string;
  bookmarkedAt?: string;
  sharedAt?: string;
}

export interface PostMetadata {
  learningData?: LearningPostData;
  resourceData?: ResourcePostData;
  achievementData?: AchievementPostData;
  pollData?: PollPostData;
}

export interface LearningPostData {
  subject: string;
  topic: string;
  duration: number; // 学习时长（分钟）
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number; // 进度百分比
}

export interface ResourcePostData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: number;
  resourceUrl?: string;
}

export interface AchievementPostData {
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

export interface PollPostData {
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  expiresAt?: string;
  totalVotes: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
  isSelected?: boolean;
}

// 评论系统
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: CommentAuthor;
  content: string;
  parentId?: string; // 回复评论的ID
  replies?: Comment[];
  createdAt: string;
  updatedAt?: string;
  stats: CommentStats;
  userInteraction?: UserCommentInteraction;
}

export interface CommentAuthor {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  level: number;
}

export interface CommentStats {
  likesCount: number;
  repliesCount: number;
}

export interface UserCommentInteraction {
  isLiked: boolean;
  likedAt?: string;
}

// 点赞系统
export interface Like {
  id: string;
  userId: string;
  targetId: string; // 可以是post或comment的ID
  targetType: 'post' | 'comment';
  createdAt: string;
}

// 社交上下文类型
export interface SocialContextType {
  // 动态相关
  posts: Post[];
  isLoadingPosts: boolean;
  hasMorePosts: boolean;
  
  // 操作方法
  createPost: (data: CreatePostData) => Promise<boolean>;
  updatePost: (postId: string, updates: Partial<Post>) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
  
  // 互动方法
  toggleLike: (targetId: string, targetType: 'post' | 'comment') => Promise<boolean>;
  addComment: (postId: string, content: string, parentId?: string) => Promise<boolean>;
  updateComment: (commentId: string, content: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
  
  // 数据加载
  loadPosts: (options?: LoadPostsOptions) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  
  // 错误处理
  error: string | null;
  clearError: () => void;
}

export interface CreatePostData {
  content: string;
  type: PostType;
  attachments?: File[];
  tags?: string[];
  visibility?: PostVisibility;
  metadata?: PostMetadata;
}

export interface LoadPostsOptions {
  userId?: string;
  type?: PostType;
  tags?: string[];
  sortBy?: 'newest' | 'popular' | 'trending';
  limit?: number;
  offset?: number;
}

// 话题标签
export interface Tag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  postsCount: number;
  followersCount: number;
  isFollowing?: boolean;
  createdAt: string;
}

// 书签收藏
export interface Bookmark {
  id: string;
  userId: string;
  postId: string;
  folderId?: string;
  createdAt: string;
}

export interface BookmarkFolder {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  bookmarksCount: number;
  createdAt: string;
  updatedAt?: string;
}
