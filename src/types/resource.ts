export interface LearningResource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'video' | 'document' | 'audio' | 'image' | 'link';
  url?: string;
  file?: File;
  fileUrl?: string;
  tags: string[];
  rating: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: number; // 分钟
  size?: number; // 字节
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  downloadCount: number;
  isFavorite: boolean;
}

export interface ResourceContextType {
  resources: LearningResource[];
  categories: string[];
  isLoading: boolean;
  isSyncing: boolean;
  addResource: (resource: Omit<LearningResource, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'rating'>) => void;
  updateResource: (id: string, updates: Partial<LearningResource>) => void;
  deleteResource: (id: string) => void;
  toggleFavorite: (id: string) => void;
  manualSync: () => Promise<{ success: boolean; message?: string }>;
  searchResources: (query: string, filters?: ResourceFilters) => LearningResource[];
  getResourcesByCategory: (category: string) => LearningResource[];
  incrementDownloadCount: (id: string) => void;
  rateResource: (id: string, rating: number) => void;
}

export interface ResourceFilters {
  category?: string;
  type?: string;
  difficulty?: string;
  tags?: string[];
  minRating?: number;
}

export interface ResourceFormData {
  title: string;
  description: string;
  category: string;
  type: 'video' | 'document' | 'audio' | 'image' | 'link';
  url?: string;
  file?: File;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
}
