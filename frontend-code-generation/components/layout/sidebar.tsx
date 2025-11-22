"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navItems } from "./nav-items"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <div className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-white/80 backdrop-blur-sm z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight">LifeLog AI</h1>
        <p className="text-xs text-stone-500 mt-1">记录生活，规划未来</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium",
                isActive ? "bg-stone-100 text-stone-900" : "text-stone-500 hover:bg-stone-50 hover:text-stone-900",
              )}
            >
              {/* Monochrome icons as requested */}
              <Icon className="w-5 h-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>
      
      {/* 用户信息和登出 */}
      <div className="p-4 border-t border-stone-200">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar_url} alt={user?.username} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-900 truncate">
              {user?.full_name || user?.username}
            </p>
            <p className="text-xs text-stone-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-stone-500 hover:text-stone-900 hover:bg-stone-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          登出
        </Button>
      </div>
    </div>
  )
}
