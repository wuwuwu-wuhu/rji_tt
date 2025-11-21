"use client"

import { useState } from "react"
import Link from "next/link"
import { Flag, Target, Trophy, Plus, X, Trash2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Goal {
  id: number
  title: string
  deadline: string
  startDate: string
  progress: number
}

interface GoalsState {
  longTerm: Goal[]
  midTerm: Goal[]
  shortTerm: Goal[]
}

export function GoalsBoard() {
  const [goals, setGoals] = useState<GoalsState>({
    longTerm: [
      { id: 1, title: "Become a Senior Developer", deadline: "2026-12-31", startDate: "2024-01-01", progress: 40 },
      { id: 2, title: "Buy a House", deadline: "2028-06-01", startDate: "2025-01-01", progress: 15 },
    ],
    midTerm: [
      { id: 3, title: "Master Next.js & React Native", deadline: "2025-12-31", startDate: "2025-01-15", progress: 70 },
      { id: 4, title: "Read 20 Books", deadline: "2025-12-31", startDate: "2025-02-01", progress: 45 },
    ],
    shortTerm: [
      { id: 5, title: "Complete Portfolio Website", deadline: "2025-11-30", startDate: "2025-11-01", progress: 85 },
      { id: 6, title: "Gym 3x/Week", deadline: "2025-11-24", startDate: "2025-11-18", progress: 33 },
    ],
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    deadline: "",
    startDate: "",
    type: "shortTerm" as keyof GoalsState,
  })
  const [goalToDelete, setGoalToDelete] = useState<{ type: keyof GoalsState; id: number } | null>(null)

  const confirmDelete = () => {
    if (!goalToDelete) return
    setGoals((prev) => ({
      ...prev,
      [goalToDelete.type]: prev[goalToDelete.type].filter((g) => g.id !== goalToDelete.id),
    }))
    setGoalToDelete(null)
  }

  const addGoal = () => {
    if (!newGoal.title) return
    const goal: Goal = {
      id: Date.now(),
      title: newGoal.title,
      deadline: newGoal.deadline || "No deadline",
      startDate: newGoal.startDate || new Date().toISOString().split("T")[0],
      progress: 0,
    }
    setGoals((prev) => ({
      ...prev,
      [newGoal.type]: [...prev[newGoal.type], goal],
    }))
    setNewGoal({ title: "", deadline: "", startDate: "", type: "shortTerm" })
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-10 relative pb-20">
      <div className="flex items-end justify-between border-b border-stone-200 pb-4">
        <div>
          <h2 className="font-serif text-4xl font-bold text-stone-800 tracking-tight">Goals</h2>
          <p className="text-stone-500 mt-1 font-serif italic">Track your journey & milestones</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-2 px-4 py-2 bg-stone-800 text-stone-50 rounded-full hover:bg-stone-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <span className="text-sm font-medium">New Goal</span>
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* Long Term */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-stone-800">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-serif text-xl font-semibold">Long Term Vision</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.longTerm.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              variant="amber"
              onDelete={() => setGoalToDelete({ type: "longTerm", id: goal.id })}
            />
          ))}
        </div>
      </section>

      {/* Mid Term */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-stone-800">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Flag className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-serif text-xl font-semibold">Yearly Milestones</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.midTerm.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              variant="blue"
              onDelete={() => setGoalToDelete({ type: "midTerm", id: goal.id })}
            />
          ))}
        </div>
      </section>

      {/* Short Term */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-stone-800">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Target className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-serif text-xl font-semibold">Monthly Focus</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.shortTerm.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              variant="emerald"
              onDelete={() => setGoalToDelete({ type: "shortTerm", id: goal.id })}
            />
          ))}
        </div>
      </section>

      {goalToDelete && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-800 mb-2">Delete Goal?</h3>
              <p className="text-sm text-stone-500">
                Are you sure you want to delete this goal? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setGoalToDelete(null)}
                className="flex-1 px-4 py-2 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fffdf5] rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 border border-stone-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-stone-800">New Goal</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-stone-200 text-stone-800"
                  placeholder="e.g., Learn Python"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={newGoal.startDate}
                    onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                    className="w-full p-3 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-stone-200 text-stone-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Target Date</label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="w-full p-3 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-stone-200 text-stone-800 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["shortTerm", "midTerm", "longTerm"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewGoal({ ...newGoal, type })}
                      className={cn(
                        "p-2 rounded-lg text-xs font-medium transition-colors border",
                        newGoal.type === type
                          ? "bg-stone-800 text-white border-stone-800"
                          : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50",
                      )}
                    >
                      {type === "shortTerm" ? "Short" : type === "midTerm" ? "Mid" : "Long"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-stone-500 hover:bg-stone-100 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addGoal}
                className="px-5 py-2.5 bg-stone-800 text-[#fffdf5] rounded-xl hover:bg-stone-700 transition-colors font-medium shadow-lg shadow-stone-200"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GoalCard({
  goal,
  variant,
  onDelete,
}: {
  goal: Goal
  variant: "amber" | "blue" | "emerald"
  onDelete: () => void
}) {
  const getBackgroundStyle = () => {
    const today = new Date()
    const start = new Date(goal.startDate)
    const diffTime = start.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const colors = {
      amber: { r: 251, g: 191, b: 36 }, // amber-400
      blue: { r: 96, g: 165, b: 250 }, // blue-400
      emerald: { r: 52, g: 211, b: 153 }, // emerald-400
    }

    const color = colors[variant]
    let opacity = 0.1

    if (diffDays > 0) {
      if (diffDays > 30) {
        opacity = 0.02 // Very faint for far future
      } else {
        // Gradually increase opacity as start date approaches
        const progress = 1 - diffDays / 30
        opacity = 0.02 + progress * 0.15
      }
    } else {
      // Started
      opacity = 0.15
    }

    return {
      backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`,
      borderColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.max(opacity * 1.5, 0.1)})`,
    }
  }

  const style = getBackgroundStyle()

  const progressColors = {
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
  }

  const textColors = {
    amber: "text-amber-700",
    blue: "text-blue-700",
    emerald: "text-emerald-700",
  }

  return (
    <Link href={`/goals/${goal.id}`} className="block group">
      <div
        className="p-5 rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden"
        style={style}
      >
        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete()
            }}
            className="p-1.5 bg-white/80 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-full backdrop-blur-sm transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col h-full justify-between gap-4">
          <div>
            <div className="flex justify-between items-start gap-4">
              <h4 className="font-serif text-lg font-bold text-stone-800 leading-tight group-hover:text-stone-900 transition-colors">
                {goal.title}
              </h4>
              <span className={cn("text-sm font-bold font-mono", textColors[variant])}>{goal.progress}%</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-stone-500 bg-white/60 px-2 py-1 rounded-md backdrop-blur-sm">
                <span className="uppercase tracking-wider opacity-70">Start</span>
                <span className="font-mono">{goal.startDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-stone-500 bg-white/60 px-2 py-1 rounded-md backdrop-blur-sm">
                <span className="uppercase tracking-wider opacity-70">Target</span>
                <span className="font-mono">{goal.deadline}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 bg-white/60 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className={cn("h-full rounded-full transition-all duration-500 ease-out", progressColors[variant])}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
