"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Sparkles, Plus, CheckCircle2, Circle, Trash2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for demonstration - in a real app this would come from a database
const MOCK_GOALS = {
  1: { title: "Become a Senior Developer", deadline: "2026", progress: 40, type: "longTerm" },
  2: { title: "Buy a House", deadline: "2028", progress: 15, type: "longTerm" },
  3: { title: "Master Next.js & React Native", deadline: "Dec 2025", progress: 70, type: "midTerm" },
  4: { title: "Read 20 Books", deadline: "Dec 2025", progress: 45, type: "midTerm" },
  5: { title: "Complete Portfolio Website", deadline: "This Month", progress: 85, type: "shortTerm" },
  6: { title: "Gym 3x/Week", deadline: "This Week", progress: 33, type: "shortTerm" },
}

interface SubTask {
  id: number
  title: string
  completed: boolean
  difficulty: "Easy" | "Medium" | "Hard"
  time: number // hours
}

export default function GoalDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  const goal = MOCK_GOALS[id as keyof typeof MOCK_GOALS]

  const [subTasks, setSubTasks] = useState<SubTask[]>([
    { id: 1, title: "Research requirements", completed: true, difficulty: "Easy", time: 2 },
    { id: 2, title: "Create initial plan", completed: false, difficulty: "Medium", time: 5 },
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [newTask, setNewTask] = useState("")
  const [newDifficulty, setNewDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy")
  const [newTime, setNewTime] = useState(1)

  const calculateProgress = () => {
    if (subTasks.length === 0) return 0

    const difficultyWeights = { Easy: 1, Medium: 2, Hard: 3 }

    let totalWeight = 0
    let completedWeight = 0

    subTasks.forEach((task) => {
      const weight = difficultyWeights[task.difficulty] * task.time
      totalWeight += weight
      if (task.completed) {
        completedWeight += weight
      }
    })

    return totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100)
  }

  const progress = calculateProgress()

  const toggleTask = (taskId: number) => {
    setSubTasks(subTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)))
  }

  const deleteTask = (taskId: number) => {
    setSubTasks(subTasks.filter((t) => t.id !== taskId))
  }

  const addTask = () => {
    if (!newTask.trim()) return
    setSubTasks([
      ...subTasks,
      {
        id: Date.now(),
        title: newTask,
        completed: false,
        difficulty: newDifficulty,
        time: newTime,
      },
    ])
    setNewTask("")
    setNewDifficulty("Easy")
    setNewTime(1)
  }

  const generateAiTasks = () => {
    setIsGenerating(true)
    // Simulate AI delay
    setTimeout(() => {
      const aiTasks: SubTask[] = [
        { id: Date.now() + 1, title: "Analyze current skill gaps", completed: false, difficulty: "Medium", time: 4 },
        { id: Date.now() + 2, title: "Build 3 complex projects", completed: false, difficulty: "Hard", time: 20 },
        { id: Date.now() + 3, title: "Contribute to open source", completed: false, difficulty: "Hard", time: 15 },
        { id: Date.now() + 4, title: "Master system design patterns", completed: false, difficulty: "Medium", time: 8 },
      ]
      setSubTasks([...subTasks, ...aiTasks])
      setIsGenerating(false)
    }, 1500)
  }

  return (
    <div className="container max-w-md mx-auto p-4 pb-24 space-y-6 bg-[#fffdf5] min-h-screen">
      {/* Header */}
      <header className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-stone-100 rounded-full text-stone-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-serif font-bold text-stone-800 truncate flex-1">{goal?.title}</h1>
      </header>

      {/* Goal Info Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Target Date</p>
            <p className="text-stone-800 font-medium mt-1">{goal?.deadline}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Weighted Progress</p>
            <p className="text-stone-800 font-medium mt-1">{progress}%</p>
          </div>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-stone-800 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* AI Action */}
      <button
        onClick={generateAiTasks}
        disabled={isGenerating}
        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl flex items-center justify-center gap-2 text-indigo-700 font-medium hover:from-indigo-100 hover:to-purple-100 transition-all disabled:opacity-70"
      >
        {isGenerating ? (
          <>
            <Sparkles className="w-4 h-4 animate-spin" />
            Generating Plan...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            AI Breakdown
          </>
        )}
      </button>

      {/* Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-stone-800">Sub-tasks</h3>
          <span className="text-xs text-stone-400">{subTasks.length} tasks</span>
        </div>

        <div className="space-y-2">
          {subTasks.map((task) => (
            <div
              key={task.id}
              className="group flex flex-col gap-2 p-3 bg-white rounded-xl border border-stone-100 hover:border-stone-200 transition-all"
            >
              <div className="flex items-center gap-3">
                <button onClick={() => toggleTask(task.id)} className="text-stone-400 hover:text-stone-600">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <span className={cn("flex-1 text-sm text-stone-700", task.completed && "line-through text-stone-400")}>
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 pl-8">
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium",
                    task.difficulty === "Easy" && "bg-green-50 text-green-600",
                    task.difficulty === "Medium" && "bg-yellow-50 text-yellow-600",
                    task.difficulty === "Hard" && "bg-red-50 text-red-600",
                  )}
                >
                  {task.difficulty}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-stone-400">
                  <Clock className="w-3 h-3 text-stone-400" />
                  {task.time}h
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-100 space-y-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a new sub-task..."
            className="w-full p-3 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-stone-200 text-sm"
          />

          <div className="flex items-center gap-2">
            <select
              value={newDifficulty}
              onChange={(e) => setNewDifficulty(e.target.value as any)}
              className="p-2 rounded-lg bg-stone-50 text-xs font-medium text-stone-600 border-none focus:ring-2 focus:ring-stone-200"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <div className="flex items-center gap-1 bg-stone-50 rounded-lg px-2">
              <Clock className="w-3 h-3 text-stone-400" />
              <input
                type="number"
                min="1"
                value={newTime}
                onChange={(e) => setNewTime(Number(e.target.value))}
                className="w-12 p-2 bg-transparent text-xs font-medium text-stone-600 border-none focus:ring-0"
              />
              <span className="text-xs text-stone-400 pr-1">h</span>
            </div>

            <div className="flex-1" />

            <button
              onClick={addTask}
              disabled={!newTask.trim()}
              className="p-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
