"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Maximize2, X, Send, Loader2 } from "lucide-react"
import { useAiAssistant } from "@/contexts/ai-assistant-context"
import { ai, ChatRequest, ChatResponse } from "@/lib/services/ai"
import { cn } from "@/lib/utils"

const MIN_WIDTH_RATIO = 0.25
const MAX_WIDTH_RATIO = 0.75
const FULLSCREEN_THRESHOLD = 0.92

export function AiPanel() {
  const { enabled, isPanelOpen, closePanel, panelWidth, setPanelWidth, isFullScreen, setIsFullScreen } =
    useAiAssistant()
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "嗨，我是你的 AI 助手，有什么需要帮忙的吗？" },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle')
  const [knowledgeBaseEnabled, setKnowledgeBaseEnabled] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [panelTransform, setPanelTransform] = useState({ x: 0, y: 0 })
  const dragPanelRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isFullScreen) {
      setPanelTransform({ x: 0, y: 0 })
    }
  }, [isFullScreen])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isPanelOpen) {
        closePanel()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isPanelOpen, closePanel])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 测试AI连接
  useEffect(() => {
    if (enabled && isPanelOpen && connectionStatus === 'idle') {
      testConnection()
    }
  }, [enabled, isPanelOpen, connectionStatus])

  // 获取知识库设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setKnowledgeBaseEnabled(settings.knowledgeBase ?? true)
      } catch (error) {
        console.error('解析设置失败:', error)
      }
    }
  }, [])

  const testConnection = async () => {
    setConnectionStatus('testing')
    try {
      // 🔍 AI面板连接测试的详细调试信息
      console.log('\n🔍 [AI面板] 开始测试AI连接...')
      console.log('   📊 当前连接状态:', connectionStatus)
      console.log('   🤖 AI面板启用状态:', enabled)
      console.log('   📱 面板打开状态:', isPanelOpen)
      
      const response = await ai.testConnection()
      console.log('\n📥 [AI面板] 收到连接测试响应:')
      console.log('   📦 响应数据:', response)
      console.log('   📊 响应状态:', response.status)
      console.log('   📝 响应消息:', response.message)
      
      if (response.data) {
        console.log('\n✅ [AI面板] 连接测试成功!')
        console.log('   🎉 更新连接状态为: connected')
        console.log('   🆔 生成新会话ID...')
        
        setConnectionStatus('connected')
        // 生成新的会话ID
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setSessionId(newSessionId)
        console.log('   🆔 新会话ID:', newSessionId)
        return true
      } else {
        console.log('\n❌ [AI面板] 连接测试失败!')
        const errorMessage = response.error || '连接测试失败'
        console.error('   💥 错误信息:', errorMessage)
        console.error('   📊 完整响应:', response)
        
        setConnectionStatus('error')
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: "assistant",
          content: `⚠️ AI服务连接测试失败: ${errorMessage}。请检查后端服务是否正在运行。`
        }])
        return false
      }
    } catch (error) {
      console.error('\n💥 [AI面板] 连接测试异常:')
      console.error('   🔍 错误类型:', error instanceof Error ? error.constructor.name : 'Unknown')
      console.error('   📝 错误消息:', error instanceof Error ? error.message : String(error))
      console.error('   📊 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息')
      
      setConnectionStatus('error')
      
      // 更详细的错误处理
      let errorMessage = 'AI服务连接失败'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // 如果是网络连接错误，提供更具体的提示
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('网络连接失败')) {
        errorMessage = '无法连接到后端服务，请确保后端服务正在运行（端口8000）'
      }
      
      console.log('   💬 显示错误消息给用户:', errorMessage)
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: `❌ ${errorMessage}。请检查网络连接和后端服务状态。`
      }])
      return false
    }
  }

  if (!enabled || !isPanelOpen) return null

  const handlePanelDragStart = (event: React.PointerEvent) => {
    if (isFullScreen) return
    if ((event.target as HTMLElement).closest("button")) return
    dragPanelRef.current = true
    const startX = event.clientX
    const startY = event.clientY
    const initial = { ...panelTransform }

    const handleMove = (moveEvent: PointerEvent) => {
      if (!dragPanelRef.current) return
      moveEvent.preventDefault()
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const panelWidthPx = panelRef.current?.offsetWidth ?? viewportWidth * panelWidth
      const panelHeightPx = panelRef.current?.offsetHeight ?? viewportHeight
      const maxX = Math.max(0, viewportWidth - panelWidthPx - 24)
      const maxY = Math.max(0, viewportHeight - panelHeightPx - 24)
      const newX = Math.min(Math.max(0, initial.x - deltaX), maxX)
      const newY = Math.min(Math.max(-40, initial.y + deltaY), Math.max(40, maxY))
      setPanelTransform({ x: newX, y: newY })
    }

    const handleUp = () => {
      dragPanelRef.current = false
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
  }

  const handlePointerDown = () => {
    if (isFullScreen) return
    draggingRef.current = true

    const cleanup = () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!draggingRef.current) return
      const viewportWidth = window.innerWidth
      const newWidthRatio = (viewportWidth - moveEvent.clientX) / viewportWidth
      if (newWidthRatio >= FULLSCREEN_THRESHOLD) {
        setIsFullScreen(true)
        draggingRef.current = false
        cleanup()
        return
      }
      const clamped = Math.min(Math.max(newWidthRatio, MIN_WIDTH_RATIO), MAX_WIDTH_RATIO)
      setPanelWidth(clamped)
    }

    const handlePointerUp = () => {
      draggingRef.current = false
      cleanup()
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setInput("")
    
    // 添加用户消息
    setMessages((prev) => [...prev, {
      id: Date.now(),
      role: "user",
      content: userMessage
    }])
    
    // 如果连接状态是错误，尝试重新连接
    if (connectionStatus === 'error') {
      const connectionResult = await testConnection()
      if (!connectionResult) {
        return
      }
    }
    
    setIsLoading(true)
    
    try {
      const chatRequest: ChatRequest = {
        message: userMessage,
        session_id: sessionId || undefined,
        use_knowledge_base: knowledgeBaseEnabled
      }
      
      // 🔍 AI聊天请求的详细调试信息
      console.log('\n🔍 [AI面板] 发送AI聊天请求:')
      console.log('   💬 用户消息:', userMessage)
      console.log('   🆔 会话ID:', sessionId || '新会话')
      console.log('   📦 完整请求对象:', chatRequest)
      console.log('   📊 当前连接状态:', connectionStatus)
      
      const response = await ai.sendMessage(chatRequest)
      console.log('\n📥 [AI面板] 收到AI聊天响应:')
      console.log('   📦 响应数据:', response)
      console.log('   📊 响应状态:', response.status)
      console.log('   🤖 AI回复:', response.data?.message)
      console.log('   🆔 响应会话ID:', response.data?.session_id)
      console.log('   🔢 Token使用:', response.data?.tokens_used)
      console.log('   🤖 使用的模型:', response.data?.model)
      
      if (response.data?.message) {
        console.log('\n✅ [AI面板] AI聊天成功!')
        console.log('   🤖 AI回复长度:', response.data.message.length, '字符')
        
        // 更新会话ID
        if (response.data.session_id && !sessionId) {
          console.log('   🆔 更新会话ID:', response.data.session_id)
          setSessionId(response.data.session_id)
        }
        
        // 添加AI回复
        const aiMessage = response.data.message
        setMessages((prev) => [...prev, {
          id: Date.now() + 1,
          role: "assistant",
          content: aiMessage
        }])
        
        console.log('   📊 更新连接状态为: connected')
        setConnectionStatus('connected')
      } else {
        // 检查是否有错误信息
        const errorMessage = response.error || '发送消息失败'
        console.error('\n❌ [AI面板] AI聊天响应错误:')
        console.error('   💥 错误信息:', errorMessage)
        console.error('   📊 完整响应:', response)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('\n💥 [AI面板] AI聊天异常:')
      console.error('   🔍 错误类型:', error instanceof Error ? error.constructor.name : 'Unknown')
      console.error('   📝 错误消息:', error instanceof Error ? error.message : String(error))
      console.error('   📊 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息')
      
      // 更详细的错误处理
      let errorMessage = '发送失败'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // 如果是网络连接错误，提供更具体的提示
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('网络连接失败')) {
        errorMessage = '网络连接失败，请检查后端服务是否正在运行（端口8000）'
      }
      
      console.log('   💬 显示错误消息给用户:', errorMessage)
      
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: `❌ ${errorMessage}。请稍后重试或点击"重试连接"按钮。`
      }])
      console.log('   📊 更新连接状态为: error')
      setConnectionStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-[2px]" onClick={closePanel} />
      <div
        ref={panelRef}
        className={cn(
          "absolute right-0 top-0 h-full bg-white shadow-2xl flex flex-col",
          "border-l border-stone-200 rounded-l-3xl overflow-hidden",
        )}
        style={{
          width: isFullScreen ? "100%" : `${panelWidth * 100}%`,
          transition: draggingRef.current ? "none" : "width 200ms ease, transform 200ms ease",
          transform: isFullScreen ? "none" : `translate(${-panelTransform.x}px, ${panelTransform.y}px)`,
        }}
      >
        <header
          className="p-4 flex items-center justify-between border-b border-stone-100 bg-[#fffdf5] cursor-move select-none"
          onPointerDown={handlePanelDragStart}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">AI Assistant</p>
            <h2 className="text-xl font-serif text-stone-900">灵感助手</h2>
          </div>
          <div className="flex items-center gap-2">
            {isFullScreen && (
              <button
                onClick={() => {
                  setIsFullScreen(false)
                  setPanelWidth(0.6)
                }}
                className="p-2 rounded-full bg-stone-100 text-stone-500 hover:text-stone-800"
                title="退出全屏"
              >
                <Maximize2 className="w-4 h-4 rotate-180" />
              </button>
            )}
            <button
              className="p-2 rounded-full bg-stone-100 text-stone-500 hover:text-stone-800"
              onClick={closePanel}
              title="关闭面板"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gradient-to-b from-white to-stone-50">
          {/* 连接状态指示器 */}
          {connectionStatus !== 'connected' && (
            <div className={cn(
              "text-xs px-3 py-2 rounded-full flex items-center gap-2",
              connectionStatus === 'testing' ? "bg-blue-50 text-blue-600" :
              connectionStatus === 'error' ? "bg-red-50 text-red-600" :
              "bg-gray-50 text-gray-600"
            )}>
              {connectionStatus === 'testing' && <Loader2 className="w-3 h-3 animate-spin" />}
              {connectionStatus === 'testing' && "正在连接AI服务..."}
              {connectionStatus === 'error' && "连接失败"}
              {connectionStatus === 'idle' && "准备连接"}
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                message.role === "assistant"
                  ? "bg-white border border-stone-100 text-stone-700"
                  : "bg-stone-900 text-white ml-auto",
              )}
            >
              {message.content}
            </div>
          ))}
          
          {/* 加载指示器 */}
          {isLoading && (
            <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm bg-white border border-stone-100 text-stone-700">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI正在思考...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-stone-100 bg-white flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={connectionStatus === 'connected' ? "输入内容，按 Enter 发送..." : "等待连接AI服务..."}
            disabled={connectionStatus !== 'connected' || isLoading}
            className={cn(
              "w-full rounded-2xl border bg-stone-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none",
              connectionStatus === 'connected' && !isLoading
                ? "border-stone-200 focus:ring-stone-200"
                : "border-stone-100 text-stone-400 cursor-not-allowed"
            )}
            rows={3}
          />
          <div className="flex justify-between items-center">
            {!isFullScreen && (
              <div
                className="flex items-center gap-2 text-xs text-stone-400"
                title="拖拽左侧边缘可调整大小"
              >
                <ArrowLeft className="w-3 h-3" />
                拖拽边缘可调整大小
              </div>
            )}
            <div className="flex items-center gap-2">
              {connectionStatus === 'error' && (
                <button
                  onClick={testConnection}
                  className="px-3 py-2 rounded-full bg-stone-100 text-stone-600 text-sm font-medium hover:bg-stone-200"
                >
                  重试连接
                </button>
              )}
              <button
                onClick={handleSend}
                disabled={!input.trim() || connectionStatus !== 'connected' || isLoading}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2",
                  input.trim() && connectionStatus === 'connected' && !isLoading
                    ? "bg-stone-900 text-white hover:bg-stone-800"
                    : "bg-stone-100 text-stone-400 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    发送中
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    发送
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {!isFullScreen && (
          <div
            className="absolute top-0 left-0 h-full w-2 cursor-col-resize group"
            onPointerDown={handlePointerDown}
          >
            <div className="absolute inset-y-6 left-0 w-1 rounded-full bg-stone-200 group-hover:bg-stone-400 transition-colors" />
          </div>
        )}
      </div>
    </div>
  )
}

