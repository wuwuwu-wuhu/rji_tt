'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { register, error } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setValidationError('用户名不能为空');
      return false;
    }
    
    if (!formData.email.trim()) {
      setValidationError('邮箱不能为空');
      return false;
    }
    
    if (formData.password.length < 6) {
      setValidationError('密码至少需要6个字符');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError('两次输入的密码不一致');
      return false;
    }
    
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const success = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name || undefined,
      });
      
      if (success) {
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">注册账户</CardTitle>
            <CardDescription className="text-center">
              创建您的账户以开始使用LifeLog AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(error || validationError) && (
                <Alert variant="destructive">
                  <AlertDescription>{error || validationError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="选择一个用户名"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">姓名（可选）</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="您的真实姓名"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="至少6个字符"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                注册
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">已有账户？</span>{' '}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                立即登录
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}