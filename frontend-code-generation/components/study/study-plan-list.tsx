"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Clock, Sparkles, Plus, Trash2, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ai } from "@/lib/services/ai"

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
  const [plans, setPlans] = useState<Plan[]>([])
  
  // 添加调试日志，在组件渲染时显示当前计划数量
  console.log("🔄 [StudyPlanList] 组件渲染，当前计划数量:", plans.length)
  if (plans.length > 0) {
    console.log("   📋 当前计划列表:")
    plans.forEach((plan, index) => {
      console.log(`      ${index + 1}. ${plan.title} (${plan.tasks.length}个任务)`)
    })
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newPlanTitle, setNewPlanTitle] = useState("")
  const [newPlanPriority, setNewPlanPriority] = useState<"High" | "Medium" | "Low">("Medium")
  const [newTasks, setNewTasks] = useState<{ title: string; duration: string }[]>([
    { title: "", duration: "30m" }
  ])
  
  // AI生成相关状态
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiGenerateMode, setAiGenerateMode] = useState<"direct" | "custom" | null>(null)
  const [customPrompt, setCustomPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

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
    
    // 过滤掉空任务
    const validTasks = newTasks.filter(task => task.title.trim())
    if (validTasks.length === 0) return
    
    const newPlan: Plan = {
      id: Date.now(),
      title: newPlanTitle,
      progress: 0,
      tasks: validTasks.map((task, index) => ({
        id: Date.now() + index,
        title: task.title,
        completed: false,
        duration: task.duration || "30m"
      })),
      priority: newPlanPriority,
      color: newPlanPriority === "High" ? "bg-red-50 border-red-100" :
             newPlanPriority === "Low" ? "bg-green-50 border-green-100" :
             "bg-stone-50 border-stone-100",
    }
    setPlans([...plans, newPlan])
    setNewPlanTitle("")
    setNewPlanPriority("Medium")
    setNewTasks([{ title: "", duration: "30m" }])
    setIsModalOpen(false)
  }

  // 添加新任务
  const addNewTask = () => {
    setNewTasks([...newTasks, { title: "", duration: "30m" }])
  }

  // 删除任务
  const removeTask = (index: number) => {
    if (newTasks.length > 1) {
      setNewTasks(newTasks.filter((_, i) => i !== index))
    }
  }

  // 更新任务
  const updateTask = (index: number, field: "title" | "duration", value: string) => {
    const updatedTasks = [...newTasks]
    updatedTasks[index][field] = value
    setNewTasks(updatedTasks)
  }

  // AI生成学习计划
  const generatePlanWithAI = async (prompt?: string) => {
    setIsGenerating(true)
    
    try {
      const userPrompt = prompt || "请为我生成一个通用的学习计划，适合初学者入门"
      
      console.log("🔍 [前端] 开始AI生成学习计划:")
      console.log("   📝 用户需求:", userPrompt)

      const response = await ai.generateStudyPlan(userPrompt)
      
      console.log("📊 [前端] API响应:")
      console.log("   📊 状态码:", response.status)
      console.log("   📝 响应数据:", response.data)
      console.log("   ❓ 错误信息:", response.error)
      
      if (response.status === 200 && response.data) {
        console.log("✅ [前端] AI生成成功，开始处理数据:")
        console.log("   📋 完整响应结构:", response.data)
        
        // 检查响应数据结构
        const studyPlanData = response.data.data || response.data
        console.log("   📋 学习计划数据:", studyPlanData)
        console.log("   📋 标题:", studyPlanData.title)
        console.log("   🎯 优先级:", studyPlanData.priority)
        console.log("   📝 任务数量:", studyPlanData.tasks?.length || 0)
        
        if (studyPlanData.tasks && studyPlanData.tasks.length > 0) {
          console.log("   📋 任务列表:")
          studyPlanData.tasks.forEach((task: any, index: number) => {
            console.log(`      ${index + 1}. ${task.title} (${task.duration})`)
          })
        }
        
        const newPlan: Plan = {
          id: Date.now(),
          title: studyPlanData.title || "AI生成的学习计划",
          progress: 0,
          tasks: studyPlanData.tasks?.map((task: any, index: number) => ({
            id: Date.now() + index,
            title: task.title || `任务 ${index + 1}`,
            completed: false,
            duration: task.duration || "30m"
          })) || [],
          priority: studyPlanData.priority || "Medium",
          color: studyPlanData.priority === "High" ? "bg-red-50 border-red-100" :
                 studyPlanData.priority === "Low" ? "bg-green-50 border-green-100" :
                 "bg-stone-50 border-stone-100",
        }
        
        console.log("🔄 [前端] 更新学习计划列表:")
        console.log("   📊 当前计划数量:", plans.length)
        console.log("   ➕ 添加新计划:", newPlan.title)
        console.log("   📝 新计划任务数量:", newPlan.tasks.length)
        
        const updatedPlans = [...plans, newPlan]
        console.log("🔄 [前端] 即将更新的计划列表:", updatedPlans)
        console.log("   📊 更新后计划数量:", updatedPlans.length)
        
        setPlans(updatedPlans)
        
        // 使用setTimeout确保状态更新后再检查
        setTimeout(() => {
          console.log("✅ [前端] 状态更新后的计划数量检查:")
          console.log("   📊 实际计划数量:", updatedPlans.length)
          console.log("   📋 新计划详情:", {
            id: newPlan.id,
            title: newPlan.title,
            priority: newPlan.priority,
            taskCount: newPlan.tasks.length,
            tasks: newPlan.tasks.map(t => ({ title: t.title, duration: t.duration }))
          })
        }, 100)
        
        setIsAiModalOpen(false)
        setAiGenerateMode(null)
        setCustomPrompt("")
      } else {
        console.error("❌ [前端] AI生成失败:", response.error)
        throw new Error(response.error || "AI生成失败")
      }
    } catch (error) {
      console.error("❌ [前端] AI生成学习计划失败:", error)
      alert(`AI生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // 处理AI生成按钮点击
  const handleAiGenerateClick = () => {
    setIsAiModalOpen(true)
  }

  // 处理AI生成模式选择
  const handleAiModeSelect = (mode: "direct" | "custom") => {
    setAiGenerateMode(mode)
    if (mode === "direct") {
      generatePlanWithAI()
    }
  }

  // 处理自定义AI生成
  const handleCustomAiGenerate = () => {
    if (!customPrompt.trim()) {
      alert("请输入学习需求描述")
      return
    }
    generatePlanWithAI(customPrompt)
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
          <button
            onClick={handleAiGenerateClick}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Generate</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">还没有学习计划</h3>
            <p className="text-stone-600 mb-6">点击"AI Generate"让AI为你创建个性化学习计划</p>
            <button
              onClick={handleAiGenerateClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Generate</span>
            </button>
          </div>
        ) : (
          plans.map((plan) => (
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
                  aria-label="删除计划"
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
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-stone-800">New Study Plan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600" aria-label="关闭">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* 计划标题 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">计划标题</label>
              <input
                type="text"
                placeholder="What do you want to learn?"
                value={newPlanTitle}
                onChange={(e) => setNewPlanTitle(e.target.value)}
                className="w-full p-3 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-stone-200 text-stone-800 placeholder:text-stone-400"
                autoFocus
              />
            </div>

            {/* 优先级选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">优先级</label>
              <div className="flex gap-2">
                {(["High", "Medium", "Low"] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setNewPlanPriority(priority)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      newPlanPriority === priority
                        ? priority === "High" ? "bg-red-100 text-red-700 border-2 border-red-200"
                        : priority === "Low" ? "bg-green-100 text-green-700 border-2 border-green-200"
                        : "bg-stone-100 text-stone-700 border-2 border-stone-200"
                        : "bg-stone-50 text-stone-600 border-2 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    {priority === "High" ? "高" : priority === "Low" ? "低" : "中"}
                  </button>
                ))}
              </div>
            </div>

            {/* 任务列表 */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-stone-700">任务列表</label>
                <button
                  onClick={addNewTask}
                  className="text-sm text-stone-600 hover:text-stone-800 font-medium"
                >
                  + 添加任务
                </button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {newTasks.map((task, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="任务标题"
                      value={task.title}
                      onChange={(e) => updateTask(index, "title", e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-stone-50 border-none focus:ring-2 focus:ring-stone-200 text-stone-800 placeholder:text-stone-400 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="时长"
                      value={task.duration}
                      onChange={(e) => updateTask(index, "duration", e.target.value)}
                      className="w-20 p-2 rounded-lg bg-stone-50 border-none focus:ring-2 focus:ring-stone-200 text-stone-800 placeholder:text-stone-400 text-sm"
                    />
                    {newTasks.length > 1 && (
                      <button
                        onClick={() => removeTask(index)}
                        className="text-stone-400 hover:text-red-500 transition-colors"
                        aria-label="删除任务"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addPlan}
                disabled={!newPlanTitle.trim() || newTasks.filter(t => t.title.trim()).length === 0}
                className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI生成弹窗 */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-serif font-bold text-stone-800">AI生成学习计划</h3>
              <button
                onClick={() => {
                  setIsAiModalOpen(false)
                  setAiGenerateMode(null)
                  setCustomPrompt("")
                }}
                className="text-stone-400 hover:text-stone-600"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!aiGenerateMode ? (
              // 模式选择界面
              <div className="space-y-4">
                <p className="text-stone-600 text-sm mb-6">
                  选择AI生成方式，让AI为你创建个性化的学习计划
                </p>
                
                <button
                  onClick={() => handleAiModeSelect("direct")}
                  disabled={isGenerating}
                  className="w-full p-4 rounded-xl border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                      <Sparkles className="w-5 h-5 text-stone-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-stone-800">直接生成</h4>
                      <p className="text-sm text-stone-500">AI将根据通用学习需求生成计划</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleAiModeSelect("custom")}
                  disabled={isGenerating}
                  className="w-full p-4 rounded-xl border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                      <Plus className="w-5 h-5 text-stone-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-stone-800">自定义生成</h4>
                      <p className="text-sm text-stone-500">描述你的学习需求，AI量身定制</p>
                    </div>
                  </div>
                </button>
              </div>
            ) : aiGenerateMode === "custom" ? (
              // 自定义输入界面
              <div className="space-y-4">
                <p className="text-stone-600 text-sm">
                  请描述你的学习需求，例如：
                </p>
                <div className="text-xs text-stone-500 space-y-1 bg-stone-50 p-3 rounded-lg">
                  <p>• "我想学习Python编程，从零开始"</p>
                  <p>• "准备前端面试，需要复习React和JavaScript"</p>
                  <p>• "学习数据科学，包括Python和机器学习"</p>
                </div>
                
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="请输入你的学习需求..."
                  className="w-full p-3 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-stone-200 text-stone-800 placeholder:text-stone-400 resize-none h-24"
                  autoFocus
                />
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setAiGenerateMode(null)
                      setCustomPrompt("")
                    }}
                    disabled={isGenerating}
                    className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    返回
                  </button>
                  <button
                    onClick={handleCustomAiGenerate}
                    disabled={isGenerating || !customPrompt.trim()}
                    className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>生成中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>生成计划</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // 直接生成加载界面
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-stone-600 mb-4" />
                <p className="text-stone-600">AI正在为你生成学习计划...</p>
                <p className="text-sm text-stone-500 mt-2">请稍候，这可能需要几秒钟</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
