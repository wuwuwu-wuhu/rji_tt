# LifeLog AI 前端开发指南

## 项目概述

LifeLog AI 是一个温馨风格的个人成长与生活管理应用，使用 Next.js 16 + React 19 + TypeScript 构建。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI库**: React 19 + Tailwind CSS + shadcn/ui
- **状态管理**: React Context + Hooks
- **API客户端**: 自定义封装的 Fetch API
- **类型安全**: TypeScript
- **样式**: Tailwind CSS + 自定义设计系统

## 开发环境设置

### 1. 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 2. 环境变量配置

复制环境变量示例文件：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：

```env
# API配置
NEXT_PUBLIC_API_URL=http://localhost:8000

# 开发环境配置
NODE_ENV=development
```

### 3. 启动开发服务器

```bash
# 启动前端开发服务器
pnpm dev

# 或
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
frontend-code-generation/
├── app/                    # Next.js App Router 页面
│   ├── auth/              # 认证页面
│   ├── diary/             # 日记相关页面
│   ├── entertainment/     # 娱乐页面
│   ├── goals/             # 目标页面
│   ├── schedule/          # 日程页面
│   ├── settings/          # 设置页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 基础组件
│   ├── layout/           # 布局组件
│   ├── diary/            # 日记组件
│   ├── entertainment/    # 娱乐组件
│   ├── goals/            # 目标组件
│   └── ai/               # AI 助手组件
├── contexts/             # React Context
│   ├── auth-context.tsx  # 认证上下文
│   ├── ai-assistant-context.tsx
│   └── recommendations-context.tsx
├── lib/                  # 工具库
│   ├── api.ts           # API 客户端
│   ├── services/        # API 服务
│   ├── hooks/           # 自定义 Hooks
│   └── utils.ts         # 工具函数
├── types/               # TypeScript 类型定义
├── public/              # 静态资源
└── styles/              # 样式文件
```

## API 集成

### API 客户端

项目使用自定义的 API 客户端 (`lib/api.ts`)，提供：

- 自动认证头管理
- 错误处理
- 请求/响应拦截
- TypeScript 类型安全

### API 服务

各个功能模块的服务类位于 `lib/services/`：

- `auth.ts` - 用户认证
- `diary.ts` - 日记管理
- `entertainment.ts` - 娱乐内容
- `goals.ts` - 目标管理
- `schedule.ts` - 日程管理

### 使用示例

```typescript
import { diaryService } from '@/lib/services/diary'
import { useApi } from '@/hooks/use-api'

// 在组件中使用
function DiaryList() {
  const { data, loading, error } = useApi(() => diaryService.getDiaries(), {
    immediate: true
  })

  if (loading) return <div>加载中...</div>
  if (error) return <div>错误: {error.message}</div>
  
  return (
    <div>
      {data?.items.map(diary => (
        <div key={diary.id}>{diary.title}</div>
      ))}
    </div>
  )
}
```

## 认证流程

### 认证上下文

使用 `AuthProvider` 包装应用，提供全局认证状态：

```typescript
import { useAuth } from '@/contexts/auth-context'

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth()
  
  // 使用认证状态
}
```

### 受保护路由

使用 `ProtectedRoute` 组件保护需要认证的页面：

```typescript
import { ProtectedRoute } from '@/contexts/auth-context'

function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>只有登录用户能看到的内容</div>
    </ProtectedRoute>
  )
}
```

## 错误处理

### 错误边界

项目包含多个错误边界组件：

- `ErrorBoundary` - 通用错误边界
- `ApiErrorBoundary` - API 错误处理
- `PageErrorBoundary` - 页面级错误处理

### API 错误处理

使用自定义 Hooks 处理 API 错误：

```typescript
import { useApi } from '@/hooks/use-api'

function MyComponent() {
  const { data, loading, error, execute } = useApi(
    () => apiService.someMethod(),
    {
      onError: (error) => {
        console.error('API 错误:', error)
      }
    }
  )
}
```

## 状态管理

### React Hooks

使用自定义 Hooks 管理状态：

- `useApi` - API 请求状态
- `useMutation` - 变更操作状态
- `usePaginatedApi` - 分页数据状态
- `useDebouncedApi` - 防抖请求状态

### Context API

使用 React Context 管理全局状态：

- `AuthContext` - 用户认证状态
- `AiAssistantContext` - AI 助手状态
- `RecommendationsContext` - 推荐内容状态

## 样式系统

### Tailwind CSS

使用 Tailwind CSS 进行样式开发，遵循设计系统：

- 颜色: 使用 `stone` 色系作为主色调
- 间距: 使用标准的间距系统
- 响应式: 移动优先的响应式设计

### shadcn/ui

使用 shadcn/ui 组件库：

```typescript
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
```

## 开发最佳实践

### 1. 组件开发

- 使用 TypeScript 确保类型安全
- 遵循单一职责原则
- 使用函数组件和 Hooks
- 保持组件纯净和可测试

### 2. API 集成

- 使用服务类封装 API 调用
- 处理加载和错误状态
- 使用 TypeScript 接口定义数据结构
- 实现适当的缓存策略

### 3. 错误处理

- 使用错误边界捕获组件错误
- 提供友好的错误信息
- 实现重试机制
- 记录错误日志

### 4. 性能优化

- 使用 React.memo 优化组件渲染
- 实现适当的懒加载
- 优化图片和资源加载
- 使用代码分割减少初始包大小

## 测试

### 运行测试

```bash
# 运行单元测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage
```

### 测试策略

- 单元测试: 测试组件逻辑和工具函数
- 集成测试: 测试 API 集成和用户流程
- E2E 测试: 测试完整的用户场景

## 部署

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

### 环境变量

生产环境需要设置以下环境变量：

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NODE_ENV=production
```

## 故障排除

### 常见问题

1. **API 连接失败**
   - 检查 `NEXT_PUBLIC_API_URL` 配置
   - 确认后端服务正在运行
   - 检查网络连接

2. **认证问题**
   - 清除浏览器 localStorage
   - 检查 token 是否过期
   - 确认 API 端点正确

3. **样式问题**
   - 确认 Tailwind CSS 配置正确
   - 检查 CSS 类名拼写
   - 清除浏览器缓存

### 调试技巧

1. 使用 React DevTools 调试组件状态
2. 使用浏览器开发者工具检查网络请求
3. 查看控制台错误信息
4. 使用 TypeScript 严格模式捕获类型错误

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。