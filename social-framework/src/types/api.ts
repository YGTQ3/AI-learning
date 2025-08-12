// API相关类型定义

import { ApiResponse, PaginationParams, PaginatedResponse } from './common';
import { User, RegisterData, LoginData, AuthResult } from './auth';
import { Post, Comment, CreatePostData, LoadPostsOptions } from './social';
import { LearningTask, LearningResource, StudyPlan, CreateTaskData, CreateResourceData, CreatePlanData } from './learning';

// API客户端接口
export interface ApiClient {
  // 认证相关
  auth: AuthApi;
  // 社交功能
  social: SocialApi;
  // 学习功能
  learning: LearningApi;
  // 用户管理
  users: UsersApi;
  // 文件上传
  files: FilesApi;
  // 通知系统
  notifications: NotificationsApi;
}

// 认证API
export interface AuthApi {
  login(data: LoginData): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  logout(): Promise<ApiResponse>;
  refreshToken(): Promise<AuthResult>;
  forgotPassword(email: string): Promise<ApiResponse>;
  resetPassword(token: string, newPassword: string): Promise<ApiResponse>;
  verifyEmail(token: string): Promise<ApiResponse>;
  resendVerification(email: string): Promise<ApiResponse>;
  getCurrentUser(): Promise<ApiResponse<User>>;
  updateProfile(updates: Partial<User>): Promise<ApiResponse<User>>;
  changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse>;
  deleteAccount(): Promise<ApiResponse>;
}

// 社交功能API
export interface SocialApi {
  // 动态管理
  getPosts(options?: LoadPostsOptions & PaginationParams): Promise<PaginatedResponse<Post>>;
  getPost(postId: string): Promise<ApiResponse<Post>>;
  createPost(data: CreatePostData): Promise<ApiResponse<Post>>;
  updatePost(postId: string, updates: Partial<Post>): Promise<ApiResponse<Post>>;
  deletePost(postId: string): Promise<ApiResponse>;
  
  // 互动功能
  likePost(postId: string): Promise<ApiResponse>;
  unlikePost(postId: string): Promise<ApiResponse>;
  bookmarkPost(postId: string): Promise<ApiResponse>;
  unbookmarkPost(postId: string): Promise<ApiResponse>;
  sharePost(postId: string): Promise<ApiResponse>;
  
  // 评论系统
  getComments(postId: string, params?: PaginationParams): Promise<PaginatedResponse<Comment>>;
  createComment(postId: string, content: string, parentId?: string): Promise<ApiResponse<Comment>>;
  updateComment(commentId: string, content: string): Promise<ApiResponse<Comment>>;
  deleteComment(commentId: string): Promise<ApiResponse>;
  likeComment(commentId: string): Promise<ApiResponse>;
  unlikeComment(commentId: string): Promise<ApiResponse>;
  
  // 关注系统
  followUser(userId: string): Promise<ApiResponse>;
  unfollowUser(userId: string): Promise<ApiResponse>;
  getFollowers(userId: string, params?: PaginationParams): Promise<PaginatedResponse<User>>;
  getFollowing(userId: string, params?: PaginationParams): Promise<PaginatedResponse<User>>;
  
  // 话题标签
  getTags(params?: PaginationParams): Promise<PaginatedResponse<Tag>>;
  getTagPosts(tagName: string, params?: PaginationParams): Promise<PaginatedResponse<Post>>;
  followTag(tagName: string): Promise<ApiResponse>;
  unfollowTag(tagName: string): Promise<ApiResponse>;
}

// 学习功能API
export interface LearningApi {
  // 任务管理
  getTasks(params?: PaginationParams): Promise<PaginatedResponse<LearningTask>>;
  getTask(taskId: string): Promise<ApiResponse<LearningTask>>;
  createTask(data: CreateTaskData): Promise<ApiResponse<LearningTask>>;
  updateTask(taskId: string, updates: Partial<LearningTask>): Promise<ApiResponse<LearningTask>>;
  deleteTask(taskId: string): Promise<ApiResponse>;
  completeTask(taskId: string): Promise<ApiResponse<LearningTask>>;
  
  // 资源管理
  getResources(params?: PaginationParams): Promise<PaginatedResponse<LearningResource>>;
  getResource(resourceId: string): Promise<ApiResponse<LearningResource>>;
  createResource(data: CreateResourceData): Promise<ApiResponse<LearningResource>>;
  updateResource(resourceId: string, updates: Partial<LearningResource>): Promise<ApiResponse<LearningResource>>;
  deleteResource(resourceId: string): Promise<ApiResponse>;
  rateResource(resourceId: string, rating: number): Promise<ApiResponse>;
  
  // 学习计划
  getPlans(params?: PaginationParams): Promise<PaginatedResponse<StudyPlan>>;
  getPlan(planId: string): Promise<ApiResponse<StudyPlan>>;
  createPlan(data: CreatePlanData): Promise<ApiResponse<StudyPlan>>;
  updatePlan(planId: string, updates: Partial<StudyPlan>): Promise<ApiResponse<StudyPlan>>;
  deletePlan(planId: string): Promise<ApiResponse>;
  
  // 统计数据
  getStats(userId?: string): Promise<ApiResponse<LearningStats>>;
  getAchievements(userId?: string): Promise<ApiResponse<Achievement[]>>;
}

// 用户管理API
export interface UsersApi {
  getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>>;
  getUser(userId: string): Promise<ApiResponse<User>>;
  searchUsers(query: string, params?: PaginationParams): Promise<PaginatedResponse<User>>;
  updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>>;
  getUserPosts(userId: string, params?: PaginationParams): Promise<PaginatedResponse<Post>>;
  getUserStats(userId: string): Promise<ApiResponse<UserStats>>;
  reportUser(userId: string, reason: string): Promise<ApiResponse>;
  blockUser(userId: string): Promise<ApiResponse>;
  unblockUser(userId: string): Promise<ApiResponse>;
}

// 文件上传API
export interface FilesApi {
  uploadFile(file: File, options?: UploadOptions): Promise<ApiResponse<FileUpload>>;
  uploadFiles(files: File[], options?: UploadOptions): Promise<ApiResponse<FileUpload[]>>;
  deleteFile(fileId: string): Promise<ApiResponse>;
  getFileUrl(fileId: string): Promise<ApiResponse<string>>;
  getUploadProgress(uploadId: string): Promise<ApiResponse<UploadProgress>>;
}

export interface UploadOptions {
  folder?: string;
  public?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  onProgress?: (progress: number) => void;
}

// 通知API
export interface NotificationsApi {
  getNotifications(params?: PaginationParams): Promise<PaginatedResponse<Notification>>;
  markAsRead(notificationId: string): Promise<ApiResponse>;
  markAllAsRead(): Promise<ApiResponse>;
  deleteNotification(notificationId: string): Promise<ApiResponse>;
  getUnreadCount(): Promise<ApiResponse<number>>;
  updateSettings(settings: NotificationSettings): Promise<ApiResponse>;
  getSettings(): Promise<ApiResponse<NotificationSettings>>;
}

// HTTP方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// 请求配置
export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  signal?: AbortSignal;
}

// 响应拦截器
export interface ResponseInterceptor {
  onSuccess?: (response: any) => any;
  onError?: (error: any) => any;
}

// 请求拦截器
export interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig;
  onError?: (error: any) => any;
}

// API错误类型
export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: any;
  timestamp: string;
  path: string;
  method: string;
}

// 重试配置
export interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: ApiError) => boolean;
}

// 缓存配置
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // 缓存时间（秒）
  key?: string;
  invalidateOn?: string[];
}

// WebSocket相关
export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  id?: string;
}

// 实时订阅
export interface RealtimeSubscription {
  id: string;
  channel: string;
  event: string;
  callback: (data: any) => void;
  filter?: Record<string, any>;
}

// 批量操作
export interface BatchRequest {
  id: string;
  method: HttpMethod;
  url: string;
  data?: any;
}

export interface BatchResponse {
  id: string;
  status: number;
  data?: any;
  error?: ApiError;
}

// 导入导出类型
export interface ImportOptions {
  format: 'json' | 'csv' | 'xml';
  overwrite?: boolean;
  validate?: boolean;
  mapping?: Record<string, string>;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'xml' | 'pdf';
  fields?: string[];
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

// 搜索API
export interface SearchApi {
  search(params: SearchParams): Promise<SearchResponse>;
  suggest(query: string): Promise<ApiResponse<string[]>>;
  getPopularSearches(): Promise<ApiResponse<string[]>>;
  saveSearch(query: string): Promise<ApiResponse>;
  getSearchHistory(): Promise<ApiResponse<string[]>>;
  clearSearchHistory(): Promise<ApiResponse>;
}

// 分析API
export interface AnalyticsApi {
  track(event: string, properties?: Record<string, any>): Promise<ApiResponse>;
  getAnalytics(params?: AnalyticsParams): Promise<ApiResponse<Analytics>>;
  getUserAnalytics(userId: string, params?: AnalyticsParams): Promise<ApiResponse<UserAnalytics>>;
}

export interface AnalyticsParams {
  startDate: string;
  endDate: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
  metrics?: string[];
  dimensions?: string[];
}

export interface UserAnalytics {
  userId: string;
  sessions: number;
  pageViews: number;
  timeSpent: number;
  actions: Record<string, number>;
  lastActive: string;
}
