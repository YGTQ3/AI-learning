// 认证相关类型定义

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  level: number;
  experience: number;
  joinedAt: string;
  lastActiveAt?: string;
  isOnline?: boolean;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    mentions: boolean;
    achievements: boolean;
    reminders: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  showLearningProgress: boolean;
  allowDirectMessages: boolean;
}

export interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  commentsReceived: number;
  tasksCompleted: number;
  resourcesShared: number;
  studyStreak: number;
  totalStudyTime: number; // 分钟
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (userData: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 用户关注系统
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
}

// 用户等级系统
export interface UserLevel {
  level: number;
  title: string;
  minExperience: number;
  maxExperience: number;
  benefits: string[];
  badgeIcon: string;
  badgeColor: string;
}

export interface ExperienceGain {
  action: string;
  points: number;
  description: string;
}

// 认证状态
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

// 用户角色
export type UserRole = 'student' | 'teacher' | 'admin' | 'moderator';

// 账户状态
export type AccountStatus = 'active' | 'suspended' | 'pending' | 'banned';
