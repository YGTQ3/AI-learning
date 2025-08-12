import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useResource } from '@/contexts/ResourceContext';
import { ResourceCard } from '@/components/ResourceCard';
import { ResourceForm } from '@/components/ResourceForm';
import { ResourceSearch } from '@/components/ResourceSearch';
import { UserMenu } from '@/components/UserMenu';
import { AuthModal } from '@/components/AuthModal';
import { LearningResource, ResourceFilters } from '@/types/resource';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Resources() {
  const { isAuthenticated } = useAuth();
  const { resources, searchResources, categories } = useResource();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [filteredResources, setFilteredResources] = useState<LearningResource[]>(resources);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'downloads'>('newest');

  useEffect(() => {
    setFilteredResources(resources);
  }, [resources]);

  const handleSearch = (query: string, filters: ResourceFilters) => {
    const results = searchResources(query, filters);
    setFilteredResources(results);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category) {
      const filtered = resources.filter(resource => resource.category === category);
      setFilteredResources(filtered);
    } else {
      setFilteredResources(resources);
    }
  };

  const sortResources = (resources: LearningResource[], sortBy: string) => {
    const sorted = [...resources];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'downloads':
        return sorted.sort((a, b) => b.downloadCount - a.downloadCount);
      default:
        return sorted;
    }
  };

  const sortedResources = sortResources(filteredResources, sortBy);

  const getCategoryStats = () => {
    const stats: { [key: string]: number } = {};
    resources.forEach(resource => {
      stats[resource.category] = (stats[resource.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              AI学习助手
            </Link>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                首页
              </Link>
              <Link 
                to="/resources" 
                className="text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 dark:border-blue-400 pb-1"
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
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
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
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">学习资源库</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                发现和分享优质学习资源
              </p>
            </div>
            
            {isAuthenticated && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-plus"></i>
                上传资源
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <ResourceSearch onSearch={handleSearch} />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 mb-6">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">分类</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryFilter('')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === '' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>全部</span>
                    <span className="text-sm">{resources.length}</span>
                  </div>
                </button>
                
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category}</span>
                      <span className="text-sm">{categoryStats[category] || 0}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">统计信息</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">总资源数</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{resources.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">总下载量</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {resources.reduce((sum, r) => sum + r.downloadCount, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">平均评分</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {resources.length > 0 
                      ? (resources.reduce((sum, r) => sum + r.rating, 0) / resources.length).toFixed(1)
                      : '0.0'
                    }
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                找到 {sortedResources.length} 个资源
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">排序：</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="newest">最新上传</option>
                  <option value="rating">评分最高</option>
                  <option value="downloads">下载最多</option>
                </select>
              </div>
            </div>

            {/* Resources Grid */}
            {sortedResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedResources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fa-solid fa-search text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
                  没有找到匹配的资源
                </h3>
                <p className="text-gray-400 dark:text-gray-500 mb-6">
                  尝试调整搜索条件或筛选器
                </p>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    上传第一个资源
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <ResourceForm onClose={() => setShowUploadForm(false)} />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}





