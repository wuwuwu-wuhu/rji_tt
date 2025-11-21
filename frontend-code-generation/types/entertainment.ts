import type { LucideIcon } from "lucide-react"

export type RecommendationCategory = "movie" | "book" | "activity" | "game"

export interface Recommendation {
  id: number
  type: RecommendationCategory
  title: string
  subtitle: string
  description: string
  rating: number
  image: string
  icon: LucideIcon
  color: string
  liked: boolean
}

export interface RecommendationInput {
  type: RecommendationCategory
  title: string
  subtitle: string
  description: string
}

