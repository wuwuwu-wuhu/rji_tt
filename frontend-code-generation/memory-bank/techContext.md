# 技术栈与约束

## 框架与语言
- Next.js 16（App Router）
- React 19，全面使用函数组件和 Hooks
- TypeScript +严格类型，`tsconfig.json` 采用 Next 默认配置

## UI 与样式
- Tailwind CSS 4（通过 `@tailwindcss/postcss` 管理 PostCSS）
- 自建 `components/ui` 提供 Button、Card、Dialog、Tabs 等 Radix 包装组件
- `lucide-react` 图标库

## 状态与数据
- 轻量级：主要通过 React Context + 局部 `useState`
- 无后端接口，数据来自静态 `data/` 种子或组件内部 state

## 工具与依赖
- `class-variance-authority`、`clsx`、`tailwind-merge` 辅助样式
- `react-hook-form`、`zod` 预备表单/校验能力
- `embla-carousel-react`、`recharts`、`react-day-picker` 用于特定模块（未逐一验证）

## 开发脚本
- `pnpm`（锁文件存在）
- 常规 `dev`、`build`、`lint`、`start`

## 约束
- 目前没有后端或 API 调用，AI 功能纯前端模拟
- 需兼容桌面 + 移动端
