"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import {
  Bell,
  Moon,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Smartphone,
  Globe,
  Database,
  HardDrive,
  Download,
  Upload,
  BrainCircuit,
  X,
  Check,
  Key,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useAiAssistant } from "@/contexts/ai-assistant-context"
import { useAuth } from "@/contexts/auth-context"
import { ai, AssistantConfig, AssistantConfigCreate } from "@/lib/services/ai"

type BooleanSettingKey = "knowledgeBase" | "darkMode" | "notifications"

export function SettingsView() {
  const [settings, setSettings] = useState({
    knowledgeBase: false,
    darkMode: false,
    notifications: true,
    storage: "local",
  })

  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [vendorUrl, setVendorUrl] = useState("https://api.openai.com/v1")
  const [modelName, setModelName] = useState("gpt-4o")
  const [isSaved, setIsSaved] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [connectionMessage, setConnectionMessage] = useState("")
  const [savedConfigs, setSavedConfigs] = useState<AssistantConfig[]>([])
  const [showConfigPicker, setShowConfigPicker] = useState(false)
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false)
  const [configToDelete, setConfigToDelete] = useState<number | null>(null)
  const [knowledgeSources, setKnowledgeSources] = useState({
    diary: true,
    schedule: false,
    goals: true,
    entertainment: false,
    study: false,
  })

  const { enabled: aiPanelEnabled, setEnabled: setAiPanelEnabled } = useAiAssistant()
  const { user, logout } = useAuth()

  // 加载已保存的配置
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const response = await ai.getAssistantConfigs()
        if (response.data) {
          setSavedConfigs(response.data)
        }
      } catch (error) {
        console.error('加载配置失败:', error)
      }
    }
    
    if (showApiKeyModal) {
      loadConfigs()
    }
  }, [showApiKeyModal])

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleTestConnection = async () => {
    if (!vendorUrl.trim() || !apiKey.trim()) {
      setConnectionStatus("error")
      setConnectionMessage("请填写供应商地址和API Key")
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("idle")
    setConnectionMessage("")

    try {
      // 通过后端API测试连接，传递配置信息
      const testConfig = {
        vendor_url: vendorUrl.trim(),
        api_key: apiKey.trim(),
        model: modelName.trim()
      }
      
      // 🔍 前端详细的服务商配置调试信息
      console.log('\n🔍 [前端测试连接] 服务商配置详情:')
      console.log('   🔗 供应商URL:', vendorUrl.trim())
      console.log('   🤖 模型名称:', modelName.trim())
      console.log('   🔑 API密钥状态:', apiKey.trim() ? '已设置' : '未设置')
      console.log('   📤 发送的完整配置:', testConfig)
      
      // 在终端打印更详细的信息
      console.log('\n🌐 [前端] 准备发送测试请求到后端:')
      console.log('   📍 API端点: /api/ai/test')
      console.log('   📋 请求方法: POST')
      console.log('   📦 请求体:', JSON.stringify(testConfig, null, 2))
      
      const token = localStorage.getItem('auth_token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      console.log('   🔐 认证令牌状态:', token ? '已设置' : '未设置')
      console.log('   🌐 后端API地址:', apiUrl)
      console.log('   📡 完整请求URL:', `${apiUrl}/api/ai/test`)
      
      const response = await fetch(`${apiUrl}/api/ai/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testConfig)
      })
      
      console.log('\n📥 [前端] 收到后端响应:')
      console.log('   📊 响应状态码:', response.status)
      console.log('   📝 响应状态文本:', response.statusText)
      console.log('   📋 响应头:', Object.fromEntries(response.headers.entries()))
      
      const result = await response.json()
      console.log('   📦 响应数据:', result)
      
      // 详细分析响应结果
      if (result.status === 'success') {
        console.log('\n✅ [前端] 测试连接成功!')
        console.log('   🤖 响应模型:', result.model)
        console.log('   📊 Token使用情况:', result.usage)
      } else {
        console.log('\n❌ [前端] 测试连接失败!')
        console.log('   💥 错误信息:', result.message)
      }
      
      if (result.status === "success") {
        setConnectionStatus("success")
        setConnectionMessage("连接成功！")
        console.log('\n🎉 [前端] UI状态更新为成功')
      } else {
        setConnectionStatus("error")
        setConnectionMessage(result.message || "连接失败")
        console.log('\n💥 [前端] UI状态更新为失败:', result.message)
      }
    } catch (error) {
      console.error('\n💥 [前端] 测试连接异常:', error)
      console.error('   🔍 错误类型:', error instanceof Error ? error.constructor.name : 'Unknown')
      console.error('   📝 错误消息:', error instanceof Error ? error.message : String(error))
      console.error('   📊 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息')
      
      setConnectionStatus("error")
      setConnectionMessage(`连接失败: ${error instanceof Error ? error.message : '网络错误'}`)
    } finally {
      setIsTestingConnection(false)
      console.log('\n🏁 [前端] 测试连接流程结束')
    }
  }

  const handleSaveModelConfig = async () => {
    if (!modelName.trim() || !vendorUrl.trim() || !apiKey.trim()) {
      setConnectionStatus("error")
      setConnectionMessage("请填写完整信息后再保存")
      return
    }

    try {
      const configData: AssistantConfigCreate = {
        name: `${modelName} 配置`,
        description: `供应商: ${vendorUrl}`,
        prompt: "你是一个有用的AI助手，请根据用户的问题提供准确、有帮助的回答。",
        model: modelName.trim(),
        temperature: "0.7",
        max_tokens: 2000,
        top_p: "1",
        frequency_penalty: "0",
        presence_penalty: "0",
        icon: "🤖",
        is_default: savedConfigs.length === 0, // 第一个配置设为默认
        is_active: true,
        config: {
          vendor_url: vendorUrl.trim(),
          api_key: apiKey.trim(),
        }
      }

      console.log('正在保存配置:', configData)
      
      const response = await ai.createAssistantConfig(configData)
      console.log('保存响应:', response)
      
      if (response.data) {
        setSavedConfigs((prev) => [response.data!, ...prev])
        setIsSaved(true)
        setConnectionStatus("success")
        setConnectionMessage("配置保存成功！")
        setTimeout(() => setIsSaved(false), 1200)
        
        // 清空表单
        setModelName("gpt-4o")
        setVendorUrl("https://api.openai.com/v1")
        setApiKey("")
      } else {
        const errorMessage = response.error || '保存失败'
        console.error('保存失败详情:', response)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('保存配置错误:', error)
      let errorMessage = '未知错误'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message
      }
      
      setConnectionStatus("error")
      setConnectionMessage(`保存失败: ${errorMessage}`)
    }
  }

  const handleSelectSavedConfig = (configId: number) => {
    const config = savedConfigs.find((item) => item.id === configId)
    if (!config) return
    
    setModelName(config.model)
    setVendorUrl(config.config?.vendor_url || "https://api.openai.com/v1")
    setApiKey(config.config?.api_key || "")
    setShowConfigPicker(false)
  }

  const handleSetDefaultConfig = async (configId: number) => {
    try {
      console.log('🔍 [设置] 设置默认配置:', configId)
      
      const response = await ai.setDefaultConfig(configId)
      console.log('📥 [设置] 设置默认配置响应:', response)
      
      if (response.data) {
        // 更新本地配置列表
        setSavedConfigs(prev => prev.map(config => ({
          ...config,
          is_default: config.id === configId
        })))
        
        setConnectionStatus("success")
        setConnectionMessage("默认配置设置成功！")
        setTimeout(() => {
          setConnectionStatus("idle")
          setConnectionMessage("")
        }, 2000)
        
        console.log('✅ [设置] 默认配置设置成功')
      } else {
        const errorMessage = response.error || '设置默认配置失败'
        console.error('❌ [设置] 设置默认配置失败:', errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('💥 [设置] 设置默认配置异常:', error)
      let errorMessage = '未知错误'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      setConnectionStatus("error")
      setConnectionMessage(`设置失败: ${errorMessage}`)
    }
  }

  const handleDeleteConfig = async (configId: number) => {
    try {
      console.log('🔍 [设置] 删除配置:', configId)
      
      const response = await ai.deleteAssistantConfig(configId)
      console.log('📥 [设置] 删除配置响应:', response)
      
      if (response.data) {
        // 从本地配置列表中移除
        setSavedConfigs(prev => prev.filter(config => config.id !== configId))
        
        setConnectionStatus("success")
        setConnectionMessage("配置删除成功！")
        setTimeout(() => {
          setConnectionStatus("idle")
          setConnectionMessage("")
        }, 2000)
        
        console.log('✅ [设置] 配置删除成功')
      } else {
        const errorMessage = response.error || '删除配置失败'
        console.error('❌ [设置] 删除配置失败:', errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('💥 [设置] 删除配置异常:', error)
      let errorMessage = '未知错误'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      setConnectionStatus("error")
      setConnectionMessage(`删除失败: ${errorMessage}`)
    }
  }

  const confirmDeleteConfig = (configId: number) => {
    setConfigToDelete(configId)
  }

  const cancelDeleteConfig = () => {
    setConfigToDelete(null)
  }

  const executeDeleteConfig = () => {
    if (configToDelete !== null) {
      handleDeleteConfig(configToDelete)
      setConfigToDelete(null)
    }
  }

  const handleExport = () => {
    alert("Data export started...")
  }

  const toggleBooleanSetting = (key: BooleanSettingKey) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const knowledgeOptions: Array<{ key: keyof typeof knowledgeSources; label: string; description: string }> = [
    { key: "diary", label: "日记", description: "个人心情与思考记录" },
    { key: "schedule", label: "课程表", description: "日程安排与时间表" },
    { key: "goals", label: "目标", description: "阶段性目标与进度" },
    { key: "study", label: "学习计划", description: "任务拆解与学习路径" },
    { key: "entertainment", label: "娱乐推荐", description: "兴趣偏好与打卡" },
  ]

  return (
    <div className="pb-20 md:pb-0 space-y-6">
      {/* Profile Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
            <AvatarImage src={user?.avatar_url || "/placeholder-user.jpg"} />
            <AvatarFallback className="bg-stone-200 text-stone-600 text-xl">
              {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-serif font-semibold text-stone-800 text-lg">
              {user?.full_name || user?.username || "用户名称"}
            </h3>
            <p className="text-stone-500 text-sm">{user?.email || "user@example.com"}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-stone-200 text-stone-600 bg-transparent hover:bg-stone-50"
          >
            编辑
          </Button>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="space-y-4">
        {/* AI & Knowledge Base Settings */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
          <div className="px-4 py-3 bg-stone-50/50 border-b border-stone-100">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider font-serif">AI 与知识库</h4>
          </div>

          <div className="divide-y divide-stone-100">
            <div
              className="flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors cursor-pointer"
              onClick={() => setShowApiKeyModal(true)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-stone-700 font-medium">模型连接</span>
                  <span className="text-xs text-stone-400">配置 OpenAI 兼容接口</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300" />
            </div>

            <div
              className="flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors cursor-pointer"
              onClick={() => setShowKnowledgePanel(true)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <Database className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-stone-700 font-medium">知识库开关</span>
                  <span className="text-xs text-stone-400">允许 AI 学习您的数据</span>
                </div>
              </div>
              <Switch
                checked={settings.knowledgeBase}
                onCheckedChange={(checked) => handleSettingChange("knowledgeBase", checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div
              className="flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors cursor-pointer"
              onClick={() => setAiPanelEnabled(!aiPanelEnabled)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-stone-700 font-medium">AI 弹窗</span>
                  <span className="text-xs text-stone-400">开启后可快速唤起聊天面板</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setAiPanelEnabled(!aiPanelEnabled)
                }}
                className={cn(
                  "relative flex items-center w-16 h-8 rounded-full border border-stone-800/50 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] transition-all",
                  aiPanelEnabled
                    ? "bg-gradient-to-r from-stone-900 to-stone-700 text-white"
                    : "bg-gradient-to-r from-stone-500 to-stone-300 text-white/60",
                )}
                title={aiPanelEnabled ? "关闭AI弹窗" : "开启AI弹窗"}
              >
                <span
                  className={cn(
                    "absolute inset-y-1 w-6 rounded-full bg-white shadow-lg transition-transform",
                    aiPanelEnabled ? "translate-x-7" : "translate-x-0",
                  )}
                />
                <span className={cn("relative flex-1 text-left pl-0.5", aiPanelEnabled && "text-white/70")}>OFF</span>
                <span className={cn("relative flex-1 text-right pr-0.5", aiPanelEnabled ? "text-white" : "text-white/80")}>ON</span>
              </button>
            </div>
          </div>
        </div>

        {showKnowledgePanel && (
          <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-stone-800">选择知识库数据源</p>
                <p className="text-xs text-stone-400 mt-1">勾选允许 AI 同步的页面内容</p>
              </div>
              <button
                onClick={() => setShowKnowledgePanel(false)}
                className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
                title="关闭知识库面板"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {knowledgeOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() =>
                    setKnowledgeSources((prev) => ({ ...prev, [option.key]: !prev[option.key] }))
                  }
                  className={cn(
                    "w-full flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
                    knowledgeSources[option.key]
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-stone-100 hover:border-stone-200",
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 mt-1 rounded-full border flex items-center justify-center text-[10px] font-bold",
                      knowledgeSources[option.key]
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-stone-300 text-transparent",
                    )}
                  >
                    ✓
                  </div>
                  <div>
                    <p className="font-medium text-sm text-stone-800">{option.label}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-stone-400">
                已同步 {Object.values(knowledgeSources).filter(Boolean).length} 个页面
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-full border-stone-200 text-stone-600"
                  onClick={() => {
                    setShowKnowledgePanel(false)
                  }}
                >
                  取消
                </Button>
                <Button
                  className="rounded-full"
                  onClick={() => {
                    if (!settings.knowledgeBase) {
                      handleSettingChange("knowledgeBase", true)
                    }
                    setShowKnowledgePanel(false)
                  }}
                >
                  保存设置
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Data & Storage Settings */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
          <div className="px-4 py-3 bg-stone-50/50 border-b border-stone-100">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider font-serif">数据与存储</h4>
          </div>

          <div className="divide-y divide-stone-100">
            <div className="flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <HardDrive className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">存储位置</span>
              </div>
              <Select value={settings.storage} onValueChange={(value) => handleSettingChange("storage", value)}>
                <SelectTrigger className="w-[100px] h-8 text-xs border-stone-200 bg-white">
                  <SelectValue placeholder="选择存储" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">本地</SelectItem>
                  <SelectItem value="cloud">云端</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              className="flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors cursor-pointer"
              onClick={handleExport}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <Download className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">导出数据</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300" />
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">导入数据</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300" />
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
          <div className="px-4 py-3 bg-stone-50/50 border-b border-stone-100">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider font-serif">应用设置</h4>
          </div>

          <div className="divide-y divide-stone-100">
            <div
              className="flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors cursor-pointer"
              onClick={() => toggleBooleanSetting("darkMode")}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <Moon className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">深色模式</span>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div
              className="flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors cursor-pointer"
              onClick={() => toggleBooleanSetting("notifications")}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">通知提醒</span>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">语言</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <span className="text-sm">简体中文</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Support */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
          <div className="px-4 py-3 bg-stone-50/50 border-b border-stone-100">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider font-serif">隐私与支持</h4>
          </div>

          <div className="divide-y divide-stone-100">
            <div className="flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">隐私安全</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300" />
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">帮助与反馈</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300" />
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">关于我们</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <span className="text-sm">v1.0.0</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 py-6 rounded-xl"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>

      {showApiKeyModal && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fffdf5] rounded-3xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl text-stone-800">模型连接配置</h3>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                  title="关闭配置面板"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              {!showConfigPicker ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700">供应商地址</label>
                    <Input
                      type="url"
                      placeholder="https://api.openai.com/v1"
                      value={vendorUrl}
                      onChange={(e) => setVendorUrl(e.target.value)}
                      className="bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                    />
                    <p className="text-xs text-stone-500">可填写自建代理或官方 API 地址。</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700">模型选择</label>
                    <Input
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      placeholder="如 gpt-4o, llama-3.1 等"
                      className="bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                    />
                    <p className="text-xs text-stone-500">请输入厂商提供的模型名称。</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700">API Key</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <Input
                        type="password"
                        placeholder="sk-..."
                        className="pl-9 bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-stone-500">请输入您的 OpenAI 格式 API Key，用于驱动 AI 功能。</p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={isTestingConnection}
                      className="rounded-full border-stone-300 text-stone-600"
                    >
                      {isTestingConnection ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          测试中...
                        </>
                      ) : (
                        "测试连接"
                      )}
                    </Button>
                    <Button
                      onClick={handleSaveModelConfig}
                      className={cn(
                        "rounded-full px-4 text-white",
                        isSaved ? "bg-emerald-500 hover:bg-emerald-600" : "bg-stone-800 hover:bg-stone-700",
                      )}
                    >
                      {isSaved ? (
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4" /> 已保存
                        </span>
                      ) : (
                        "保存模型配置"
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      className="rounded-full px-4 text-stone-700"
                      onClick={() => setShowConfigPicker(true)}
                      disabled={savedConfigs.length === 0}
                    >
                      选择配置好的模型
                    </Button>
                  </div>

                  <div className="min-h-[20px] text-xs text-stone-500">
                    {connectionStatus === "success" && (
                      <span className="text-emerald-500">{connectionMessage || "连接正常"}</span>
                    )}
                    {connectionStatus === "error" && (
                      <span className="text-rose-500">{connectionMessage || "连接失败"}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-stone-700">选择已保存的配置</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConfigPicker(false)}
                      className="rounded-full border-stone-200 text-stone-600"
                    >
                      返回配置
                    </Button>
                  </div>
                  
                  <div className="rounded-2xl border border-stone-100 bg-stone-50 p-3">
                    {savedConfigs.length === 0 ? (
                      <p className="text-xs text-stone-400 text-center">暂无已保存的模型配置</p>
                    ) : (
                      <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                        {savedConfigs.map((config) => (
                          <div
                            key={config.id}
                            className="rounded-xl bg-white px-3 py-2 border border-stone-100 hover:border-stone-200 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-stone-800">{config.name}</p>
                              {config.is_default && (
                                <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">默认</span>
                              )}
                            </div>
                            <p className="text-xs text-stone-400 truncate mb-1">{config.model}</p>
                            <p className="text-xs text-stone-300 truncate mb-2">{config.description}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSelectSavedConfig(config.id)}
                                className="flex-1 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-1 rounded transition-colors"
                              >
                                使用配置
                              </button>
                              {!config.is_default && (
                                <button
                                  onClick={() => handleSetDefaultConfig(config.id)}
                                  className="flex-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-2 py-1 rounded transition-colors"
                                >
                                  设为默认
                                </button>
                              )}
                              <button
                                onClick={() => confirmDeleteConfig(config.id)}
                                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                                title="删除配置"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="min-h-[20px] text-xs text-stone-500">
                    {connectionStatus === "success" && (
                      <span className="text-emerald-500">{connectionMessage || "连接正常"}</span>
                    )}
                    {connectionStatus === "error" && (
                      <span className="text-rose-500">{connectionMessage || "连接失败"}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {configToDelete && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-800">删除配置</h3>
                <p className="text-sm text-stone-500">此操作无法撤销</p>
              </div>
            </div>
            
            <p className="text-stone-600 mb-6">
              确定要删除这个模型配置吗？删除后将无法恢复。
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={cancelDeleteConfig}
                className="flex-1 rounded-full border-stone-200 text-stone-600"
              >
                取消
              </Button>
              <Button
                onClick={executeDeleteConfig}
                className="flex-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                确认删除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
