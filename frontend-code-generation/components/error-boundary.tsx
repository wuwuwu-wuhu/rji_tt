'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('错误边界捕获到错误:', error, errorInfo);
    
    // 这里可以添加错误报告服务
    // reportError(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

// 默认错误回退组件
function DefaultErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          出现了一些问题
        </h2>
        
        <p className="text-gray-600 mb-6">
          {error?.message || '应用程序遇到了意外错误。请刷新页面重试。'}
        </p>
        
        <div className="space-y-3">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            重试
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="w-full"
          >
            刷新页面
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">
              查看错误详情
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// API错误边界组件
export function ApiErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={ApiErrorFallback}
    >
      {children}
    </ErrorBoundary>
  );
}

function ApiErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  const isNetworkError = error?.message.includes('fetch') || error?.message.includes('network');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isNetworkError ? '网络连接问题' : 'API请求失败'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {isNetworkError 
            ? '无法连接到服务器。请检查您的网络连接并重试。'
            : '服务器请求失败。请稍后重试或联系技术支持。'
          }
        </p>
        
        <div className="space-y-3">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            重试
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            返回首页
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">
              查看错误详情
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// 页面级错误边界
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={PageErrorFallback}
    >
      {children}
    </ErrorBoundary>
  );
}

function PageErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          页面加载失败
        </h3>
        
        <p className="text-gray-600 mb-4">
          {error?.message || '页面加载时出现问题。'}
        </p>
        
        <Button onClick={reset} size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    </div>
  );
}