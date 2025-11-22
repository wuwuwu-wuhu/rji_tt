import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
import "./globals.css"
import { AppLayout } from "@/components/layout/app-layout"
import { AuthProvider } from "@/contexts/auth-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "LifeLog AI - 个人成长与生活管理",
  description: "温馨风格的个人成长与生活管理 APP",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-stone-50`}
        style={{
          backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <ErrorBoundary>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
