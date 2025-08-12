import { useState } from 'react';
import { LearningResource } from '@/types/resource';
import { useResource } from '@/contexts/ResourceContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ResourceCardProps {
  resource: LearningResource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const { toggleFavorite, deleteResource, incrementDownloadCount, rateResource } = useResource();
  const { user } = useAuth();
  const [showRating, setShowRating] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'fa-play-circle';
      case 'audio': return 'fa-volume-up';
      case 'document': return 'fa-file-alt';
      case 'image': return 'fa-image';
      case 'link': return 'fa-external-link-alt';
      default: return 'fa-file';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初级';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return '未知';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (resource.fileUrl) {
      const link = document.createElement('a');
      link.href = resource.fileUrl;
      link.download = resource.title;
      link.click();
    } else if (resource.url) {
      window.open(resource.url, '_blank');
    }
    incrementDownloadCount(resource.id);
    toast.success('开始下载');
  };

  const handleDelete = () => {
    if (confirm('确定要删除这个资源吗？')) {
      deleteResource(resource.id);
    }
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    rateResource(resource.id, rating);
    setShowRating(false);
  };

  const canDelete = user && (user.id === resource.uploadedBy || user.id === 'admin');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center relative">
        <i className={`fa-solid ${getTypeIcon(resource.type)} text-4xl text-white opacity-70`}></i>
        <button
          onClick={() => toggleFavorite(resource.id)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            resource.isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
          }`}
        >
          <i className={`fa-${resource.isFavorite ? 'solid' : 'regular'} fa-heart`}></i>
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(resource.difficulty)}`}>
            {getDifficultyText(resource.difficulty)}
          </span>
          <div className="flex items-center text-yellow-500 text-sm">
            <i className="fa-solid fa-star mr-1"></i>
            <span>{resource.rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
          {resource.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {resource.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{resource.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-download"></i>
            {resource.downloadCount}
          </span>
          {resource.duration && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-clock"></i>
              {resource.duration}分钟
            </span>
          )}
          {resource.size && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-file"></i>
              {formatFileSize(resource.size)}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
          >
            <i className="fa-solid fa-download"></i>
            {resource.type === 'link' ? '访问' : '下载'}
          </button>
          
          <button
            onClick={() => setShowRating(!showRating)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="评分"
          >
            <i className="fa-solid fa-star"></i>
          </button>

          {canDelete && (
            <button
              onClick={handleDelete}
              className="p-2 border border-red-300 dark:border-red-600 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
              title="删除"
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          )}
        </div>

        {showRating && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">为这个资源评分：</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className={`text-lg transition-colors ${
                    star <= userRating 
                      ? 'text-yellow-500' 
                      : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
                  }`}
                  onMouseEnter={() => setUserRating(star)}
                  onMouseLeave={() => setUserRating(0)}
                >
                  <i className="fa-solid fa-star"></i>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}