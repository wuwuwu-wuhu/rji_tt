"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { EntertainmentFeed } from "@/components/entertainment/entertainment-feed"

export default function EntertainmentPage() {
  return (
    <div className="container max-w-md mx-auto p-4 pb-24 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-stone-800">Discover</h1>
          <p className="text-stone-500 text-sm">Recommendations for you</p>
        </div>
        <Link
          href="/favorites"
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
        >
          <Heart className="w-4 h-4" />
          我的喜欢
        </Link>
      </header>

      <EntertainmentFeed />
    </div>
  )
}
