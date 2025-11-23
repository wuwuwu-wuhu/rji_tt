"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Save, Clock, Calendar } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { diaryService } from "@/lib/services/diary"
import { useMutation, useApi } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function WriteDiaryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const diaryId = searchParams.get('id')
  const isEditMode = !!diaryId
  
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [mood, setMood] = useState<string>('')
  const [tags, setTags] = useState<string>('')
  const [isPrivate, setIsPrivate] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // 获取日记详情（编辑模式）
  const { data: diaryData, loading: diaryLoading, error: diaryError } = useApi(
    () => diaryId ? diaryService.getDiary(parseInt(diaryId)) : Promise.resolve({ status: 200, data: null }),
    {
      immediate: isEditMode,
      onSuccess: (diary) => {
        console.log("🔍 [前端] 加载日记详情:", diary)
        if (diary) {
          console.log("📋 [前端] 日记数据:", diary)
          
          // 填充表单数据
          setTimeout(() => {
            if (titleRef.current) titleRef.current.value = diary.title || ''
            if (contentRef.current) contentRef.current.value = diary.content || ''
            setMood(diary.mood || '')
            setTags(diary.tags ? diary.tags.join(', ') : '')
            setIsPrivate(diary.is_private || false)
          }, 100)
        }
      },
      onError: (error) => {
        console.error("❌ [前端] 加载日记失败:", error)
        toast.error(`加载日记失败: ${error.message}`)
      }
    }
  )

  // 使用mutation hook处理保存操作
  const { mutate: saveDiary, loading, error } = useMutation(
    (data: { title: string; content: string; mood: string; tags?: string[]; is_private: boolean }) =>
      isEditMode && diaryId
        ? diaryService.updateDiary(parseInt(diaryId), data)
        : diaryService.createDiary(data),
    {
      onSuccess: () => {
        toast.success(isEditMode ? '日记更新成功' : '日记保存成功')
        router.push('/')
      },
      onError: (error) => {
        toast.error(`${isEditMode ? '更新' : '保存'}失败: ${error.message}`)
      }
    }
  )

  const handleSave = () => {
    const title = titleRef.current?.value || ''
    const content = contentRef.current?.value || ''

    if (!content.trim()) {
      toast.error('请输入日记内容')
      return
    }

    saveDiary({
      title,
      content,
      mood,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : undefined,
      is_private: isPrivate
    })
  }

  // 获取当前日期时间
  const getCurrentDateTime = () => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const timeStr = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
    return { dateStr, timeStr }
  }

  const { dateStr, timeStr } = getCurrentDateTime()

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FDFCF8]/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="p-2 -ml-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>

          <span className="font-semibold text-stone-800">{isEditMode ? '编辑日记' : '写日记'}</span>

          <Button
            onClick={handleSave}
            disabled={loading || diaryLoading}
            variant="ghost"
            size="sm"
            className="p-2 -mr-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
          >
            {loading || diaryLoading ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            ) : (
              <Save className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Editor Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {/* 加载状态（编辑模式） */}
        {isEditMode && diaryLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
            <span className="ml-3 text-stone-600">加载日记中...</span>
          </div>
        )}

        {/* 错误状态（编辑模式） */}
        {isEditMode && diaryError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">加载日记失败: {diaryError.message}</p>
          </div>
        )}

        {/* 编辑器内容 */}
        {(!isEditMode || !diaryLoading) && (
        <div className="space-y-6">
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-stone-400">
            <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4" />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4" />
              <span>{timeStr}</span>
            </div>
          </div>

          {/* 日记设置 */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择心情" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">😊 开心</SelectItem>
                  <SelectItem value="sad">😢 难过</SelectItem>
                  <SelectItem value="angry">😠 生气</SelectItem>
                  <SelectItem value="anxious">😰 焦虑</SelectItem>
                  <SelectItem value="calm">😌 平静</SelectItem>
                  <SelectItem value="excited">🤗 兴奋</SelectItem>
                  <SelectItem value="tired">😴 疲惫</SelectItem>
                  <SelectItem value="grateful">🙏 感激</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Input
              placeholder="标签 (用逗号分隔)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
          </div>

          {/* Title Input */}
          <Input
            ref={titleRef}
            type="text"
            placeholder="标题 (可选)"
            className="text-2xl font-bold text-stone-800 placeholder:text-stone-300 border-none focus:ring-0 p-0 bg-transparent"
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
            <Textarea
              ref={contentRef}
              placeholder="记录每一个值得铭记的瞬间..."
              className="w-full h-full min-h-[600px] bg-transparent text-lg leading-[40px] text-stone-700 placeholder:text-stone-300 border-none focus:ring-0 p-0 resize-none font-medium px-6 py-2"
              style={{
                lineHeight: "40px",
                backgroundColor: "#fffdf5",
              }}
            />
          </div>

          {/* 隐私设置 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded border-stone-300"
            />
            <label htmlFor="private" className="text-sm text-stone-600">
              设为私密日记
            </label>
          </div>
        </div>
        )}
      </main>
    </div>
  )
}
