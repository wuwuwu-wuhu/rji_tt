import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, ApiError } from '@/lib/api';

// 通用API Hook配置
interface UseApiOptions<T> {
  immediate?: boolean; // 是否立即执行
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  retry?: number; // 重试次数
  retryDelay?: number; // 重试延迟（毫秒）
}

// API状态接口
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

// 通用API Hook
export function useApi<T = any>(
  apiFunction: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));

    try {
      const response = await apiFunction();
      
      if (response.error) {
        const error: ApiError = {
          message: response.error || '未知错误',
          status: response.status,
          details: response.details,
        };
        
        setState(prev => ({
          ...prev,
          loading: false,
          error,
          success: false,
        }));
        
        options.onError?.(error);
        
        // 重试逻辑
        if (options.retry && retryCount < options.retry) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            execute();
          }, options.retryDelay || 1000);
        }
      } else if (response.data !== undefined) {
        setState(prev => ({
          ...prev,
          data: response.data || null,
          loading: false,
          error: null,
          success: true,
        }));
        
        options.onSuccess?.(response.data);
        setRetryCount(0); // 重置重试计数
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : '未知错误',
        status: 0,
      };
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
        success: false,
      }));
      
      options.onError?.(apiError);
    }
  }, [apiFunction, options.retry, options.retryDelay, options.onError, options.onSuccess, retryCount]);

  // 立即执行
  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [options.immediate]); // 移除execute依赖，避免无限循环

  // 重置状态
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
    setRetryCount(0);
  }, []);

  // 手动重试
  const retry = useCallback(() => {
    setRetryCount(0);
    execute();
  }, [execute]);

  return {
    ...state,
    execute,
    reset,
    retry,
  };
}

// 分页API Hook
export function usePaginatedApi<T>(
  apiFunction: (page: number, limit: number) => Promise<ApiResponse<{
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>>,
  initialPage = 1,
  initialLimit = 20
) {
  const [state, setState] = useState<{
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
    loading: boolean;
    error: ApiError | null;
  }>({
    items: [],
    total: 0,
    page: initialPage,
    limit: initialLimit,
    pages: 0,
    loading: false,
    error: null,
  });

  const loadPage = useCallback(async (page: number, limit: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiFunction(page, limit);
      
      if (response.error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: {
            message: response.error || '加载失败',
            status: response.status,
          },
        }));
      } else if (response.data) {
        const data = response.data;
        setState(prev => ({
          ...prev,
          items: data.items || [],
          total: data.total || 0,
          page: data.page || 1,
          limit: data.limit || 20,
          pages: data.pages || 0,
          loading: false,
          error: null,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          message: error instanceof Error ? error.message : '加载失败',
          status: 0,
        },
      }));
    }
  }, [apiFunction]);

  // 初始加载
  useEffect(() => {
    loadPage(initialPage, initialLimit);
  }, [loadPage, initialPage, initialLimit]);

  // 刷新当前页
  const refresh = useCallback(() => {
    loadPage(state.page, state.limit);
  }, [loadPage, state.page, state.limit]);

  // 加载指定页
  const goToPage = useCallback((page: number) => {
    loadPage(page, state.limit);
  }, [loadPage, state.limit]);

  // 更新每页数量
  const updateLimit = useCallback((limit: number) => {
    loadPage(1, limit);
  }, [loadPage]);

  return {
    ...state,
    loadPage,
    refresh,
    goToPage,
    updateLimit,
  };
}

// 变更API Hook（用于POST、PUT、DELETE等操作）
export function useMutation<T, P = any>(
  apiFunction: (params: P) => Promise<ApiResponse<T>>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
    onSettled?: () => void;
  } = {}
) {
  const [state, setState] = useState<{
    loading: boolean;
    error: ApiError | null;
    data: T | null;
    success: boolean;
  }>({
    loading: false,
    error: null,
    data: null,
    success: false,
  });

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));

    try {
      const response = await apiFunction(params);
      
      if (response.error) {
        const error: ApiError = {
          message: response.error || '操作失败',
          status: response.status,
          details: response.details,
        };
        
        setState(prev => ({
          ...prev,
          loading: false,
          error,
          success: false,
        }));
        
        options.onError?.(error);
      } else if (response.data !== undefined) {
        setState(prev => ({
          ...prev,
          data: response.data || null,
          loading: false,
          error: null,
          success: true,
        }));
        
        options.onSuccess?.(response.data);
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : '操作失败',
        status: 0,
      };
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
        success: false,
      }));
      
      options.onError?.(apiError);
    } finally {
      options.onSettled?.();
    }
  }, [apiFunction, options]);

  // 重置状态
  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

// 防抖API Hook
export function useDebouncedApi<T>(
  apiFunction: (params: any) => Promise<ApiResponse<T>>,
  delay: number = 300
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const [debouncedParams, setDebouncedParams] = useState<any>(null);

  const executeApi = useCallback(async (params: any) => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));

    try {
      const response = await apiFunction(params);
      
      if (response.error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: {
            message: response.error || '请求失败',
            status: response.status,
          },
          success: false,
        }));
      } else if (response.data !== undefined) {
        setState(prev => ({
          ...prev,
          data: response.data || null,
          loading: false,
          error: null,
          success: true,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          message: error instanceof Error ? error.message : '请求失败',
          status: 0,
        },
        success: false,
      }));
    }
  }, [apiFunction]);

  // 防抖执行
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedParams !== null) {
        executeApi(debouncedParams);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [debouncedParams, delay, executeApi]);

  // 触发防抖请求
  const trigger = useCallback((params: any) => {
    setDebouncedParams(params);
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
    setDebouncedParams(null);
  }, []);

  return {
    ...state,
    trigger,
    reset,
  };
}