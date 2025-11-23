// API客户端配置和基础请求方法
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
  details?: any;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // 获取认证token
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // 设置认证token
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  // 清除认证token
  clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // 添加认证头
    const token = this.getAuthToken();
    const headers = {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // 🔍 增强的API请求调试信息
    console.log('\n🌐 [API客户端] 发送请求详情:');
    console.log('   📍 请求URL:', url);
    console.log('   📋 请求方法:', options.method || 'GET');
    console.log('   🔐 认证令牌状态:', token ? '已设置' : '未设置');
    console.log('   📦 请求头:', headers);
    console.log('   🌐 基础URL:', this.baseURL);
    
    // 如果有请求体，显示请求体内容
    if (options.body) {
      if (typeof options.body === 'string') {
        try {
          const bodyData = JSON.parse(options.body);
          console.log('   📤 请求体数据:', bodyData);
        } catch (e) {
          console.log('   📤 请求体原始内容:', options.body);
        }
      } else {
        console.log('   📤 请求体类型:', typeof options.body);
        console.log('   📤 请求体内容:', options.body);
      }
    } else {
      console.log('   📤 请求体: 无');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const status = response.status;
      console.log('\n📥 [API客户端] 收到响应:');
      console.log('   📍 响应URL:', url);
      console.log('   📊 响应状态码:', status);
      console.log('   ✅ 响应状态:', response.ok ? '成功' : '失败');
      console.log('   📋 响应头:', Object.fromEntries(response.headers.entries()));
      
      // 处理204 No Content响应
      if (status === 204) {
        return { status };
      }

      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log('   📦 响应数据:', data);
      console.log('   📊 数据类型:', typeof data);
      console.log('   🔢 数据长度:', Array.isArray(data) ? data.length : (typeof data === 'object' ? Object.keys(data).length : 'N/A'));

      // 处理错误响应
      if (!response.ok) {
        console.log('\n❌ [API客户端] 响应错误处理:');
        console.log('   💥 错误消息:', data.message || data.detail || `HTTP ${status}`);
        console.log('   📊 错误详情:', data);
        
        return {
          error: data.message || data.detail || `HTTP ${status}`,
          status,
          details: data,
        };
      }

      console.log('\n✅ [API客户端] 响应成功处理:');
      console.log('   📦 返回数据:', data);
      console.log('   📊 状态码:', status);
      
      return {
        data,
        status,
      };
    } catch (error) {
      const errorInfo = {
        url,
        error: error instanceof Error ? error.message : error,
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        type: error instanceof Error ? error.constructor.name : typeof error
      };
      
      console.error('\n💥 [API客户端] 请求异常:');
      console.error('   📍 请求URL:', url);
      console.error('   🔍 错误类型:', error instanceof Error ? error.constructor.name : 'Unknown');
      console.error('   📝 错误消息:', error instanceof Error ? error.message : String(error));
      console.error('   📊 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
      console.error('   🔢 错误对象类型:', typeof error);
      
      // 提供更具体的错误信息
      let errorMessage = '网络请求失败';
      if (error instanceof Error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          errorMessage = '网络连接失败，请检查后端服务是否正在运行';
        } else if (error.name === 'AbortError') {
          errorMessage = '请求超时，请稍后重试';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = '无法连接到服务器，请检查网络连接和后端服务状态';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.log('\n📤 [API客户端] 返回错误响应:');
      console.log('   💬 错误消息:', errorMessage);
      console.log('   📊 状态码:', 0);
      console.log('   📋 错误详情:', errorInfo);
      
      return {
        error: errorMessage,
        status: 0,
        details: errorInfo
      };
    }
  }

  // GET请求
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return this.request<T>(url.pathname + url.search);
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // PATCH请求
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient();

// 导出便捷方法
export const api = {
  get: <T>(endpoint: string, params?: Record<string, any>) => 
    apiClient.get<T>(endpoint, params),
  post: <T>(endpoint: string, data?: any) => 
    apiClient.post<T>(endpoint, data),
  put: <T>(endpoint: string, data?: any) => 
    apiClient.put<T>(endpoint, data),
  delete: <T>(endpoint: string) => 
    apiClient.delete<T>(endpoint),
  patch: <T>(endpoint: string, data?: any) => 
    apiClient.patch<T>(endpoint, data),
  setAuthToken: (token: string) => apiClient.setAuthToken(token),
  clearAuthToken: () => apiClient.clearAuthToken(),
};

// API响应类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
}

export interface Diary {
  id: number;
  user_id: number;
  title: string;
  content: string;
  mood: string;
  tags?: string[];
  is_private: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AssistantConfig {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  prompt: string;
  model: string;
  temperature: string;
  max_tokens: number;
  is_default: boolean;
  is_active: boolean;
  icon: string;
  created_at: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  assistant_config_id?: number;
  session_id: string;
  role: string;
  content: string;
  tokens_used: number;
  model?: string;
  created_at: string;
}

export interface Entertainment {
  id: number;
  title: string;
  type: string;
  description?: string;
  rating?: number;
  year?: number;
  genre?: string;
  director?: string;
  duration?: string;
  image_url?: string;
  external_id?: string;
  source?: string;
  created_at: string;
  updated_at?: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  entertainment_id: number;
  status: string;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Goal {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  category?: string;
  priority: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Schedule {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  category?: string;
  priority: string;
  is_all_day: boolean;
  is_completed: boolean;
  reminder_time?: string;
  created_at: string;
  updated_at?: string;
}