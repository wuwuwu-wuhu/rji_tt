"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/services/auth"
import { User } from "@/lib/api"

export function ProfileView() {
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    bio: "",
    avatar_url: ""
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const response = await authService.getCurrentUser()
      
      if (response.data) {
        setUser(response.data)
        setFormData({
          full_name: response.data.full_name || "",
          email: response.data.email || "",
          bio: response.data.bio || "",
          avatar_url: response.data.avatar_url || ""
        })
        setAvatarPreview(response.data.avatar_url || "")
      }
    } catch (error) {
      console.error("加载用户信息失败:", error)
      toast({
        title: "加载失败",
        description: "无法加载用户信息，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        toast({
          title: "文件类型错误",
          description: "请选择图片文件",
          variant: "destructive"
        })
        return
      }

      // 检查文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "请选择小于5MB的图片",
          variant: "destructive"
        })
        return
      }

      setAvatarFile(file)
      
      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null

    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${authService.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('头像上传失败')
      }

      const result = await response.json()
      return result.url
    } catch (error) {
      console.error('头像上传失败:', error)
      toast({
        title: "头像上传失败",
        description: "请稍后重试",
        variant: "destructive"
      })
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let avatarUrl = formData.avatar_url

      // 如果有新的头像文件，先上传
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar()
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        } else {
          // 上传失败，停止保存
          setSaving(false)
          return
        }
      }

      // 更新用户信息
      const updateData = {
        full_name: formData.full_name,
        bio: formData.bio,
        avatar_url: avatarUrl
      }

      const response = await authService.updateProfile(updateData)
      
      if (response.data) {
        setUser(response.data)
        setFormData(prev => ({
          ...prev,
          avatar_url: response.data?.avatar_url || ""
        }))
        
        toast({
          title: "保存成功",
          description: "用户信息已更新"
        })
        
        // 清除头像文件状态
        setAvatarFile(null)
      }
    } catch (error) {
      console.error("保存用户信息失败:", error)
      toast({
        title: "保存失败",
        description: "无法保存用户信息，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleResetAvatar = () => {
    setAvatarPreview(user?.avatar_url || "")
    setAvatarFile(null)
    setFormData(prev => ({
      ...prev,
      avatar_url: user?.avatar_url || ""
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载用户信息中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">个人资料</h1>
        <p className="text-muted-foreground">管理您的个人信息和头像</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">基本信息</TabsTrigger>
          <TabsTrigger value="avatar">头像设置</TabsTrigger>
          <TabsTrigger value="account">账户设置</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>
                更新您的个人基本信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">姓名</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="请输入您的姓名"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      邮箱地址不可修改
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="介绍一下您自己..."
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.bio.length}/200 字符
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "保存中..." : "保存更改"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avatar">
          <Card>
            <CardHeader>
              <CardTitle>头像设置</CardTitle>
              <CardDescription>
                上传和设置您的个人头像
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview} alt="用户头像" />
                    <AvatarFallback className="text-2xl">
                      {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>选择图片</span>
                        </Button>
                      </Label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        aria-label="上传头像"
                        title="选择头像图片文件"
                      />
                    </div>
                    
                    {avatarFile && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          已选择: {avatarFile.name}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResetAvatar}
                        >
                          取消选择
                        </Button>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      支持 JPG、PNG 格式，最大 5MB
                    </p>
                  </div>
                </div>

                {avatarFile && (
                  <div className="flex justify-end">
                    <Button onClick={handleSubmit} disabled={saving}>
                      {saving ? "上传中..." : "上传头像"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>账户设置</CardTitle>
              <CardDescription>
                查看和管理您的账户信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>用户名</Label>
                    <p className="text-sm font-medium">{user?.username}</p>
                  </div>
                  
                  <div>
                    <Label>账户状态</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user?.is_active ? "default" : "secondary"}>
                        {user?.is_active ? "活跃" : "未激活"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label>注册时间</Label>
                    <p className="text-sm text-muted-foreground">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "未知"}
                    </p>
                  </div>
                  
                  <div>
                    <Label>最后更新</Label>
                    <p className="text-sm text-muted-foreground">
                      {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : "从未更新"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" onClick={() => authService.logout()}>
                    退出登录
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}