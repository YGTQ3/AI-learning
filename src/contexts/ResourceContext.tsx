import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LearningResource, ResourceContextType, ResourceFilters } from '@/types/resource';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabaseSync } from '@/services/supabaseSync';

// 生成 UUID 函数
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export function useResource() {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResource must be used within a ResourceProvider');
  }
  return context;
}

interface ResourceProviderProps {
  children: ReactNode;
}

export function ResourceProvider({ children }: ResourceProviderProps) {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const categories = [
    '数学', '物理', '化学', '生物', '英语', '语文', 
    '历史', '地理', '政治', '计算机', '艺术', '音乐', '其他'
  ];

  // 从云端加载数据
  const loadFromCloud = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const cloudResources = await supabaseSync.fetchResources(user.id);
      setResources(cloudResources);
    } catch (error) {
      console.error('加载云端资源失败:', error);
      loadFromLocal();
    } finally {
      setIsLoading(false);
    }
  };

  // 从本地加载数据
  const loadFromLocal = () => {
    const savedResources = localStorage.getItem('learningResources');
    if (savedResources) {
      const parsedResources = JSON.parse(savedResources);
      const fixedResources = parsedResources.map((resource: LearningResource) => {
        if (!resource.id.includes('-')) {
          return { ...resource, id: generateUUID() };
        }
        return resource;
      });
      setResources(fixedResources);
    }
  };

  // 同步到云端
  const syncToCloud = async () => {
    if (!user || isSyncing) return;
    
    setIsSyncing(true);
    try {
      console.log('开始同步资源到云端，当前资源数量:', resources.length);
      const result = await supabaseSync.syncResources(user.id, resources);
      console.log('资源同步结果:', result);
      return result;
    } catch (error) {
      console.error('资源同步失败:', error);
      return { success: false, error };
    } finally {
      setIsSyncing(false);
    }
  };

  // 初始化数据加载
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFromCloud();
    } else {
      loadFromLocal();
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // 保存到本地存储
  useEffect(() => {
    localStorage.setItem('learningResources', JSON.stringify(resources));
  }, [resources]);

  // 自动同步到云端（防抖）
  useEffect(() => {
    if (!isAuthenticated || !user || resources.length === 0) return;

    const timeoutId = setTimeout(() => {
      syncToCloud();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [resources, isAuthenticated, user]);

  const addResource = (resourceData: Omit<LearningResource, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'rating'>) => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    const newResource: LearningResource = {
      ...resourceData,
      id: generateUUID(), // 使用我们的 UUID 生成函数
      rating: 0,
      downloadCount: 0,
      uploadedBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 如果是文件上传，创建本地URL
    if (resourceData.file) {
      newResource.fileUrl = URL.createObjectURL(resourceData.file);
      newResource.size = resourceData.file.size;
    }

    setResources(prev => [newResource, ...prev]);
    toast.success('资源添加成功');
  };

  const updateResource = (id: string, updates: Partial<LearningResource>) => {
    setResources(prev => prev.map(resource => 
      resource.id === id 
        ? { ...resource, ...updates, updatedAt: new Date().toISOString() }
        : resource
    ));
    toast.success('资源更新成功');
  };

  const deleteResource = (id: string) => {
    const resource = resources.find(r => r.id === id);
    if (resource && resource.fileUrl) {
      URL.revokeObjectURL(resource.fileUrl);
    }
    setResources(prev => prev.filter(resource => resource.id !== id));
    toast.success('资源删除成功');
  };

  const toggleFavorite = (id: string) => {
    setResources(prev => prev.map(resource => 
      resource.id === id 
        ? { ...resource, isFavorite: !resource.isFavorite }
        : resource
    ));
  };

  const searchResources = (query: string, filters?: ResourceFilters): LearningResource[] => {
    let filtered = resources;

    // 文本搜索
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm) ||
        resource.description.toLowerCase().includes(searchTerm) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // 应用过滤器
    if (filters) {
      if (filters.category) {
        filtered = filtered.filter(resource => resource.category === filters.category);
      }
      if (filters.type) {
        filtered = filtered.filter(resource => resource.type === filters.type);
      }
      if (filters.difficulty) {
        filtered = filtered.filter(resource => resource.difficulty === filters.difficulty);
      }
      if (filters.minRating) {
        filtered = filtered.filter(resource => resource.rating >= filters.minRating);
      }
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(resource =>
          filters.tags!.some(tag => resource.tags.includes(tag))
        );
      }
    }

    return filtered;
  };

  const getResourcesByCategory = (category: string): LearningResource[] => {
    return resources.filter(resource => resource.category === category);
  };

  const incrementDownloadCount = (id: string) => {
    setResources(prev => prev.map(resource => 
      resource.id === id 
        ? { ...resource, downloadCount: resource.downloadCount + 1 }
        : resource
    ));
  };

  const rateResource = (id: string, rating: number) => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    // 简化的评分系统，实际项目中应该存储每个用户的评分
    setResources(prev => prev.map(resource => 
      resource.id === id 
        ? { ...resource, rating: Math.round((resource.rating + rating) / 2 * 10) / 10 }
        : resource
    ));
    toast.success('评分成功');
  };

  // 手动同步函数
  const manualSync = async () => {
    if (!user) return { success: false, message: '请先登录' };
    return await syncToCloud();
  };

  const value = {
    resources,
    isLoading,
    isSyncing,
    categories, // 确保 categories 被包含在 value 中
    addResource,
    updateResource,
    deleteResource,
    toggleFavorite,
    manualSync,
    searchResources,
    getResourcesByCategory,
    incrementDownloadCount,
    rateResource
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
}







