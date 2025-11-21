# 系统架构与模式

## 前端框架
- **Next.js 16 + App Router**：`app/` 目录按路由组织页面，`layout.tsx` 提供全局结构。
- **React 19 + "use client"** 组件：大量交互组件在客户端渲染。

## 状态管理
- **Context Providers**：
  - `AiAssistantProvider` 负责 AI 面板状态（启用、打开、宽度、全屏）。
  - `RecommendationsProvider` 管理娱乐推荐列表、收藏与新增。
- Hooks 均以 `useAiAssistant` / `useRecommendations` 暴露。

## UI 体系
- 自建 `components/ui` 目录，封装 Button、Dialog、Input、Tabs 等基于 Radix UI 的组件。
- `components/layout` 提供 Sidebar、MobileNav、AppLayout，统一注入 Provider 与导航。

## 样式
- Tailwind CSS 4 + `globals.css`，结合 `cn` 工具函数动态拼接类。
- 图标使用 `lucide-react`。

## 数据层
- `data/entertainment.ts` 暂存推荐种子数据，类型定义在 `types/`。

## 模块划分
- `app/<feature>/page.tsx` 对应多个场景页面（娱乐、收藏、目标、学习计划、日程、设置、日记等）。
- 复用 `components/<feature>/` 下的视图组件（如 `entertainment-feed.tsx`、`settings-view.tsx`）。

## 交互模式
- 广泛使用 Radix 的 Dialog/Select/Switch，配合 `useState` 控制。
- AI 面板与悬浮按钮支持拖拽（`useRef` + pointer 事件）。
