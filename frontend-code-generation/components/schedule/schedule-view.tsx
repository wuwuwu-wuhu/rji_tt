"use client"

import { useState, Fragment } from "react"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 to 20:00

const getStartOfWeek = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  return new Date(d.setDate(diff))
}

const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()
}

const formatDateRange = (start: Date, end: Date) => {
  const startMonth = start.toLocaleString("default", { month: "short" })
  const endMonth = end.toLocaleString("default", { month: "short" })

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} - ${end.getDate()}`
  }
  return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`
}

interface ScheduleItem {
  id: string
  day: number
  start: number
  duration: number
  title: string
  color: string
}

export function ScheduleView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)

  const startOfWeek = getStartOfWeek(currentDate)
  const endOfWeek = addDays(startOfWeek, 6)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i))

  const handlePreviousWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7))
  }

  // Form state
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    day: 0,
    start: 9,
    duration: 1,
    title: "",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  })

  // Mock data for schedule items
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: "1",
      day: 0,
      start: 9,
      duration: 2,
      title: "Mathematics",
      color: "bg-orange-100 text-orange-700 border-orange-200",
    },
    {
      id: "2",
      day: 1,
      start: 14,
      duration: 1.5,
      title: "English Literature",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      id: "3",
      day: 2,
      start: 10,
      duration: 2,
      title: "Computer Science",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    {
      id: "4",
      day: 3,
      start: 13,
      duration: 1,
      title: "Gym",
      color: "bg-rose-100 text-rose-700 border-rose-200",
    },
    {
      id: "5",
      day: 4,
      start: 9,
      duration: 3,
      title: "Physics Lab",
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
  ])

  const handleAddItem = () => {
    setEditingItem(null)
    setFormData({
      day: 0,
      start: 9,
      duration: 1,
      title: "",
      color: "bg-orange-100 text-orange-700 border-orange-200",
    })
    setIsModalOpen(true)
  }

  const handleEditItem = (item: ScheduleItem) => {
    setEditingItem(item)
    setFormData(item)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (editingItem) {
      setScheduleItems((prev) =>
        prev.map((item) => (item.id === editingItem.id ? ({ ...item, ...formData } as ScheduleItem) : item)),
      )
    } else {
      const newItem = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as ScheduleItem
      setScheduleItems((prev) => [...prev, newItem])
    }
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    if (editingItem) {
      setScheduleItems((prev) => prev.filter((item) => item.id !== editingItem.id))
      setIsModalOpen(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-xl border border-stone-200 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between p-3 border-b border-stone-100 shrink-0">
        <h2 className="font-serif text-base text-stone-800">Weekly Schedule</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePreviousWeek}
            className="p-1 hover:bg-stone-100 rounded-full text-stone-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-stone-600 min-w-[80px] text-center">
            {formatDateRange(startOfWeek, endOfWeek)}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-1 hover:bg-stone-100 rounded-full text-stone-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {/* </CHANGE> */}
          <button onClick={handleAddItem} className="ml-1 p-1 bg-stone-800 text-white rounded-full hover:bg-stone-700">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-[2.5rem_repeat(7,1fr)] w-full">
          {/* Header Row */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-stone-100 p-1 text-[10px] font-medium text-stone-400 text-center flex items-end justify-center pb-2">
            Time
          </div>
          {DAYS.map((day, i) => {
            const date = weekDates[i]
            const isToday = isSameDay(date, new Date())
            return (
              <div
                key={day}
                className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-stone-100 py-2 text-center"
              >
                <div className="text-[9px] uppercase tracking-wider font-medium text-stone-500">{day}</div>
                <div
                  className={cn(
                    "text-[10px] font-bold mt-0.5 w-5 h-5 mx-auto flex items-center justify-center rounded-full transition-colors",
                    isToday ? "bg-stone-800 text-white" : "text-stone-700",
                  )}
                >
                  {date.getDate()}
                </div>
              </div>
            )
          })}
          {/* </CHANGE> */}

          {/* Time Slots */}
          {TIME_SLOTS.map((hour) => (
            <Fragment key={`time-slot-${hour}`}>
              <div
                className="border-r border-stone-100 p-1 text-[9px] text-stone-400 text-center h-12 relative"
              >
                <span className="absolute -top-2 left-0 right-0">{hour}:00</span>
              </div>
              {DAYS.map((_, dayIndex) => {
                const item = scheduleItems.find((item) => item.day === dayIndex && Math.floor(item.start) === hour)
                return (
                  <div
                    key={`slot-${dayIndex}-${hour}`}
                    className="border-r border-b border-stone-50 border-dashed h-12 relative p-[1px]"
                  >
                    {item && (
                      <button
                        onClick={() => handleEditItem(item)}
                        className={cn(
                          "absolute top-[1px] left-[1px] right-[1px] rounded-[3px] p-1 text-[9px] border shadow-sm z-10 flex flex-col gap-0 leading-tight overflow-hidden text-left w-full hover:opacity-90 transition-opacity",
                          item.color,
                        )}
                        style={{ height: `calc(${item.duration * 3}rem - 2px)` }}
                      >
                        <span className="font-semibold truncate w-full">{item.title}</span>
                        <span className="opacity-80 text-[8px] truncate w-full">
                          {item.start}-{item.start + item.duration}
                        </span>
                      </button>
                    )}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[300px] p-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-stone-800">{editingItem ? "Edit Class" : "Add Class"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-500 block mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-sm border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  placeholder="Class Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-stone-500 block mb-1">Day</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: Number.parseInt(e.target.value) })}
                    className="w-full text-sm border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  >
                    {DAYS.map((day, i) => (
                      <option key={day} value={i}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 block mb-1">Start Time</label>
                  <select
                    value={formData.start}
                    onChange={(e) => setFormData({ ...formData, start: Number.parseInt(e.target.value) })}
                    className="w-full text-sm border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  >
                    {TIME_SLOTS.map((time) => (
                      <option key={time} value={time}>
                        {time}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 block mb-1">Duration (hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number.parseFloat(e.target.value) })}
                  className="w-full text-sm border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {editingItem && (
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-50 text-red-600 text-xs font-medium py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className="flex-1 bg-stone-800 text-white text-xs font-medium py-2 rounded-lg hover:bg-stone-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
