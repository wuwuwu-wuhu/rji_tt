"use client"

import Link from "next/link"
import { ChevronLeft, Save, Clock, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

export default function WriteDiaryPage() {
  const router = useRouter()

  const handleSave = () => {
    // In a real app, we would save the data here
    // For now, we just navigate back to the list
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FDFCF8]/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="p-2 -ml-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>

          <span className="font-semibold text-stone-800">写日记</span>

          <button
            onClick={handleSave}
            className="p-2 -mr-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
          >
            <Save className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Editor Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <div className="space-y-6">
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-stone-400">
            <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4" />
              <span>2025年11月20日</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4" />
              <span>14:30</span>
            </div>
          </div>

          {/* Title Input */}
          <input
            type="text"
            placeholder="标题 (可选)"
            className="w-full bg-transparent text-2xl font-bold text-stone-800 placeholder:text-stone-300 border-none focus:ring-0 p-0"
          />

          {/* Body Textarea with Lined Background */}
          <div className="relative min-h-[600px] bg-white shadow-sm rounded-lg overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "repeating-linear-gradient(transparent, transparent 39px, #94a3b8 40px)",
                backgroundAttachment: "local",
                marginTop: "40px",
                opacity: 0.4,
              }}
            />
            <textarea
              placeholder="记录每一个值得铭记的瞬间..."
              className="w-full h-full min-h-[600px] bg-transparent text-lg leading-[40px] text-stone-700 placeholder:text-stone-300 border-none focus:ring-0 p-0 resize-none font-medium px-6 py-2"
              style={{
                lineHeight: "40px",
                backgroundColor: "#fffdf5",
              }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
