"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { cn } from "@/lib/utils"
import { RecommendationsProvider } from "@/contexts/recommendations-context"
import { AiAssistantProvider } from "@/contexts/ai-assistant-context"
import { AiFloatingButton } from "@/components/ai/ai-floating-button"
import { AiPanel } from "@/components/ai/ai-panel"
import { ProtectedRoute } from "@/contexts/auth-context"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isWritePage = pathname === "/diary/write"
  const isAuthPage = pathname?.startsWith('/auth')

  // 认证页面不需要侧边栏和导航
  if (isAuthPage) {
    return (
      <AiAssistantProvider>
        <RecommendationsProvider>
          {children}
        </RecommendationsProvider>
      </AiAssistantProvider>
    )
  }

  return (
    <AiAssistantProvider>
      <RecommendationsProvider>
        <ProtectedRoute>
          {!isWritePage && <Sidebar />}
          <main className={cn("min-h-screen pb-20 md:pb-0", !isWritePage && "md:pl-64")}>{children}</main>
          {!isWritePage && <MobileNav />}
          <AiFloatingButton />
          <AiPanel />
        </ProtectedRoute>
      </RecommendationsProvider>
    </AiAssistantProvider>
  )
}
