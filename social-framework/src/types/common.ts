// 通用类型定义

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  timestamp?: string;
}

// 分页相关
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// 通知类型
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  priority: NotificationPriority;
  category: NotificationCategory;
}

export type NotificationType = 
  | 'like'
  | 'comment'
  | 'follow'
  | 'mention'
  | 'achievement'
  | 'reminder'
  | 'system'
  | 'update'
  | 'warning'
  | 'error';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationCategory = 
  | 'social'
  | 'learning'
  | 'system'
  | 'security'
  | 'marketing';

// 文件上传
export interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
  uploadedAt: string;
  uploadedBy: string;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  quality?: string;
  compression?: string;
}

export interface UploadProgress {
  fileId: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// 搜索相关
export interface SearchParams {
  query: string;
  type?: SearchType;
  filters?: SearchFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export type SearchType = 'all' | 'posts' | 'users' | 'resources' | 'tasks' | 'tags';

export interface SearchFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
  tags?: string[];
  difficulty?: string[];
  type?: string[];
  author?: string;
}

export interface SearchResult<T = any> {
  id: string;
  type: SearchType;
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
  relevance: number;
  data: T;
  highlights?: string[];
}

export interface SearchResponse<T = any> {
  results: SearchResult<T>[];
  total: number;
  query: string;
  suggestions?: string[];
  facets?: SearchFacet[];
  took: number; // 搜索耗时（毫秒）
}

export interface SearchFacet {
  field: string;
  values: Array<{
    value: string;
    count: number;
  }>;
}

// 主题和样式
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: Theme;
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  animations: boolean;
}

// 设备和平台
export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type Platform = 'web' | 'ios' | 'android' | 'electron';

export interface DeviceInfo {
  type: DeviceType;
  platform: Platform;
  userAgent: string;
  screenSize: {
    width: number;
    height: number;
  };
  isOnline: boolean;
  language: string;
  timezone: string;
}

// 地理位置
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formatted?: string;
}

// 时间相关
export interface TimeRange {
  start: string;
  end: string;
}

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  timezone: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[]; // 0-6, 0=Sunday
  dayOfMonth?: number;
  monthOfYear?: number;
  endDate?: string;
  count?: number;
}

// 统计和分析
export interface Analytics {
  pageViews: number;
  uniqueVisitors: number;
  sessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topPages: Array<{
    path: string;
    views: number;
  }>;
  topReferrers: Array<{
    source: string;
    visits: number;
  }>;
  deviceBreakdown: Record<DeviceType, number>;
  locationBreakdown: Record<string, number>;
}

// 配置和设置
export interface AppConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  features: FeatureFlags;
  limits: AppLimits;
  social: SocialConfig;
}

export interface FeatureFlags {
  enableSocialFeatures: boolean;
  enableNotifications: boolean;
  enableAnalytics: boolean;
  enableFileUpload: boolean;
  enableRealtime: boolean;
  enableOfflineMode: boolean;
}

export interface AppLimits {
  maxFileSize: number; // bytes
  maxFilesPerUpload: number;
  maxPostLength: number;
  maxCommentLength: number;
  maxTagsPerPost: number;
  maxFollowing: number;
  dailyPostLimit: number;
}

export interface SocialConfig {
  allowAnonymousPosts: boolean;
  requireEmailVerification: boolean;
  moderationEnabled: boolean;
  autoApproveComments: boolean;
  maxMentionsPerPost: number;
}

// 实用工具类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 状态管理
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
}

// 表单相关
export interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  validation?: ValidationRule[];
  options?: Array<{
    value: string;
    label: string;
  }>;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}
