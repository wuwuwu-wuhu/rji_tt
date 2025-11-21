"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Heart, Sparkles, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRecommendations } from "@/contexts/recommendations-context"
import type { RecommendationCategory } from "@/types/entertainment"

const FILTERS: Array<{ label: string; value: RecommendationCategory | "all" }> = [
  { label: "全部", value: "all" },
  { label: "电影", value: "movie" },
  { label: "好书", value: "book" },
  { label: "活动", value: "activity" },
  { label: "游戏", value: "game" },
]

export default function FavoritesPage() {
  const { favorites, toggleLike } = useRecommendations()
  const [activeFilter, setActiveFilter] = useState<RecommendationCategory | "all">("all")

  const filteredFavorites = useMemo(() => {
    if (activeFilter === "all") return favorites
    return favorites.filter((item) => item.type === activeFilter)
  }, [favorites, activeFilter])

  const stats = useMemo(() => {
    return [
      { label: "电影", value: favorites.filter((item) => item.type === "movie").length, accent: "text-purple-600" },
      { label: "书籍", value: favorites.filter((item) => item.type === "book").length, accent: "text-amber-600" },
      { label: "活动", value: favorites.filter((item) => item.type === "activity").length, accent: "text-emerald-600" },
      { label: "游戏", value: favorites.filter((item) => item.type === "game").length, accent: "text-blue-600" },
    ]
  }, [favorites])

  if (favorites.length === 0) {
    return (
      <div className="container max-w-md mx-auto p-6 pb-24 space-y-6 text-center">
        <div className="rounded-3xl border border-dashed border-stone-200 bg-white/70 p-10 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center">
            <Heart className="w-7 h-7 text-rose-500" />
          </div>
          <h1 className="text-2xl font-serif text-stone-900">收藏夹空空如也</h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            还没有心动的内容。去娱乐频道探索，点击卡片右上角的心形，即可加入“我的喜欢”。
          </p>
          <Link
            href="/entertainment"
            className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            去探索灵感
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto p-4 pb-24 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-stone-900">我的喜欢</h1>
          <p className="text-stone-500 text-sm">随时回顾让你怦然心动的瞬间</p>
        </div>
        <Link
          href="/entertainment"
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4" />
          返回探索
        </Link>
      </header>

      {/* Highlight card */}
      <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 text-white p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Curated by you</p>
            <h2 className="text-3xl font-serif mt-1">{favorites.length}</h2>
            <p className="text-sm text-white/70">已收藏的灵感</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <Heart className="w-7 h-7 text-rose-300" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/60">{stat.label}</p>
              <p className={cn("text-xl font-serif mt-1", stat.accent)}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border transition-all",
              activeFilter === filter.value
                ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                : "border-stone-200 text-stone-500 hover:bg-stone-50",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Favorites list */}
      <div className="space-y-4">
        {filteredFavorites.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-stone-100 bg-white shadow-sm p-4 flex gap-4 hover:border-stone-200 transition-colors"
          >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0", item.image)}>
              <item.icon className={cn("w-7 h-7 opacity-70", item.color)} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-400">{item.type}</p>
                  <h3 className="text-lg font-serif text-stone-900 leading-tight">{item.title}</h3>
                  <p className="text-sm text-stone-500">{item.subtitle}</p>
                </div>
                <button
                  onClick={() => toggleLike(item.id)}
                  className="p-2 rounded-full border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
                  title="移出喜欢"
                >
                  <Heart className="w-4 h-4 fill-rose-500" />
                </button>
              </div>
              <p className="text-sm text-stone-600 line-clamp-3">{item.description}</p>
              <div className="flex items-center justify-between text-xs text-stone-400">
                <div className="flex items-center gap-1 text-amber-500 font-medium">
                  <Star className="w-3 h-3 fill-current" />
                  {item.rating}
                </div>
                <Link
                  href={`/entertainment/${item.id}`}
                  className="text-stone-500 hover:text-stone-800 font-medium text-[11px] uppercase tracking-wide"
                >
                  查看详情 →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-3xl bg-[#fffdf5] border border-amber-100 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-serif text-stone-800">继续探索你的灵感宇宙</p>
          <p className="text-xs text-stone-500 mt-1">AI 会根据你的收藏来调整推荐</p>
        </div>
        <Link
          href="/entertainment"
          className="inline-flex items-center gap-1 rounded-full bg-stone-900 text-white px-4 py-2 text-xs font-medium hover:bg-stone-800"
        >
          <Sparkles className="w-3.5 h-3.5" />
          继续发现
        </Link>
      </div>
    </div>
  )
}

