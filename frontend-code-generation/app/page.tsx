"use client"

import { TimelineEntry } from "@/components/diary/timeline-entry"
import { Plus } from "lucide-react"
import Link from "next/link"
import { diaryService } from "@/lib/services/diary"
import { useApi } from "@/hooks/use-api"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

// 将日记数据转换为时间线格式
function groupDiariesByDate(diaries: any[]) {
  // 添加安全检查
  if (!diaries || !Array.isArray(diaries)) {
    return []
  }
  
  const grouped = diaries.reduce((acc, diary) => {
    try {
      // 数据库中的时间是UTC时间（无时区信息），需要正确处理
      const utcDate = new Date(diary.created_at + 'Z') // 添加Z表示UTC时间
      
      // 检查日期是否有效
      if (isNaN(utcDate.getTime())) {
        console.warn('无效的日期格式:', diary.created_at)
        return acc
      }
      
      // 使用toLocaleString方法获取中国时区的各个部分
      const chinaDateStr = utcDate.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      
      // 获取中国时区的日期部分（用于分组）
      const chinaDateForGrouping = utcDate.toLocaleDateString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      
      // 获取中国时区的时间部分（用于显示）
      const chinaTimeForDisplay = utcDate.toLocaleTimeString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      
      // 获取中国时区的星期
      const chinaWeekday = utcDate.toLocaleDateString('zh-CN', {
        weekday: 'short',
        timeZone: 'Asia/Shanghai'
      })
      
      console.log('🔍 [时区转换] 原始数据库时间:', diary.created_at)
      console.log('🔍 [时区转换] 构造UTC时间:', utcDate.toISOString())
      console.log('🔍 [时区转换] 转换后中国时间:', chinaDateStr)
      console.log('🔍 [时区转换] 日期部分:', chinaDateForGrouping)
      console.log('🔍 [时区转换] 时间部分:', chinaTimeForDisplay)
      
      // 解析中国时区的日期字符串 (格式: 2025/11/23)
      const [year, month, day] = chinaDateForGrouping.split('/')
      
      // 使用中国时区的日期作为key
      const dateKey = `${year}-${month}-${day}`
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          id: dateKey,
          date: {
            day: day,
            month: month,
            weekday: chinaWeekday
          },
          entries: []
        }
      }
      
      acc[dateKey].entries.push({
        id: diary.id,
        title: diary.title,
        time: chinaTimeForDisplay, // 使用中国时区的时间
        body: diary.content,
        mood: diary.mood,
        tags: diary.tags,
        is_private: diary.is_private
      })
      
    } catch (error) {
      console.error('处理日记日期时出错:', error, diary.created_at)
    }
    
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(grouped).sort((a: any, b: any) => {
    return b.id.localeCompare(a.id) // 按日期字符串排序
  })
}

export default function DiaryPage() {
  const {
    data: diaries,
    loading,
    error,
    execute: loadDiaries
  } = useApi(diaryService.getDiaries, {
    immediate: true,
    onError: (error) => {
      console.error('加载日记失败:', error)
    }
  })

  // 后端直接返回数组，不是分页对象
  const timelineData = diaries && Array.isArray(diaries) ? groupDiariesByDate(diaries) : []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <header className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold text-stone-800 tracking-tight">我的日记</h1>
          <p className="text-stone-400 mt-2 text-sm font-medium">记录每一个值得铭记的瞬间</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDiaries}
            disabled={loading}
            className="mt-1"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="sr-only">刷新</span>
          </Button>
          <Link href="/diary/write">
            <button className="bg-[#1C1917] text-white w-12 h-12 rounded-full shadow-lg hover:bg-stone-800 transition-all active:scale-95 flex items-center justify-center mt-1">
              <Plus className="w-6 h-6" />
              <span className="sr-only">写日记</span>
            </button>
          </Link>
        </div>
      </header>

      {/* 加载状态 */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="space-y-2 pl-20">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            加载日记失败: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* 空状态 */}
      {!loading && !error && timelineData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-stone-400 mb-4">
            <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-stone-600 mb-2">还没有日记</h3>
          <p className="text-stone-400 mb-6">开始记录你的第一篇日记吧</p>
          <Link href="/diary/write">
            <Button className="bg-[#1C1917] hover:bg-stone-800">
              写第一篇日记
            </Button>
          </Link>
        </div>
      )}

      {/* 日记列表 */}
      {!loading && !error && timelineData.length > 0 && (
        <div className="space-y-4">
          {timelineData.map((item: any) => (
            <TimelineEntry key={item.id} date={item.date} entries={item.entries} />
          ))}
        </div>
      )}

      <div className="h-20" /> {/* Bottom spacer */}
    </div>
  )
}
