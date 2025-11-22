# 技术栈与约束

## 前端技术栈

### 核心框架
- **Next.js 16**: 
  - 使用最新的App Router架构
  - 支持服务端组件和客户端组件混合
  - 内置优化：代码分割、图片优化、字体优化
  - 支持增量静态再生(ISR)

- **React 19**:
  - 最新的React版本，支持并发特性
  - 全面使用函数组件和Hooks
  - 自动批处理优化
  - Suspense边界支持

### 开发语言
- **TypeScript**:
  - 严格类型检查，提高代码质量
  - `tsconfig.json` 采用Next.js默认配置
  - 接口定义完整，类型安全
  - 支持路径映射和模块解析

### 样式系统
- **Tailwind CSS 4**:
  - 通过 `@tailwindcss/postcss` 管理PostCSS
  - 原子化CSS，快速开发
  - 响应式设计支持
  - 暗色主题支持

- **CSS-in-JS**:
  - 结合 `styled-components` 或 `emotion` (如需要)
  - 动态样式支持
  - 主题切换能力

### UI组件库
- **Radix UI生态**:
  - 无样式、可访问性优先的组件
  - 包含Dialog、Select、Tabs、Dropdown等
  - 完整的键盘导航和屏幕阅读器支持
  - 高度可定制化

- **自定义组件库**:
  - `components/ui` 目录封装基础组件
  - 基于 `class-variance-authority` 的变体管理
  - 使用 `clsx` 和 `tailwind-merge` 的样式合并
  - 统一的设计系统

### 状态管理
- **React Context**:
  - 轻量级状态管理方案
  - `AiAssistantProvider` 管理AI面板状态
  - `RecommendationsProvider` 管理推荐数据
  - 避免过度工程化

- **本地状态**:
  - 组件内部使用 `useState` 和 `useReducer`
  - 表单状态使用 `react-hook-form`
  - 服务器状态使用 `react-query` (如需要)

### 路由和导航
- **Next.js App Router**:
  - 基于文件系统的路由
  - 嵌套路由和布局支持
  - 动态路由和路由参数
  - 中间件支持

- **导航组件**:
  - `next/link` 用于客户端导航
  - `next/router` 用于程序化导航
  - 自定义导航组件封装

### 表单处理
- **react-hook-form**:
  - 高性能表单库
  - 与 `zod` 集成进行验证
  - 支持复杂表单场景
  - 优秀的性能表现

- **zod**:
  - TypeScript优先的模式验证
  - 类型推断支持
  - 与 `react-hook-form` 无缝集成

### 图标和视觉
- **lucide-react**:
  - 现代化图标库
  - SVG图标，支持自定义样式
  - 丰富的图标集合
  - Tree-shaking支持

### 数据获取
- **SWR/React Query**:
  - 服务器状态管理
  - 缓存、重试、乐观更新
  - 实时数据同步
  - 离线支持

### 工具库
- **日期处理**: `date-fns` 或 `dayjs`
- **数据可视化**: `recharts`
- **轮播组件**: `embla-carousel-react`
- **日期选择器**: `react-day-picker`
- **通知系统**: `sonner`

## 后端技术栈

### 核心框架
- **FastAPI**:
  - 现代化的Python Web框架
  - 基于Starlette和Pydantic
  - 自动API文档生成
  - 高性能异步支持
  - 类型提示支持

### 数据库
- **PostgreSQL**:
  - 强大的关系型数据库
  - 支持复杂查询和事务
  - JSON字段支持
  - 全文搜索能力
  - 扩展性强

- **数据库连接配置**:
  - 默认连接字符串: `postgresql://postgres:password@localhost:5432/lifelog_db`
  - 配置文件: `backend-code/app/core/config.py`
  - 环境变量: `DATABASE_URL` (在.env文件中设置)
  - 数据库名称: `lifelog_db`
  - 默认端口: 5432
  - 默认用户: `postgres`
  - 默认密码: `password`

- **数据库设置方式**:

  ### 开发环境（手动设置）
  1. **手动创建数据库**:
     ```bash
     # 连接到PostgreSQL
     psql -h localhost -U postgres
     
     # 创建数据库
     CREATE DATABASE lifelog_db;
     
     # 退出
     \q
     ```
  
  2. **初始化数据库表**:
     ```bash
     cd backend-code
     python init_db.py
     ```
  
  3. **运行数据库迁移** (可选):
     ```bash
     # 生成迁移文件
     alembic revision --autogenerate -m "Initial migration"
     
     # 应用迁移
     alembic upgrade head
     ```

  ### 生产环境（自动化设置）
  1. **使用Docker Compose一键部署**:
     ```bash
     # 启动所有服务（自动创建数据库和表）
     docker-compose up -d
     
     # 查看服务状态
     docker-compose ps
     
     # 查看日志
     docker-compose logs -f
     ```

  2. **自动化数据库设置脚本**:
     - `backend-code/setup_database.py` - 自动创建数据库和表
     - `backend-code/scripts/init-db.sh` - PostgreSQL容器初始化脚本
     - 支持等待数据库服务、自动创建数据库、初始化表结构

- **数据库查看方法**:
  1. **命令行工具**: `psql -h localhost -U postgres -d lifelog_db`
  2. **图形界面工具**: pgAdmin、DBeaver、DataGrip等
  3. **API文档**: 访问 `http://localhost:8000/docs` 查看数据库相关API
  4. **Docker容器**: `docker exec -it lifelog_postgres psql -U postgres -d lifelog_db`

- **数据库表结构**:
  - `users` - 用户表
  - `assistant_configs` - AI助手配置表
  - `diaries` - 日记表
  - `entertainment` - 娱乐内容表
  - `favorites` - 收藏表
  - `goals` - 目标表
  - `goal_logs` - 目标日志表
  - `schedules` - 日程表
  - `chat_messages` - 聊天消息表

- **SQLAlchemy**:
  - Python ORM框架
  - 数据库抽象层
  - 迁移支持
  - 查询构建器
  - 连接池管理

### 缓存系统
- **Redis**:
  - 内存数据库，高性能缓存
  - 支持多种数据结构
  - 持久化支持
  - 集群支持
  - 发布订阅功能

### 认证和安全
- **JWT认证**:
  - 无状态认证机制
  - 令牌刷新支持
  - 跨域支持
  - 安全性高

- **密码哈希**:
  - bcrypt算法
  - 盐值哈希
  - 抗彩虹表攻击

### 外部服务集成
- **OpenAI API**:
  - GPT模型集成
  - 聊天完成API
  - 嵌入API
  - 图像生成API

### 任务队列
- **Celery**:
  - 分布式任务队列
  - 异步任务处理
  - 定时任务支持
  - 任务监控

### API文档
- **Swagger UI**:
  - 交互式API文档
  - 在线测试功能
  - 自动生成
  - 标准化文档

- **ReDoc**:
  - 美观的API文档
  - 三栏布局
  - 搜索功能
  - 响应式设计

## 开发工具

### 包管理
- **前端**: pnpm
  - 快速、节省磁盘空间
  - 严格的依赖管理
  - 工作区支持
  - 安全性高

- **后端**: pip + virtualenv
  - Python包管理
  - 虚拟环境隔离
  - 依赖锁定
  - 版本控制

### 代码质量
- **ESLint**: JavaScript/TypeScript代码检查
- **Prettier**: 代码格式化
- **Black**: Python代码格式化
- **Flake8**: Python代码检查
- **MyPy**: Python类型检查

### 测试工具
- **前端**: Jest + React Testing Library
- **后端**: pytest + pytest-asyncio
- **E2E**: Playwright 或 Cypress
- **API测试**: Postman 或 Insomnia

### 版本控制
- **Git**: 分布式版本控制
- **GitHub**: 代码托管和协作
- **GitFlow**: 分支管理策略
- **Conventional Commits**: 提交信息规范

## 部署和运维

### Web应用部署
- **Docker**: 应用容器化
- **Docker Compose**: 多容器编排
- **多阶段构建**: 优化镜像大小
- **健康检查**: 容器健康监控

### 移动端打包技术

#### 打包策略
- **双APK方案**:
  - 纯前端APK：仅包含前端UI，连接远程API服务
  - 完整APK：包含前端UI和本地API服务，支持离线使用
- **打包技术**: Capacitor + PWA
- **目标平台**: Android (可扩展到iOS)

#### Capacitor配置
- **纯前端APK配置**:
  - App ID: `com.lifelog.ai.frontend`
  - 服务器URL: 远程API服务器地址
  - Web目录: `../../frontend-code-generation/out`
  
- **完整APK配置**:
  - App ID: `com.lifelog.ai.full`
  - 本地服务器: `http://localhost:8080`
  - 内置API服务: Flask + SQLite
  - 后台服务权限: WAKE_LOCK, FOREGROUND_SERVICE

#### 本地API服务 (完整APK)
- **技术栈**: Flask + SQLite + Python
- **数据库**: SQLite本地数据库
- **服务端口**: 8080
- **启动方式**: Android应用启动时自动启动本地Python服务
- **数据同步**: 支持本地SQLite与远程API数据同步

#### 构建流程
1. **前端构建**: Next.js → PWA → 静态文件
2. **Capacitor初始化**: 配置应用信息和权限
3. **Android平台添加**: 生成Android项目结构
4. **本地API集成** (完整APK): 复制Python服务到assets
5. **APK构建**: Gradle构建生成APK文件

#### 移动端特性
- **离线支持**: 完整APK支持离线使用
- **本地存储**: SQLite数据库存储用户数据
- **后台服务**: 本地API服务在后台运行
- **数据同步**: 网络可用时与远程服务器同步
- **权限管理**: 网络、存储、后台服务权限

### CI/CD
- **GitHub Actions**: 持续集成和部署
- **自动化测试**: 代码提交时自动运行
- **自动部署**: 主分支自动部署
- **回滚机制**: 部署失败自动回滚

### 监控和日志
- **日志管理**: 结构化日志
- **性能监控**: APM工具集成
- **错误追踪**: 错误收集和分析
- **健康检查**: 服务状态监控

## 技术约束

### 性能约束
- **前端性能**:
  - 首屏加载时间 < 3秒
  - 交互响应时间 < 100ms
  - Lighthouse评分 > 90
  - 包大小优化

- **后端性能**:
  - API响应时间 < 200ms
  - 数据库查询优化
  - 并发处理能力
  - 内存使用控制

### 兼容性约束
- **浏览器支持**:
  - Chrome/Edge: 最新版本
  - Firefox: 最新版本
  - Safari: 最新版本
  - 移动端浏览器支持

- **设备支持**:
  - 桌面端: 1920x1080及以上
  - 平板端: 768px-1024px
  - 手机端: 375px-768px
  - 响应式设计

### 安全约束
- **数据保护**:
  - HTTPS强制使用
  - 敏感数据加密
  - 输入验证和过滤
  - SQL注入防护

- **访问控制**:
  - 身份认证
  - 权限控制
  - API限流
  - 防暴力破解

### 可维护性约束
- **代码质量**:
  - 测试覆盖率 > 80%
  - 代码审查机制
  - 文档完整性
  - 代码规范统一

- **架构设计**:
  - 模块化设计
  - 低耦合高内聚
  - 接口标准化
  - 可扩展性

### 扩展性约束
- **水平扩展**:
  - 无状态设计
  - 负载均衡支持
  - 数据库分片准备
  - 缓存分布式

- **功能扩展**:
  - 插件化架构
  - API版本管理
  - 配置外部化
  - 特性开关

## 开发规范

### 代码规范
- **命名规范**: 有意义的变量和函数名
- **注释规范**: 关键逻辑注释
- **文件组织**: 合理的文件和目录结构
- **导入规范**: 清晰的模块导入

### Git规范
- **分支策略**: 功能分支开发
- **提交信息**: Conventional Commits规范
- **代码审查**: 所有代码必须经过审查
- **合并策略**: Squash merge保持历史清洁

### 测试规范
- **测试驱动**: 关键功能TDD开发
- **测试金字塔**: 单元测试为主，集成测试为辅
- **测试命名**: 清晰的测试用例命名
- **测试数据**: 独立的测试数据管理

### 文档规范
- **API文档**: 自动生成和手动补充
- **代码文档**: 关键函数和类文档
- **架构文档**: 系统设计和决策文档
- **部署文档**: 部署和运维指南