import { useState } from 'react';
import { useResource } from '@/contexts/ResourceContext';
import { ResourceFilters } from '@/types/resource';

interface ResourceSearchProps {
  onSearch: (query: string, filters: ResourceFilters) => void;
}

export function ResourceSearch({ onSearch }: ResourceSearchProps) {
  const { categories } = useResource();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ResourceFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const clearFilters = () => {
    setFilters({});
    setQuery('');
    onSearch('', {});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 mb-6">
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="搜索资源标题、描述或标签..."
          />
          <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
        
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          搜索
        </button>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
            showFilters || hasActiveFilters
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900'
              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <i className="fa-solid fa-filter"></i>
          筛选
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                分类
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">所有分类</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                资源类型
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">所有类型</option>
                <option value="document">文档</option>
                <option value="video">视频</option>
                <option value="audio">音频</option>
                <option value="image">图片</option>
                <option value="link">链接</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                难度等级
              </label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">所有难度</option>
                <option value="beginner">初级</option>
                <option value="intermediate">中级</option>
                <option value="advanced">高级</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                最低评分
              </label>
              <select
                value={filters.minRating || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">任意评分</option>
                <option value="4.5">4.5星以上</option>
                <option value="4.0">4.0星以上</option>
                <option value="3.5">3.5星以上</option>
                <option value="3.0">3.0星以上</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              应用筛选
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}