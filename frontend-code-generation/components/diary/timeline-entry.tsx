import { Clock, Paperclip } from "lucide-react"
import Link from "next/link"

interface DiaryEntry {
  id: number | string
  title?: string
  body: string
  time?: string
}

interface TimelineEntryProps {
  date: {
    day: string
    month: string
    weekday: string
  }
  entries: DiaryEntry[]
}

export function TimelineEntry({ date, entries }: TimelineEntryProps) {
  return (
    <div className="flex gap-3 md:gap-6 mb-8 group items-start">
      {/* Date Column */}
      <div className="flex flex-col items-center shrink-0 w-14 pt-1">
        <div className="flex items-baseline justify-center bg-emerald-100/50 px-1.5 py-0.5 rounded-lg mb-1">
          <span className="text-2xl font-bold text-[#10B981] leading-none tracking-tighter">{date.day}</span>
          <span className="text-xs font-medium text-[#34D399] ml-0.5">/{date.month}月</span>
        </div>
        <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">{date.weekday}</span>
      </div>

      {/* Content Grid */}
      <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {entries.map((entry) => (
          <Link
            href={`/diary/write?id=${entry.id}`}
            key={entry.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden relative shrink-0 w-full block hover:shadow-md transition-shadow"
            style={{
              height: "220px",
            }}
          >
            <div
              className="w-full h-full px-3 py-3 relative"
              style={{
                backgroundImage: "repeating-linear-gradient(transparent, transparent 17px, #e5e7eb 18px)",
                backgroundAttachment: "local",
              }}
            >
              {/* Paper clip icon decoration */}
              <div className="absolute top-2 right-2 text-stone-300">
                <Paperclip className="w-3 h-3 rotate-45" />
              </div>

              <div className="mb-0.5 pr-4">
                {entry.title ? (
                  <h3 className="text-[10px] font-bold text-stone-800 leading-[18px] truncate">{entry.title}</h3>
                ) : (
                  <div className="h-[18px]" />
                )}
                {entry.time && (
                  <div className="flex items-center text-stone-400 text-[8px] font-medium absolute top-3.5 right-6">
                    <Clock className="w-2.5 h-2.5 mr-0.5" />
                    {entry.time}
                  </div>
                )}
              </div>

              <div className="prose prose-stone max-w-none">
                <p className="text-stone-600 text-[10px] leading-[18px] whitespace-pre-wrap font-medium">
                  {entry.body}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
