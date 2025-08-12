// API客户端基础类
import { supabase } from '@/lib/supabase';
import { 
  ApiResponse, 
  PaginationParams, 
  PaginatedResponse,
  RequestConfig,
  ApiError,
  RetryConfig,
  CacheConfig 
} from '@/types';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class BaseApiClient {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private defaultRetryConfig: RetryConfig = {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error) => error.status >= 500 || error.status === 429
  };

  constructor(
    private baseUrl: string = '',
    private defaultHeaders: Record<string, string> = {}
  ) {}

  // 通用请求方法
  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { method, url, data, params, headers, timeout, retries, cache } = config;
    
    // 构建完整URL
    const fullUrl = this.buildUrl(url, params);
    
    // 检查缓存
    if (method === 'GET' && cache) {
      const cached = this.getFromCache(fullUrl);
      if (cached) {
        return { success: true, data: cached };
      }
    }

    // 构建请求头
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...headers
    };

    try {
      const response = await this.executeRequest({
        method,
        url: fullUrl,
        data,
        headers: requestHeaders,
        timeout,
        retries: retries ?? this.defaultRetryConfig.retries
      });

      // 缓存GET请求结果
      if (method === 'GET' && cache && response.success) {
        this.setCache(fullUrl, response.data, 300); // 默认5分钟缓存
      }

      return response;
    } catch (error) {
      console.error('API请求失败:', error);
      throw this.handleError(error);
    }
  }

  // 执行实际请求
  private async executeRequest(config: RequestConfig & { retries: number }): Promise<ApiResponse> {
    const { method, url, data, headers, timeout, retries } = config;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        let response;
        
        switch (method) {
          case 'GET':
            response = await supabase.from(this.extractTableName(url)).select('*');
            break;
          case 'POST':
            response = await supabase.from(this.extractTableName(url)).insert(data).select();
            break;
          case 'PUT':
          case 'PATCH':
            response = await supabase.from(this.extractTableName(url)).update(data).select();
            break;
          case 'DELETE':
            response = await supabase.from(this.extractTableName(url)).delete();
            break;
          default:
            throw new ApiClientError('不支持的HTTP方法', 'UNSUPPORTED_METHOD');
        }

        if (response.error) {
          throw new ApiClientError(
            response.error.message,
            response.error.code || 'SUPABASE_ERROR',
            undefined,
            response.error
          );
        }

        return {
          success: true,
          data: response.data,
          message: '请求成功'
        };
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        
        // 检查是否应该重试
        if (error instanceof ApiClientError && this.defaultRetryConfig.retryCondition?.(error)) {
          await this.delay(this.defaultRetryConfig.retryDelay * Math.pow(2, attempt));
          continue;
        }
        
        throw error;
      }
    }

    throw new ApiClientError('请求失败', 'REQUEST_FAILED');
  }

  // GET请求
  async get<T = any>(url: string, params?: Record<string, any>, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      cache: true,
      ...config
    });
  }

  // POST请求
  async post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config
    });
  }

  // PUT请求
  async put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config
    });
  }

  // PATCH请求
  async patch<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config
    });
  }

  // DELETE请求
  async delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config
    });
  }

  // 分页请求
  async paginate<T = any>(
    url: string, 
    params: PaginationParams,
    config?: Partial<RequestConfig>
  ): Promise<PaginatedResponse<T>> {
    const { page, limit, sortBy, sortOrder, search, filters } = params;
    
    const queryParams = {
      page,
      limit,
      ...(sortBy && { sort_by: sortBy }),
      ...(sortOrder && { sort_order: sortOrder }),
      ...(search && { search }),
      ...(filters && { ...filters })
    };

    const response = await this.get<T[]>(url, queryParams, config);
    
    if (!response.success) {
      throw new ApiClientError(response.error || '分页请求失败', 'PAGINATION_ERROR');
    }

    // 这里需要根据实际API响应格式调整
    const data = response.data || [];
    const total = Array.isArray(data) ? data.length : 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  // 工具方法
  private buildUrl(url: string, params?: Record<string, any>): string {
    if (!params) return url;
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  private extractTableName(url: string): string {
    // 从URL中提取表名，这里需要根据实际URL格式调整
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'unknown';
  }

  private handleError(error: any): ApiClientError {
    if (error instanceof ApiClientError) {
      return error;
    }

    if (error.response) {
      return new ApiClientError(
        error.response.data?.message || '请求失败',
        error.response.data?.code || 'HTTP_ERROR',
        error.response.status,
        error.response.data
      );
    }

    if (error.request) {
      return new ApiClientError('网络连接失败', 'NETWORK_ERROR');
    }

    return new ApiClientError(
      error.message || '未知错误',
      'UNKNOWN_ERROR',
      undefined,
      error
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 缓存管理
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  // 设置认证头
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // 移除认证头
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
}

// 创建默认API客户端实例
export const apiClient = new BaseApiClient();
