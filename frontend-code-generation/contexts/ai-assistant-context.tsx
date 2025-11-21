"use client"

import { createContext, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"

interface AiAssistantContextValue {
  enabled: boolean
  setEnabled: (value: boolean) => void
  isPanelOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
  panelWidth: number
  setPanelWidth: (value: number) => void
  isFullScreen: boolean
  setIsFullScreen: (value: boolean) => void
}

const AiAssistantContext = createContext<AiAssistantContextValue | undefined>(undefined)

export function AiAssistantProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelWidth, setPanelWidth] = useState(0.4)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const openPanel = () => {
    if (!enabled) return
    setIsPanelOpen(true)
  }

  const closePanel = () => {
    setIsPanelOpen(false)
    setIsFullScreen(false)
  }

  const togglePanel = () => {
    if (!enabled) return
    setIsPanelOpen((prev) => !prev)
    setIsFullScreen(false)
  }

  const value = useMemo(
    () => ({
      enabled,
      setEnabled,
      isPanelOpen,
      openPanel,
      closePanel,
      togglePanel,
      panelWidth,
      setPanelWidth,
      isFullScreen,
      setIsFullScreen,
    }),
    [enabled, isPanelOpen, panelWidth, isFullScreen],
  )

  return <AiAssistantContext.Provider value={value}>{children}</AiAssistantContext.Provider>
}

export function useAiAssistant() {
  const context = useContext(AiAssistantContext)
  if (!context) {
    throw new Error("useAiAssistant must be used within AiAssistantProvider")
  }
  return context
}

