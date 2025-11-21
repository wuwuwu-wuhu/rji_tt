# LifeLog AI 后端接口规范（v1）

> 本文根据现有前端页面（日记、娱乐推荐、目标、学习计划、日程、设置/AI 助手等）推导所需后端接口，供服务端实现时参考。所有字段、流程均结合现有 UI/状态管理逻辑整理，确保对接后无需大幅改动前端。

## 0. 基础约定

- **Base URL**：`https://api.lifelog.ai`（示例，部署后替换）
- **版本控制**：路径统一以 `/api` 开头，可通过 Header `X-API-Version: 1` 扩展
- **认证**：建议采用 Bearer Token。前端每个请求在 Header 中携带 `Authorization: Bearer <token>`。
- **请求/响应格式**：`application/json; charset=utf-8`
- **通用响应结构**：

```json5
// 成功
{
  "success": true,
  "data": { ... },
  "meta": {
    "traceId": "uuid",
    "timestamp": "2025-11-20T14:00:00Z"
  }
}

// 失败
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "目标不存在",
    "details": { "goalId": 123 }
  },
  "meta": {
    "traceId": "uuid",
    "timestamp": "2025-11-20T14:00:00Z"
  }
}
```

- **错误码建议**：`VALIDATION_FAILED`、`UNAUTHORIZED`、`FORBIDDEN`、`RESOURCE_NOT_FOUND`、`CONFLICT`、`RATE_LIMITED`、`INTERNAL_ERROR`。

## 1. 设置 & AI 助手配置

### 1.1 获取/更新全局偏好
| Method | Path | 描述 |
|--------|------|------|
| GET | `/api/settings` | 获取当前用户偏好（通知、暗色模式、存储位置等）|
| PATCH | `/api/settings` | 局部更新偏好 |

**数据模型**
```ts
interface UserSettings {
  knowledgeBase: boolean
  darkMode: boolean
  notifications: boolean
  storage: 'local' | 'cloud'
  aiAssistant: {
    enabled: boolean
    panelWidth: number // 0-1，前端默认 0.4
    knowledgeSources: {
      diary: boolean
      schedule: boolean
      goals: boolean
      entertainment: boolean
      study: boolean
    }
  }
}
```

**PATCH 请求示例**
```json
{
  "darkMode": true,
  "aiAssistant": {
    "enabled": true,
    "knowledgeSources": {
      "diary": true,
      "schedule": false,
      "goals": true,
      "entertainment": false,
      "study": true
    }
  }
}
```

### 1.2 AI 模型配置管理
| Method | Path | 描述 |
|--------|------|------|
| GET | `/api/ai/models` | 列出已保存的模型配置（供“选择配置好的模型”使用）|
| POST | `/api/ai/models` | 新建模型配置 |
| DELETE | `/api/ai/models/{id}` | 删除配置 |
| POST | `/api/ai/models/test` | 测试连接（前端“测试连接”按钮）|

**模型配置字段**
```ts
interface ModelConfig {
  id: string
  model: string // gpt-4o, llama-3 等
  vendor: string // API base url
  apiKeyAlias: string // 不回传明文密钥，返回掩码
  createdAt: string
}
```

**POST /api/ai/models**
```json
{
  "model": "gpt-4o",
  "vendor": "https://api.openai.com/v1",
  "apiKey": "sk-..." // 服务端加密存储
}
```
- 返回：`201 Created` + `ModelConfig`

**POST /api/ai/models/test**
```json
{
  "model": "gpt-4o",
  "vendor": "https://api.openai.com/v1",
  "apiKey": "sk-..."
}
```
- 响应内需指出 `status: "success" | "error"` 及延迟等信息。

### 1.3 AI 聊天/命令
| Method | Path | 描述 |
|--------|------|------|
| POST | `/api/ai/chat` | 发送一轮对话消息，返回助手回复（可改为 SSE/流式）|

**请求**
```json
{
  "modelId": "MODEL_CONFIG_ID", // 可选，若不传使用默认
  "messages": [
    { "role": "system", "content": "你是 LifeLog AI 助手" },
    { "role": "user", "content": "帮我制定今天的学习计划" }
  ],
  "context": {
    "enabledSources": ["diary", "schedule"],
    "currentRoute": "/study-plan"
  }
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "messages": [
      { "role": "assistant", "content": "..." }
    ]
  }
}
```

## 2. 日记 Diary 模块

### 2.1 时间轴列表
| Method | Path | 查询 |
|--------|------|------|
| GET | `/api/diary/timeline` | `from`、`to`（ISO 日期）或 `limit` （默认 30 条）|

**响应**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-09-16",
      "weekday": "Tue",
      "entries": [
        {
          "id": "entry-1",
          "title": "针对目前这个项目分析",
          "time": "22:30",
          "body": "..."
        },
        {
          "id": "entry-101",
          "title": "共勉",
          "body": "..."
        }
      ]
    }
  ]
}
```

### 2.2 单条操作
| Method | Path | 描述 |
|--------|------|------|
| GET | `/api/diary/{id}` | 获取单条日记 |
| POST | `/api/diary` | 创建（来自“写日记”页面）|
| PATCH | `/api/diary/{id}` | 更新标题/内容/日期 |
| DELETE | `/api/diary/{id}` | 删除 |

**POST 请求**
```json
{
  "title": "css怎么搞，静态页面",
  "body": "...",
  "occurredAt": "2025-01-31T09:00:00+08:00"
}
```

## 3. 娱乐推荐 & 收藏

### 3.1 推荐源
| Method | Path | 查询 |
|--------|------|------|
| GET | `/api/entertainment/recommendations` | `type=movie|book|activity|game`，`page`，`pageSize`，`liked=true` |
| GET | `/api/entertainment/recommendations/{id}` | 详情页（带 `duration`、`releaseDate`、`tags` 等）|
| POST | `/api/entertainment/recommendations` | 新增自定义灵感（前端“Add Recommendation”）|

**分页/刷新约定**
- 前端娱乐浏览页面具备“触底加载更多 + 下拉刷新”体验；因此接口需在 `data` 中返回 `items` + `nextCursor` 或 `nextPage`，并在 `meta` 中附上分页信息。
- 请求示例：`GET /api/entertainment/recommendations?type=movie&page=2&pageSize=20`。
- 响应需包含：
```json5
{
  "success": true,
  "data": {
    "items": [Recommendation],
    "featured": Recommendation,
    "nextPage": 3,
    "hasMore": true
  }
}
```
- 下拉刷新时，前端会重新请求 `page=1` 并期望得到新的排序（可通过随机、时间排序或后端推荐算法实现）。

**外部 API 汇聚**
- 后端可分别对接 TMDB（电影）、Google Books（书籍）、TripAdvisor/自建旅行 API（活动/旅行）、Steam/RAWG（游戏）等来源。服务端需统一映射字段（见下方数据模型）并缓存结果，避免频繁调用第三方接口。
- 如果需要搜索型采集（浏览器搜索 API），建议在后端完成爬取/解析后写入数据库，再通过上述接口返回标准化内容，前端不直接访问第三方。

**Recommendation 数据模型**
```ts
interface Recommendation {
  id: number
  type: 'movie' | 'book' | 'activity' | 'game'
  title: string
  subtitle: string
  description: string
  rating: number // 0-5，可为空
  imageUrl: string // 提供真实图片或色块
  accentColor: string // 供前端自定义 class
  duration?: string
  releaseDate?: string
  tags?: string[]
  liked: boolean
}
```

**POST body**
```json
{
  "type": "movie",
  "title": "Inception",
  "subtitle": "Sci-Fi / Thriller",
  "description": "..."
}
```
服务端需返回完整 Recommendation（含系统生成 id、默认 rating/liked=false）。

### 3.2 收藏 / 点赞
| Method | Path | 描述 |
|--------|------|------|
| PATCH | `/api/entertainment/recommendations/{id}/like` | `{"liked": true}`，返回更新后的 Recommendation |
| GET | `/api/favorites` | 返回所有 `liked=true` 的推荐（Favorites 页面），支持 `type` 过滤与分页 |

## 4. 目标 Goals 模块

| Method | Path | 描述 |
|--------|------|------|
| GET | `/api/goals` | 返回按类型分组的目标，结构需匹配 `longTerm/midTerm/shortTerm`|
| POST | `/api/goals` | 创建新目标（Modal “New Goal”）|
| PATCH | `/api/goals/{id}` | 更新标题、日期、进度等 |
| DELETE | `/api/goals/{id}` | 删除目标 |
| GET | `/api/goals/{id}` | 详情页（`/goals/[id]` 路由）|

**Goal 字段**
```ts
interface Goal {
  id: number
  title: string
  startDate: string // ISO
  deadline: string | null
  progress: number // 0-100
  type: 'longTerm' | 'midTerm' | 'shortTerm'
  milestones?: Array<{
    id: string
    title: string
    status: 'todo' | 'doing' | 'done'
  }>
}
```

**POST 示例**
```json
{
  "title": "Become a Senior Developer",
  "startDate": "2024-01-01",
  "deadline": "2026-12-31",
  "type": "longTerm"
}
```

## 5. 学习计划 Study Plan

| Method | Path | 描述 |
|--------|------|------|
| GET | `/api/study-plans` | 列出计划列表，含任务与进度 |
| POST | `/api/study-plans` | 新建计划（Modal “New Study Plan”）|
| PATCH | `/api/study-plans/{id}` | 更新标题、优先级、任务等 |
| DELETE | `/api/study-plans/{id}` | 删除计划 |
| PATCH | `/api/study-plans/{planId}/tasks/{taskId}` | 切换任务完成状态或编辑任务 |

**Plan 数据结构**
```ts
interface StudyPlan {
  id: number
  title: string
  progress: number
  priority: 'High' | 'Medium' | 'Low'
  tasks: Array<{
    id: number
    title: string
    completed: boolean
    duration: string // e.g. "45m"
  }>
}
```

## 6. 日程 Schedule 模块

| Method | Path | 查询/描述 |
|--------|------|------|
| GET | `/api/schedule` | `weekStart=2025-11-17`（ISO，周一），返回该周所有课/事件 |
| POST | `/api/schedule` | 新增课程/事件 |
| PATCH | `/api/schedule/{id}` | 编辑（时间、时长、标题、颜色）|
| DELETE | `/api/schedule/{id}` | 删除 |

**ScheduleItem**
```ts
interface ScheduleItem {
  id: string
  title: string
  start: string // ISO datetime
  end: string // ISO datetime 或 duration
  color: string // 主题色，例如 "orange"
  location?: string
  notes?: string
}
```
- 服务端需根据 `weekStart` 返回 `[Monday ... Sunday]` 之间的所有 item，供前端绘制网格。

## 7. 娱乐分类浏览

| Method | Path | 描述 |
|--------|------|------|
| GET | `/api/entertainment/categories/{type}` | 返回指定类型的推荐列表（供 `/entertainment/browse/[type]` 页面），需支持 `page`/`pageSize` + `nextPage`，以保障“加载更多”体验 |

**响应**
```json
{
  "success": true,
  "data": {
    "featured": Recommendation,
    "items": Recommendation[]
  }
}
```

## 8. 收藏夹统计

| Method | Path | 描述 |
|--------|------|------|
| GET | `/api/favorites/stats` | 返回电影/书籍/活动/游戏的收藏数量（Favorites 页顶部统计卡）|

**响应**
```json
{
  "success": true,
  "data": {
    "movie": 5,
    "book": 3,
    "activity": 2,
    "game": 4
  }
}
```

## 9. 其他建议

1. **分页与缓存**：对于娱乐推荐、日记等列表类接口，建议支持 `page`/`pageSize`，在响应 `data` 或 `meta` 中返回 `nextCursor/nextPage + hasMore`，配合缓存、速率限制保证外部源稳定。
2. **乐观更新**：前端目前直接更新 Context，可在响应里返回最新记录，方便同步。
3. **国际化**：日期时间一律使用 ISO 8601，避免时区歧义。
4. **安全**：API Key 等敏感字段仅入库加密存储，响应中返回掩码/别名；测试接口结果不可泄露原文。
5. **AI Chat 流式**：若后续需要类 ChatGPT 流式体验，可改为 `POST /api/ai/chat/stream` + SSE。

---
此文档可直接用于后端梳理数据模型及接口实现。如需新增模块（例如真实的 AI 推荐服务、通知推送等），可在此基础上扩展新的章节。
