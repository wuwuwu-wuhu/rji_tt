"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Maximize2, X } from "lucide-react"
import { useAiAssistant } from "@/contexts/ai-assistant-context"
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
  const panelRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [panelTransform, setPanelTransform] = useState({ x: 0, y: 0 })
  const dragPanelRef = useRef(false)

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

  const handleSend = () => {
    if (!input.trim()) return
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content: input.trim() }])
    setInput("")
    setTimeout(
      () =>
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", content: "这是一个示例回复，稍后可接入真实模型。" },
        ]),
      400,
    )
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
            <button className="p-2 rounded-full bg-stone-100 text-stone-500 hover:text-stone-800" onClick={closePanel}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gradient-to-b from-white to-stone-50">
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
        </div>

        <div className="p-4 border-t border-stone-100 bg-white flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入内容，按 Enter 发送..."
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 resize-none"
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
            <button
              onClick={handleSend}
              className="ml-auto px-4 py-2 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-800"
            >
              发送
            </button>
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

