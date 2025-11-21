"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAiAssistant } from "@/contexts/ai-assistant-context"

const BUTTON_SIZE = 56
const MOBILE_NAV_GUTTER = 96

export function AiFloatingButton() {
  const { enabled, togglePanel, isPanelOpen } = useAiAssistant()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const dragStateRef = useRef({
    dragging: false,
    offsetX: 0,
    offsetY: 0,
  })
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const margin = 24
    if (typeof window === "undefined") return
    const initialX = window.innerWidth - BUTTON_SIZE - margin
    const initialY = window.innerHeight - BUTTON_SIZE - MOBILE_NAV_GUTTER
    setPosition({ x: initialX, y: initialY })
  }, [])

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!dragStateRef.current.dragging) return
      event.preventDefault()
      const margin = 12
      const offsetX = dragStateRef.current.offsetX
      const offsetY = dragStateRef.current.offsetY
      const nextX = Math.min(
        Math.max(margin, event.clientX - offsetX),
        window.innerWidth - BUTTON_SIZE - margin,
      )
      const nextY = Math.min(
        Math.max(margin, event.clientY - offsetY),
        window.innerHeight - BUTTON_SIZE - MOBILE_NAV_GUTTER,
      )
      setPosition({ x: nextX, y: nextY })
    }

    const handleUp = () => {
      dragStateRef.current.dragging = false
    }

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - BUTTON_SIZE - 12),
        y: Math.min(prev.y, window.innerHeight - BUTTON_SIZE - MOBILE_NAV_GUTTER),
      }))
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!enabled) return null

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const rect = buttonRef.current?.getBoundingClientRect()
    dragStateRef.current = {
      dragging: true,
      offsetX: rect ? event.clientX - rect.left : BUTTON_SIZE / 2,
      offsetY: rect ? event.clientY - rect.top : BUTTON_SIZE / 2,
    }
  }

  return (
    <button
      ref={buttonRef}
      onClick={() => {
        if (dragStateRef.current.dragging) return
        togglePanel()
      }}
      onPointerDown={handlePointerDown}
      className={cn(
        "fixed top-0 left-0 z-50 h-14 w-14 rounded-full bg-stone-900 text-white shadow-2xl flex items-center justify-center transition-transform active:scale-95",
        isPanelOpen && "bg-emerald-500",
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: "none",
      }}
      aria-label="AI 助手"
    >
      <Sparkles className="w-6 h-6" />
    </button>
  )
}

