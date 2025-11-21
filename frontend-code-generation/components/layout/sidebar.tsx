"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navItems } from "./nav-items"

export function Sidebar() {
  const pathname = usePathname()

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
    </div>
  )
}
