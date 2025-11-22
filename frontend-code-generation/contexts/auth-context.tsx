'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/lib/api';
import { authService, LoginRequest, RegisterRequest } from '@/lib/services/auth';
import { useApi } from '@/hooks/use-api';

// 认证上下文类型
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
  }) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // 获取当前用户信息
  const {
    data: userData,
    loading,
    error,
    execute: fetchUser,
  } = useApi<User>(() => authService.getCurrentUser(), {
    immediate: false,
  });

  // 初始化认证状态
  useEffect(() => {
    // 首先尝试从本地存储获取用户信息
    const storedUser = authService.getCurrentUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }

    // 然后验证token并获取最新用户信息
    const token = authService.getAuthToken();
    if (token) {
      fetchUser();
    }
  }, []); // 移除fetchUser依赖，只在组件挂载时执行一次

  // 监听用户API响应
  useEffect(() => {
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
      setAuthError(null);
    }
  }, [userData]);

  // 监听错误
  useEffect(() => {
    if (error) {
      setAuthError(error.message);
      // 如果获取用户信息失败，可能是token过期
      if (error.status === 401) {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, [error]);

  // 登录函数
  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    try {
      const credentials: LoginRequest = {
        username: usernameOrEmail, // 后端使用username字段，但可以接收用户名或邮箱
        password,
      };
      
      const result = await authService.login(credentials);
      if (!result.error && result.data) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        setAuthError(null);
        return true;
      }
      setAuthError(result.error || '登录失败');
      return false;
    } catch (error) {
      console.error('登录失败:', error);
      setAuthError('登录失败，请稍后重试');
      return false;
    }
  };

  // 注册函数
  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
  }): Promise<boolean> => {
    try {
      const registerData: RegisterRequest = userData;
      
      const result = await authService.register(registerData);
      if (!result.error && result.data) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        setAuthError(null);
        return true;
      }
      setAuthError(result.error || '注册失败');
      return false;
    } catch (error) {
      console.error('注册失败:', error);
      setAuthError('注册失败，请稍后重试');
      return false;
    }
  };

  // 登出函数
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };

  // 刷新用户信息
  const refreshUser = async (): Promise<void> => {
    const token = authService.getAuthToken();
    if (token) {
      await fetchUser();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error: authError,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用认证上下文的Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
}

// 认证状态检查Hook
export function useRequireAuth() {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      // 可以在这里重定向到登录页面
      // 或者显示登录模态框
      console.log('用户未登录，需要认证');
    }
  }, [auth.loading, auth.isAuthenticated]);

  return auth;
}

// 受保护的路由组件
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const auth = useRequireAuth();

  if (auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">需要登录</h2>
          <p className="text-gray-600 mb-4">请先登录以访问此页面</p>
          <button
            onClick={() => {
              // 这里可以触发登录模态框或重定向到登录页
              window.location.href = '/auth/login';
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}