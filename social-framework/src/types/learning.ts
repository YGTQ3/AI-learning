// 学习相关类型定义

export interface LearningTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subject: string;
  category: string;
  difficulty: TaskDifficulty;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number; // 0-100
  estimatedTime: number; // 分钟
  actualTime?: number; // 实际花费时间
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  tags: string[];
  attachments: TaskAttachment[];
  subtasks: SubTask[];
  reminders: TaskReminder[];
  metadata: TaskMetadata;
}

export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface TaskReminder {
  id: string;
  type: 'before_due' | 'daily' | 'custom';
  time: string;
  isActive: boolean;
  message?: string;
}

export interface TaskMetadata {
  source?: string; // 任务来源
  courseId?: string; // 关联课程
  chapterId?: string; // 关联章节
  skillsToLearn?: string[]; // 要学习的技能
  prerequisites?: string[]; // 前置要求
}

// 学习资源
export interface LearningResource {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  subject: string;
  difficulty: TaskDifficulty;
  url?: string;
  content?: string;
  thumbnail?: string;
  duration?: number; // 视频/音频时长
  fileSize?: number;
  format?: string;
  language: string;
  tags: string[];
  rating: number; // 1-5星
  ratingsCount: number;
  downloadCount: number;
  viewCount: number;
  isFavorite: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
  author: ResourceAuthor;
  metadata: ResourceMetadata;
}

export type ResourceType = 
  | 'video'
  | 'audio'
  | 'document'
  | 'image'
  | 'link'
  | 'course'
  | 'quiz'
  | 'exercise'
  | 'note';

export interface ResourceAuthor {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  isVerified?: boolean;
}

export interface ResourceMetadata {
  chapters?: ResourceChapter[];
  quiz?: QuizData;
  exercise?: ExerciseData;
  note?: NoteData;
}

export interface ResourceChapter {
  id: string;
  title: string;
  duration: number;
  startTime: number; // 视频中的开始时间
}

// 学习计划
export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  estimatedHours: number;
  actualHours: number;
  subjects: string[];
  difficulty: TaskDifficulty;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
  tasks: string[]; // task IDs
  milestones: PlanMilestone[];
}

export type PlanStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface PlanMilestone {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  isCompleted: boolean;
  completedAt?: string;
  tasks: string[]; // task IDs
}

// 学习统计
export interface LearningStats {
  userId: string;
  totalStudyTime: number; // 总学习时间（分钟）
  tasksCompleted: number;
  resourcesCreated: number;
  currentStreak: number; // 当前连续学习天数
  longestStreak: number; // 最长连续学习天数
  averageSessionTime: number; // 平均学习时长
  subjectStats: SubjectStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
  achievements: Achievement[];
  level: number;
  experience: number;
  nextLevelExperience: number;
}

export interface SubjectStats {
  subject: string;
  studyTime: number;
  tasksCompleted: number;
  averageScore: number;
  progress: number;
}

export interface WeeklyStats {
  week: string; // YYYY-WW格式
  studyTime: number;
  tasksCompleted: number;
  daysActive: number;
}

export interface MonthlyStats {
  month: string; // YYYY-MM格式
  studyTime: number;
  tasksCompleted: number;
  daysActive: number;
  averageDaily: number;
}

// 成就系统
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  points: number;
  requirements: AchievementRequirement[];
  unlockedAt?: string;
  progress?: number; // 0-100，未解锁时显示进度
}

export type AchievementCategory = 
  | 'study_time'
  | 'tasks'
  | 'streak'
  | 'social'
  | 'resources'
  | 'special';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementRequirement {
  type: string;
  value: number;
  description: string;
}

// 测验和练习
export interface QuizData {
  questions: QuizQuestion[];
  timeLimit?: number; // 秒
  passingScore: number; // 百分比
  allowRetry: boolean;
  showAnswers: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface ExerciseData {
  instructions: string;
  examples?: ExerciseExample[];
  hints?: string[];
  solution?: string;
  difficulty: TaskDifficulty;
}

export interface ExerciseExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface NoteData {
  content: string;
  format: 'markdown' | 'html' | 'plain';
  lastModified: string;
  wordCount: number;
}

// 学习上下文
export interface LearningContextType {
  // 任务管理
  tasks: LearningTask[];
  isLoadingTasks: boolean;
  
  // 资源管理
  resources: LearningResource[];
  isLoadingResources: boolean;
  
  // 计划管理
  plans: StudyPlan[];
  activePlan?: StudyPlan;
  
  // 统计数据
  stats: LearningStats | null;
  
  // 操作方法
  createTask: (data: CreateTaskData) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<LearningTask>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  completeTask: (taskId: string) => Promise<boolean>;
  
  createResource: (data: CreateResourceData) => Promise<boolean>;
  updateResource: (resourceId: string, updates: Partial<LearningResource>) => Promise<boolean>;
  deleteResource: (resourceId: string) => Promise<boolean>;
  
  createPlan: (data: CreatePlanData) => Promise<boolean>;
  updatePlan: (planId: string, updates: Partial<StudyPlan>) => Promise<boolean>;
  deletePlan: (planId: string) => Promise<boolean>;
  
  // 数据加载
  loadTasks: () => Promise<void>;
  loadResources: () => Promise<void>;
  loadPlans: () => Promise<void>;
  loadStats: () => Promise<void>;
  
  // 同步
  syncData: () => Promise<boolean>;
  
  // 错误处理
  error: string | null;
  clearError: () => void;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  subject: string;
  category: string;
  difficulty: TaskDifficulty;
  priority: TaskPriority;
  estimatedTime: number;
  dueDate?: string;
  tags?: string[];
}

export interface CreateResourceData {
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  subject: string;
  difficulty: TaskDifficulty;
  url?: string;
  content?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface CreatePlanData {
  title: string;
  description: string;
  goal: string;
  startDate: string;
  endDate: string;
  subjects: string[];
  difficulty: TaskDifficulty;
  estimatedHours: number;
  isPublic?: boolean;
}
