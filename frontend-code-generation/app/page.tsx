import { TimelineEntry } from "@/components/diary/timeline-entry"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function DiaryPage() {
  // Mock data based on the image provided
  const timelineData = [
    {
      id: "date-1",
      date: { day: "16", month: "9", weekday: "Tue" },
      entries: [
        {
          id: 1,
          title: "针对目前这个项目分析",
          time: "22:30",
          body: `计划：
主要是技术调研和认知重构整理
约见王总聊chat
认知重构模型
(下周五前 不做细致脑图汇报)

项目挖掘：
如果角色穿越、模拟法庭、直播互动、带入工作流
需要调研：认知协调理论(心理学)、剧本杀
传奇(人工摩擦和半开放?)
ai如何利用资源管理程序调用OpenAI模式
agent如何推进世界演化
RAG是一个agent框架
注意：用户创造的世界ai该如何理解rag，当多用户必须让架构在底层实现自我纠正的训练方案
ai和云端链接。
确保自己的底层逻辑没问题。
!
可以做有趣的有产出的好玩的是什么。`,
        },
        {
          id: 101,
          title: "共勉",
          body: `1.睡眠质量问题，第二天也是没有精神
调整状态，喝中药？气虚？群里心态，2强大

计划：
美善那花，只要可靠本相遇的功勋
会找回互补-上学习
拆解分步
美剧要学取去发帖在媒体上
软层层快要传承回来`,
        },
      ],
    },
    {
      id: "date-2",
      date: { day: "23", month: "8", weekday: "Sat" },
      entries: [
        {
          id: 2,
          time: "14:15",
          body: `先用脑图撸了云端的日记，确实完整，但是看重了不过瘾，今天测试，平台多好了，就是太好了。哇，开始太没有收敛，很慢啊，认真的开心，准备研究，计划调研spring boot的项目，想用go，agent，图论法，试试新的大模型吧。`,
        },
      ],
    },
    {
      id: "date-3",
      date: { day: "31", month: "1", weekday: "Fri" },
      entries: [
        {
          id: 3,
          title: "css怎么搞，静态页面",
          body: `css怎么搞，静态页面`,
        },
      ],
    },
    {
      id: "date-4",
      date: { day: "21", month: "1", weekday: "Tue" },
      entries: [
        {
          id: 4,
          time: "09:00",
          body: `实在没睡不着，今天基本啥也没干，焦虑模型。
对处在失控的焦虑，总是想扛下什么，在尽可能快速读掌握边界，遵守约定下 KPI

想逃离，受不了，受够了配不上了。

读物推荐太少了，刚想来看，不面临失落，不排斥去拥抱状态，去原谅自己，可以回头去吧。

随着居民烟火让贫穷和争吵隔离了，太久没有锻炼了。

太久没有中测速了`,
        },
      ],
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <header className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold text-stone-800 tracking-tight">我的日记</h1>
          <p className="text-stone-400 mt-2 text-sm font-medium">记录每一个值得铭记的瞬间</p>
        </div>
        <Link href="/diary/write">
          <button className="bg-[#1C1917] text-white w-12 h-12 rounded-full shadow-lg hover:bg-stone-800 transition-all active:scale-95 flex items-center justify-center mt-1">
            <Plus className="w-6 h-6" />
            <span className="sr-only">写日记</span>
          </button>
        </Link>
      </header>
      <div className="space-y-4">
        {timelineData.map((item) => (
          <TimelineEntry key={item.id} date={item.date} entries={item.entries} />
        ))}
      </div>
      <div className="h-20" /> {/* Bottom spacer */}
    </div>
  )
}
