"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Heart, Star, Share2, Clock, Calendar, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Film, BookOpen, MapPin, Gamepad2 } from "lucide-react"

// Mock data - in a real app this would come from a database or API
const ITEMS = [
  {
    id: 1,
    type: "movie",
    title: "Everything Everywhere All At Once",
    subtitle: "Sci-fi / Adventure",
    description:
      "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save the existence by exploring other universes connecting with the lives she could have led. This mind-bending film explores themes of family, nihilism, and the multiverse with heart and humor.",
    rating: 4.8,
    image: "bg-purple-100",
    icon: Film,
    color: "text-purple-600",
    liked: false,
    duration: "2h 19m",
    releaseDate: "2022",
    tags: ["Action", "Comedy", "Fantasy"],
  },
  {
    id: 101,
    type: "movie",
    title: "Dune: Part Two",
    subtitle: "Sci-fi / Epic",
    description:
      "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    rating: 4.9,
    image: "bg-orange-100",
    icon: Film,
    color: "text-orange-600",
    liked: true,
    duration: "2h 46m",
    releaseDate: "2024",
    tags: ["Sci-Fi", "Adventure", "Drama"],
  },
  {
    id: 102,
    type: "movie",
    title: "Past Lives",
    subtitle: "Romance / Drama",
    description:
      "Nora and Hae Sung, two deeply connected childhood friends, are wrest apart after her family emigrates from South Korea. Two decades later, they are reunited in New York for one fateful week as they confront notions of destiny, love, and the choices that make a life.",
    rating: 4.7,
    image: "bg-blue-100",
    icon: Film,
    color: "text-blue-600",
    liked: false,
    duration: "1h 45m",
    releaseDate: "2023",
    tags: ["Romance", "Drama"],
  },
  {
    id: 103,
    type: "movie",
    title: "Oppenheimer",
    subtitle: "Biography / Drama",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    rating: 4.8,
    image: "bg-stone-200",
    icon: Film,
    color: "text-stone-700",
    liked: false,
    duration: "3h",
    releaseDate: "2023",
    tags: ["Biography", "History", "Drama"],
  },
  {
    id: 104,
    type: "movie",
    title: "Spider-Man: Across the Spider-Verse",
    subtitle: "Animation / Action",
    description:
      "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    rating: 4.9,
    image: "bg-red-100",
    icon: Film,
    color: "text-red-600",
    liked: true,
    duration: "2h 20m",
    releaseDate: "2023",
    tags: ["Animation", "Action", "Adventure"],
  },
  {
    id: 2,
    type: "book",
    title: "Atomic Habits",
    subtitle: "James Clear",
    description:
      "No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    rating: 4.9,
    image: "bg-amber-100",
    icon: BookOpen,
    color: "text-amber-600",
    liked: true,
    duration: "320 pages",
    releaseDate: "2018",
    tags: ["Self-help", "Psychology", "Productivity"],
  },
  {
    id: 201,
    type: "book",
    title: "Project Hail Mary",
    subtitle: "Andy Weir",
    description:
      "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.",
    rating: 4.8,
    image: "bg-indigo-100",
    icon: BookOpen,
    color: "text-indigo-600",
    liked: false,
    duration: "496 pages",
    releaseDate: "2021",
    tags: ["Sci-Fi", "Thriller"],
  },
  {
    id: 202,
    type: "book",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    subtitle: "Gabrielle Zevin",
    description:
      "Two friends—often in love, but never lovers—come together as creative partners in the world of video game design, where success brings them fame, joy, tragedy, duplicity, and, ultimately, a kind of immortality.",
    rating: 4.5,
    image: "bg-pink-100",
    icon: BookOpen,
    color: "text-pink-600",
    liked: false,
    duration: "416 pages",
    releaseDate: "2022",
    tags: ["Fiction", "Romance", "Contemporary"],
  },
  {
    id: 203,
    type: "book",
    title: "Thinking, Fast and Slow",
    subtitle: "Daniel Kahneman",
    description: "The major New York Times bestseller that explains the two systems that drive the way we think.",
    rating: 4.6,
    image: "bg-slate-100",
    icon: BookOpen,
    color: "text-slate-600",
    liked: true,
    duration: "499 pages",
    releaseDate: "2011",
    tags: ["Psychology", "Non-fiction", "Science"],
  },
  {
    id: 3,
    type: "activity",
    title: "Sunset Yoga at the Park",
    subtitle: "Outdoor / Wellness",
    description:
      "Join us for a relaxing evening of yoga as the sun sets. Perfect for beginners and experienced yogis alike. Bring your own mat and water bottle. This session focuses on mindfulness and gentle stretching to help you unwind after a busy week.",
    rating: 4.7,
    image: "bg-emerald-100",
    icon: MapPin,
    color: "text-emerald-600",
    liked: false,
    duration: "1 hour",
    releaseDate: "Every Friday",
    tags: ["Health", "Outdoor", "Social"],
  },
  {
    id: 301,
    type: "activity",
    title: "Pottery Workshop",
    subtitle: "Art / Creative",
    description:
      "Learn the basics of wheel throwing and hand building in this beginner-friendly pottery workshop. All materials included.",
    rating: 4.8,
    image: "bg-stone-100",
    icon: MapPin,
    color: "text-stone-600",
    liked: true,
    duration: "2 hours",
    releaseDate: "Sat & Sun",
    tags: ["Art", "Creative", "Workshop"],
  },
  {
    id: 302,
    type: "activity",
    title: "Weekend Hiking Group",
    subtitle: "Adventure / Social",
    description:
      "Join our local hiking group for a moderate 5-mile hike through the scenic trails. Great way to meet new people and get some exercise.",
    rating: 4.9,
    image: "bg-green-100",
    icon: MapPin,
    color: "text-green-700",
    liked: false,
    duration: "3 hours",
    releaseDate: "Every Saturday",
    tags: ["Hiking", "Nature", "Social"],
  },
  {
    id: 4,
    type: "game",
    title: "Stardew Valley",
    subtitle: "Simulation / RPG",
    description:
      "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life. Can you learn to live off the land and turn these overgrown fields into a thriving home? Build relationships with the locals and discover the secrets of the valley.",
    rating: 4.9,
    image: "bg-blue-100",
    icon: Gamepad2,
    color: "text-blue-600",
    liked: false,
    duration: "Endless",
    releaseDate: "2016",
    tags: ["Farming", "Relaxing", "Indie"],
  },
  {
    id: 401,
    type: "game",
    title: "Baldur's Gate 3",
    subtitle: "RPG / Adventure",
    description:
      "Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.",
    rating: 4.9,
    image: "bg-red-100",
    icon: Gamepad2,
    color: "text-red-700",
    liked: true,
    duration: "100+ hours",
    releaseDate: "2023",
    tags: ["RPG", "Strategy", "Fantasy"],
  },
  {
    id: 402,
    type: "game",
    title: "Hollow Knight",
    subtitle: "Action / Platformer",
    description:
      "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, battle tainted creatures and befriend bizarre bugs, all in a classic, hand-drawn 2D style.",
    rating: 4.8,
    image: "bg-slate-200",
    icon: Gamepad2,
    color: "text-slate-700",
    liked: false,
    duration: "30+ hours",
    releaseDate: "2017",
    tags: ["Metroidvania", "Indie", "Difficult"],
  },
  {
    id: 403,
    type: "game",
    title: "Animal Crossing",
    subtitle: "Simulation / Social",
    description:
      "Escape to a deserted island and create your own paradise as you explore, create, and customize in the Animal Crossing: New Horizons game.",
    rating: 4.7,
    image: "bg-teal-100",
    icon: Gamepad2,
    color: "text-teal-600",
    liked: true,
    duration: "Endless",
    releaseDate: "2020",
    tags: ["Simulation", "Relaxing", "Family"],
  },
]

export default function EntertainmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [item, setItem] = useState<any>(null)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    // In a real app, fetch data based on params.id
    const foundItem = ITEMS.find((i) => i.id === Number(params.id))
    if (foundItem) {
      setItem(foundItem)
      setLiked(foundItem.liked)
    }
  }, [params.id])

  if (!item) return null

  const Icon = item.icon

  return (
    <div className="min-h-screen bg-[#fffdf5] pb-20">
      {/* Header Image Area */}
      <div className={cn("h-64 w-full relative flex items-center justify-center", item.image)}>
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 p-2 bg-white/50 hover:bg-white rounded-full transition-colors backdrop-blur-sm z-10"
        >
          <ArrowLeft className="w-5 h-5 text-stone-800" />
        </button>

        <Icon className={cn("w-24 h-24 opacity-40", item.color)} />

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#fffdf5] to-transparent" />
      </div>

      {/* Content */}
      <div className="px-6 -mt-10 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <span
            className={cn(
              "text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white shadow-sm",
              item.color,
            )}
          >
            {item.type}
          </span>
          <div className="flex gap-2">
            <button className="p-2 bg-white rounded-full shadow-sm text-stone-600 hover:text-stone-900">
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="p-2 bg-white rounded-full shadow-sm text-stone-600 hover:text-rose-500 transition-colors"
            >
              <Heart className={cn("w-4 h-4", liked && "fill-rose-500 text-rose-500")} />
            </button>
          </div>
        </div>

        <h1 className="font-serif text-3xl text-stone-900 mb-2 leading-tight">{item.title}</h1>
        <p className="text-stone-500 font-medium mb-6">{item.subtitle}</p>

        {/* Stats Row */}
        <div className="flex items-center justify-between py-4 border-y border-stone-200 mb-6">
          <div className="flex flex-col items-center px-4 border-r border-stone-100 w-1/3">
            <div className="flex items-center gap-1 text-amber-500 mb-1">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold">{item.rating}</span>
            </div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wide">Rating</span>
          </div>
          <div className="flex flex-col items-center px-4 border-r border-stone-100 w-1/3">
            <div className="flex items-center gap-1 text-stone-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="font-bold text-sm">{item.duration}</span>
            </div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wide">Duration</span>
          </div>
          <div className="flex flex-col items-center px-4 w-1/3">
            <div className="flex items-center gap-1 text-stone-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="font-bold text-sm">{item.releaseDate}</span>
            </div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wide">Release</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="font-serif text-lg text-stone-800 mb-3">About</h3>
          <p className="text-stone-600 leading-relaxed text-sm">{item.description}</p>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <h3 className="font-serif text-lg text-stone-800 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-base font-medium shadow-lg shadow-stone-200">
          Start Now <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
