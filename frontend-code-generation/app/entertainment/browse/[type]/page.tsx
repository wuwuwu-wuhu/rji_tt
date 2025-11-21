"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Heart, Star, Film, BookOpen, MapPin, Gamepad2, RefreshCw, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for different categories
const CATEGORY_DATA: Record<string, any[]> = {
  movie: [
    {
      id: 1,
      title: "Everything Everywhere All At Once",
      subtitle: "Sci-fi / Adventure",
      rating: 4.8,
      image: "bg-purple-100",
      icon: Film,
      color: "text-purple-600",
      liked: false,
    },
    {
      id: 101,
      title: "Dune: Part Two",
      subtitle: "Sci-fi / Epic",
      rating: 4.9,
      image: "bg-orange-100",
      icon: Film,
      color: "text-orange-600",
      liked: true,
    },
    {
      id: 102,
      title: "Past Lives",
      subtitle: "Romance / Drama",
      rating: 4.7,
      image: "bg-blue-100",
      icon: Film,
      color: "text-blue-600",
      liked: false,
    },
    {
      id: 103,
      title: "Oppenheimer",
      subtitle: "Biography / Drama",
      rating: 4.8,
      image: "bg-stone-200",
      icon: Film,
      color: "text-stone-700",
      liked: false,
    },
    {
      id: 104,
      title: "Spider-Man: Across the Spider-Verse",
      subtitle: "Animation / Action",
      rating: 4.9,
      image: "bg-red-100",
      icon: Film,
      color: "text-red-600",
      liked: true,
    },
  ],
  book: [
    {
      id: 2,
      title: "Atomic Habits",
      subtitle: "James Clear",
      rating: 4.9,
      image: "bg-amber-100",
      icon: BookOpen,
      color: "text-amber-600",
      liked: true,
    },
    {
      id: 201,
      title: "Project Hail Mary",
      subtitle: "Andy Weir",
      rating: 4.8,
      image: "bg-indigo-100",
      icon: BookOpen,
      color: "text-indigo-600",
      liked: false,
    },
    {
      id: 202,
      title: "Tomorrow, and Tomorrow, and Tomorrow",
      subtitle: "Gabrielle Zevin",
      rating: 4.5,
      image: "bg-pink-100",
      icon: BookOpen,
      color: "text-pink-600",
      liked: false,
    },
    {
      id: 203,
      title: "Thinking, Fast and Slow",
      subtitle: "Daniel Kahneman",
      rating: 4.6,
      image: "bg-slate-100",
      icon: BookOpen,
      color: "text-slate-600",
      liked: true,
    },
  ],
  activity: [
    {
      id: 3,
      title: "Sunset Yoga at the Park",
      subtitle: "Outdoor / Wellness",
      rating: 4.7,
      image: "bg-emerald-100",
      icon: MapPin,
      color: "text-emerald-600",
      liked: false,
    },
    {
      id: 301,
      title: "Pottery Workshop",
      subtitle: "Art / Creative",
      rating: 4.8,
      image: "bg-stone-100",
      icon: MapPin,
      color: "text-stone-600",
      liked: true,
    },
    {
      id: 302,
      title: "Weekend Hiking Group",
      subtitle: "Adventure / Social",
      rating: 4.9,
      image: "bg-green-100",
      icon: MapPin,
      color: "text-green-700",
      liked: false,
    },
  ],
  game: [
    {
      id: 4,
      title: "Stardew Valley",
      subtitle: "Simulation / RPG",
      rating: 4.9,
      image: "bg-blue-100",
      icon: Gamepad2,
      color: "text-blue-600",
      liked: false,
    },
    {
      id: 401,
      title: "Baldur's Gate 3",
      subtitle: "RPG / Adventure",
      rating: 4.9,
      image: "bg-red-100",
      icon: Gamepad2,
      color: "text-red-700",
      liked: true,
    },
    {
      id: 402,
      title: "Hollow Knight",
      subtitle: "Action / Platformer",
      rating: 4.8,
      image: "bg-slate-200",
      icon: Gamepad2,
      color: "text-slate-700",
      liked: false,
    },
    {
      id: 403,
      title: "Animal Crossing",
      subtitle: "Simulation / Social",
      rating: 4.7,
      image: "bg-teal-100",
      icon: Gamepad2,
      color: "text-teal-600",
      liked: true,
    },
  ],
}

export default function BrowsePage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as string
  const baseItems = useMemo(() => CATEGORY_DATA[type] || [], [type])
  const [items, setItems] = useState(baseItems)
  const [featuredItem, setFeaturedItem] = useState(baseItems[0])
  const [page, setPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartRef = useRef<number | null>(null)
  const loadingRef = useRef(false)
  const refreshingRef = useRef(false)

  useEffect(() => {
    setItems(baseItems)
    setFeaturedItem(baseItems[0])
    setPage(1)
  }, [baseItems])

  const createPageItems = useCallback(
    (pageIndex: number) =>
      baseItems.map((item) => ({
        ...item,
        id: pageIndex * 1000 + item.id,
        title: `${item.title} · ${pageIndex}`,
        liked: false,
      })),
    [baseItems],
  )

  const handleLoadMore = useCallback(() => {
    if (loadingRef.current || baseItems.length === 0) return
    loadingRef.current = true
    setIsLoadingMore(true)
    const nextPage = page + 1
    setTimeout(() => {
      setItems((prev) => [...prev, ...createPageItems(nextPage)])
      setPage(nextPage)
      setIsLoadingMore(false)
      loadingRef.current = false
    }, 800)
  }, [baseItems.length, createPageItems, page])

  const handleRefresh = useCallback(() => {
    if (refreshingRef.current || baseItems.length === 0) return
    refreshingRef.current = true
    setIsRefreshing(true)
    setTimeout(() => {
      const shuffled = [...baseItems].sort(() => Math.random() - 0.5)
      setItems(shuffled)
      setFeaturedItem(shuffled[0])
      setPage(1)
      setIsRefreshing(false)
      refreshingRef.current = false
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 700)
  }, [baseItems])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120) {
        handleLoadMore()
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleLoadMore])

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartRef.current = event.touches[0]?.clientY ?? null
      } else {
        touchStartRef.current = null
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartRef.current === null) return
      const currentY = event.touches[0]?.clientY ?? 0
      const distance = currentY - touchStartRef.current
      if (distance > 0) {
        setPullDistance(distance)
        if (distance > 90) {
          handleRefresh()
          touchStartRef.current = null
          setPullDistance(0)
        }
      }
    }

    const handleTouchEnd = () => {
      touchStartRef.current = null
      setPullDistance(0)
    }

    window.addEventListener("touchstart", handleTouchStart)
    window.addEventListener("touchmove", handleTouchMove)
    window.addEventListener("touchend", handleTouchEnd)
    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleRefresh])

  if (!featuredItem) return null

  const FeaturedIcon = featuredItem.icon
  const pullHintActive = pullDistance > 20 && !isRefreshing

  return (
    <div className="min-h-screen bg-[#fffdf5] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#fffdf5]/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 border-b border-stone-100">
        <button onClick={() => router.back()} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <h1 className="font-serif text-xl capitalize text-stone-800">{type}s</h1>
      </div>

      <div className="p-4 space-y-8">
        {(isRefreshing || pullHintActive) && (
          <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
            {isRefreshing ? (
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> 正在刷新…
              </span>
            ) : (
              <span>{pullDistance > 90 ? "释放刷新" : "下拉刷新获取最新内容"}</span>
            )}
          </div>
        )}

        {/* Featured Hero Section */}
        <div
          onClick={() => router.push(`/entertainment/${featuredItem.id}`)}
          className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
        >
          <div
            className={cn(
              "absolute inset-0 transition-transform duration-500 group-hover:scale-105",
              featuredItem.image,
            )}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <FeaturedIcon className={cn("w-20 h-20 opacity-20", featuredItem.color)} />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-white/20 backdrop-blur rounded text-[10px] font-bold uppercase tracking-wider">
                Featured
              </span>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-bold">{featuredItem.rating}</span>
              </div>
            </div>
            <h2 className="font-serif text-2xl mb-1">{featuredItem.title}</h2>
            <p className="text-white/80 text-sm line-clamp-1">{featuredItem.subtitle}</p>
          </div>
        </div>

        {/* Recommended Grid */}
        <div>
          <h3 className="font-serif text-lg text-stone-800 mb-4">Recommended for You</h3>
          <div className="grid grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/entertainment/${item.id}`)}
                className="group cursor-pointer"
              >
                <div className={cn("aspect-[4/3] rounded-xl mb-2 relative overflow-hidden", item.image)}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <item.icon className={cn("w-8 h-8 opacity-40", item.color)} />
                  </div>
                  <button className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full text-stone-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Heart className={cn("w-3 h-3", item.liked && "fill-rose-500 text-rose-500")} />
                  </button>
                </div>
                <h4 className="font-medium text-stone-800 text-sm line-clamp-1 leading-tight mb-0.5 group-hover:text-stone-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-stone-500 line-clamp-1">{item.subtitle}</p>
              </div>
            ))}
          </div>
          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2 text-sm text-stone-400 mt-4">
              <Loader2 className="w-4 h-4 animate-spin" /> 加载更多中…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
