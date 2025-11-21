"use client"

import { createContext, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { entertainmentSeed } from "@/data/entertainment"
import type { Recommendation, RecommendationCategory, RecommendationInput } from "@/types/entertainment"
import { BookOpen, Film, Gamepad2, MapPin } from "lucide-react"

interface RecommendationsContextValue {
  recommendations: Recommendation[]
  favorites: Recommendation[]
  toggleLike: (id: number) => void
  addRecommendation: (input: RecommendationInput) => void
}

const RecommendationsContext = createContext<RecommendationsContextValue | undefined>(undefined)

const typeVisualMap: Record<
  RecommendationCategory,
  { icon: Recommendation["icon"]; color: Recommendation["color"]; image: Recommendation["image"] }
> = {
  movie: { icon: Film, color: "text-purple-600", image: "bg-purple-100" },
  book: { icon: BookOpen, color: "text-amber-600", image: "bg-amber-100" },
  activity: { icon: MapPin, color: "text-emerald-600", image: "bg-emerald-100" },
  game: { icon: Gamepad2, color: "text-blue-600", image: "bg-blue-100" },
}

export function RecommendationsProvider({ children }: { children: ReactNode }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(entertainmentSeed)

  const toggleLike = (id: number) => {
    setRecommendations((prev) => prev.map((item) => (item.id === id ? { ...item, liked: !item.liked } : item)))
  }

  const addRecommendation = (input: RecommendationInput) => {
    const nextId = recommendations.reduce((max, item) => Math.max(max, item.id), 0) + 1
    const visual = typeVisualMap[input.type]

    setRecommendations((prev) => [
      ...prev,
      {
        id: nextId,
        type: input.type,
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        rating: 0,
        liked: false,
        ...visual,
      },
    ])
  }

  const favorites = useMemo(() => recommendations.filter((item) => item.liked), [recommendations])

  const value = useMemo(
    () => ({
      recommendations,
      favorites,
      toggleLike,
      addRecommendation,
    }),
    [recommendations, favorites],
  )

  return <RecommendationsContext.Provider value={value}>{children}</RecommendationsContext.Provider>
}

export function useRecommendations() {
  const context = useContext(RecommendationsContext)
  if (!context) {
    throw new Error("useRecommendations must be used within RecommendationsProvider")
  }
  return context
}

