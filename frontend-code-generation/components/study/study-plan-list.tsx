"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Clock, Sparkles, Plus, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: number
  title: string
  completed: boolean
  duration: string
}

interface Plan {
  id: number
  title: string
  progress: number
  tasks: Task[]
  priority: "High" | "Medium" | "Low"
  color: string
}

export function StudyPlanList() {
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 1,
      title: "Linear Algebra Review",
      progress: 65,
      tasks: [
        { id: 1, title: "Matrix Operations", completed: true, duration: "45m" },
        { id: 2, title: "Determinants", completed: true, duration: "30m" },
        { id: 3, title: "Eigenvalues", completed: false, duration: "60m" },
      ],
      priority: "High",
      color: "bg-blue-50 border-blue-100",
    },
    {
      id: 2,
      title: "React Native Basics",
      progress: 30,
      tasks: [
        { id: 4, title: "Environment Setup", completed: true, duration: "30m" },
        { id: 5, title: "Components & Props", completed: false, duration: "45m" },
        { id: 6, title: "State Management", completed: false, duration: "60m" },
      ],
      priority: "Medium",
      color: "bg-orange-50 border-orange-100",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newPlanTitle, setNewPlanTitle] = useState("")

  const toggleTask = (planId: number, taskId: number) => {
    setPlans(
      plans.map((plan) => {
        if (plan.id === planId) {
          const updatedTasks = plan.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task,
          )
          const completedCount = updatedTasks.filter((t) => t.completed).length
          const newProgress = Math.round((completedCount / updatedTasks.length) * 100)
          return { ...plan, tasks: updatedTasks, progress: newProgress }
        }
        return plan
      }),
    )
  }

  const deletePlan = (id: number) => {
    setPlans(plans.filter((p) => p.id !== id))
  }

  const addPlan = () => {
    if (!newPlanTitle.trim()) return
    const newPlan: Plan = {
      id: Date.now(),
      title: newPlanTitle,
      progress: 0,
      tasks: [
        { id: Date.now() + 1, title: "Introduction", completed: false, duration: "30m" },
        { id: Date.now() + 2, title: "Core Concepts", completed: false, duration: "45m" },
      ],
      priority: "Medium",
      color: "bg-stone-50 border-stone-100",
    }
    setPlans([...plans, newPlan])
    setNewPlanTitle("")
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-stone-800">Today's Plan</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-full text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plan</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 transition-colors shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI Generate</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className={cn("rounded-xl border p-5 transition-all hover:shadow-md", plan.color)}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-stone-800">{plan.title}</h3>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-white/50 rounded-full text-stone-600">
                    {plan.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Clock className="w-3 h-3" />
                  <span>2h 15m remaining</span>
                </div>
              </div>
              <button
                onClick={() => deletePlan(plan.id)}
                className="text-stone-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1">
                <span>Progress</span>
                <span>{plan.progress}%</span>
              </div>
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-stone-800 rounded-full transition-all duration-500"
                  style={{ width: `${plan.progress}%` }}
                />
              </div>

              <div className="mt-4 space-y-2">
                {plan.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(plan.id, task.id)}
                    className="flex items-center gap-3 p-2 hover:bg-white/40 rounded-lg transition-colors group cursor-pointer"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-300 group-hover:text-stone-400" />
                    )}
                    <span
                      className={cn(
                        "text-sm flex-1 transition-all",
                        task.completed ? "text-stone-400 line-through" : "text-stone-700",
                      )}
                    >
                      {task.title}
                    </span>
                    <span className="text-xs text-stone-400">{task.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-stone-800">New Study Plan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="What do you want to learn?"
              value={newPlanTitle}
              onChange={(e) => setNewPlanTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-stone-200 mb-4 text-stone-800 placeholder:text-stone-400"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addPlan}
                className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
              >
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
