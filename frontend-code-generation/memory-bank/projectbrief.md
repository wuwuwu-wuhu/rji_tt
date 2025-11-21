# 项目概览

- **名称**：my-v0-project
- **类型**：Next.js 16 + Tailwind CSS 的多功能生活管理前端应用
- **目标用户**：希望借助 AI 助手与多场景模块（日记、娱乐、学习、日程等）的个人用户
- **核心价值**：以统一的界面与 AI 辅助能力，让用户管理日常生活、学习目标、日程计划及娱乐推荐

## 核心功能
1. **AI 助手面板**：可拖拽或全屏，辅助用户执行任务。
2. **娱乐推荐**：支持收藏、筛选与自定义添加条目。
3. **目标设定 / 学习计划 / 日程 / 日记**：各模块提供专用视图和交互。
4. **个性化设置**：切换主题、通知、知识库来源等，以及 AI 面板开关。

## 技术要点
- Next.js App Router + React 19
- Tailwind CSS 4（@tailwindcss/postcss）与自定义 UI 组件库
- Radix UI 生态（Dialog、Select、Tabs等）
- Context 提供 AI 面板与推荐数据状态

## 当前状态
- 代码完整，模块分布在 `app/`、`components/`、`contexts/`、`data/` 等目录。
- 缺失 memory-bank，其它需求待整理。

## 下一步
- 梳理全部模块，补充 productContext、activeContext 等文档。
- 根据用户需求继续完善功能或修复问题。
