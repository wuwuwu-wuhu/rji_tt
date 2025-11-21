"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Heart, Star, RefreshCw, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRecommendations } from "@/contexts/recommendations-context"
import type { RecommendationCategory } from "@/types/entertainment"

interface EntertainmentFeedProps {
  showFavorites?: boolean
}

export function EntertainmentFeed({ showFavorites = false }: EntertainmentFeedProps) {
  const router = useRouter()
  const { recommendations, favorites, toggleLike, addRecommendation } = useRecommendations()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    type: "movie" as RecommendationCategory,
    title: "",
    subtitle: "",
    description: "",
  })

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      // In a real app, this would fetch new data
    }, 1000)
  }

  const handleAddItem = () => {
    addRecommendation(newItem)
    setIsAddModalOpen(false)
    setNewItem({ type: "movie", title: "", subtitle: "", description: "" })
  }

  const visibleRecommendations = useMemo(
    () => (showFavorites ? favorites : recommendations),
    [showFavorites, recommendations, favorites],
  )

  return (
    <div className="space-y-6 pb-20">
      <div className="p-6 bg-stone-800 rounded-2xl text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <h2 className="font-serif text-2xl mb-2">Weekend Vibes</h2>
          <p className="text-stone-300 text-sm mb-4">
            Based on your busy week, here are some relaxing activities for you.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-white text-stone-900 rounded-full text-sm font-medium hover:bg-stone-100 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Refreshing..." : "Get New Ideas"}
            </button>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <button className="px-4 py-2 bg-stone-700 text-white rounded-full text-sm font-medium hover:bg-stone-600 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Custom
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#fffdf5] sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl">Add Recommendation</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newItem.type}
                      onValueChange={(value) => setNewItem({ ...newItem, type: value as RecommendationCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="movie">Movie</SelectItem>
                        <SelectItem value="book">Book</SelectItem>
                        <SelectItem value="activity">Activity</SelectItem>
                        <SelectItem value="game">Game</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      placeholder="e.g. Inception"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subtitle">Subtitle / Genre</Label>
                    <Input
                      id="subtitle"
                      value={newItem.subtitle}
                      onChange={(e) => setNewItem({ ...newItem, subtitle: e.target.value })}
                      placeholder="e.g. Sci-Fi / Thriller"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Brief description..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddItem} className="bg-stone-900 text-white hover:bg-stone-800">
                    Add Item
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-600/20 rounded-full -ml-8 -mb-8 blur-xl" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {visibleRecommendations.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(`/entertainment/browse/${item.type}`)}
            className="group bg-white border border-stone-100 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
          >
            <div className={cn("h-32 w-full flex items-center justify-center relative transition-colors", item.image)}>
              <item.icon className={cn("w-10 h-10 opacity-50", item.color)} />
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleLike(item.id)
                }}
                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full text-stone-400 hover:text-rose-500 transition-colors"
              >
                <Heart className={cn("w-4 h-4", item.liked && "fill-rose-500 text-rose-500")} />
              </button>
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between mb-1">
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-100",
                    item.color,
                  )}
                >
                  {item.type}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-bold">{item.rating > 0 ? item.rating : "-"}</span>
                </div>
              </div>
              <h3 className="font-medium text-stone-800 text-sm line-clamp-1 font-serif">{item.title}</h3>
              <p className="text-xs text-stone-500 line-clamp-1">{item.subtitle}</p>
            </div>
          </div>
        ))}

        {!showFavorites && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center h-[200px] cursor-pointer hover:border-stone-400 hover:bg-stone-100 transition-all group">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-stone-400 group-hover:text-stone-600" />
                </div>
                <span className="text-sm font-medium text-stone-500 group-hover:text-stone-700">Add New</span>
              </div>
            </DialogTrigger>
          </Dialog>
        )}
      </div>

      {showFavorites && visibleRecommendations.length === 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-stone-500">
          还没有收藏，点击卡片右上角的心形即可加入“我的喜欢”。
        </div>
      )}
    </div>
  )
}
