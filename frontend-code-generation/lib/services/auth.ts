import { api, User, ApiResponse } from '../api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export class AuthService {
  // 用户登录
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<LoginResponse>('/api/auth/login', credentials);
    
    if (response.data && response.data.access_token) {
      // 保存token到localStorage
      api.setAuthToken(response.data.access_token);
      
      // 保存用户信息
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response;
  }

  // 用户注册
  async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<LoginResponse>('/api/auth/register', userData);
    
    if (response.data && response.data.access_token) {
      // 保存token到localStorage
      api.setAuthToken(response.data.access_token);
      
      // 保存用户信息
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response;
  }

  // 获取当前用户信息
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return api.get<User>('/api/users/me');
  }

  // 更新用户信息
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put<User>('/api/users/me', userData);
    
    if (response.data) {
      // 更新本地存储的用户信息
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    }
    
    return response;
  }

  // 登出
  logout(): void {
    // 清除token和用户信息
    api.clearAuthToken();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    return !!(token && user);
  }

  // 获取当前用户信息（从本地存储）
  getCurrentUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    
    return null;
  }

  // 获取认证token
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  // 刷新token（如果后端支持）
  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<LoginResponse>('/api/auth/refresh');
    
    if (response.data && response.data.access_token) {
      api.setAuthToken(response.data.access_token);
    }
    
    return response;
  }

  // 验证token有效性
  async validateToken(): Promise<boolean> {
    try {
      const response = await this.getCurrentUser();
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// 创建认证服务实例
export const authService = new AuthService();

// 导出便捷方法
export const {
  login,
  register,
  getCurrentUser,
  updateProfile,
  logout,
  isAuthenticated,
  getCurrentUserFromStorage,
  getAuthToken,
  refreshToken,
  validateToken,
} = authService;