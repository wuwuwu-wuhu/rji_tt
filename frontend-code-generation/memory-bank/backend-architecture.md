# 后端技术选型与系统架构蓝图（Python）

## 1. 总体目标
- 为 LifeLog AI 提供统一的后端服务，满足娱乐推荐、AI 助手、目标/学习/日程管理等模块的数据需求。
- 负责聚合外部推荐源（电影、书籍、旅行/活动、游戏），并与用户自定义内容、收藏、偏好相结合。
- 支撑下拉刷新、无限滚动、收藏统计等前端交互，同时确保安全与性能。

## 2. 技术选型
| 模块 | 技术 | 说明 |
|------|------|------|
| Web 框架 | **FastAPI (Python 3.12)** | 高性能、类型友好，自动生成 OpenAPI 文档，易与前端契约对齐。|
| ORM/数据库 | **SQLAlchemy + PostgreSQL** | 结构化数据（用户、收藏、目标等）使用 Postgres；SQLAlchemy Pydantic 模型与 FastAPI 无缝配合。|
| 缓存 | **Redis (Redis Stack)** | 存储第三方推荐结果、分页 cursor、会话信息，减少外部 API 调用频率。|
| 任务队列 | **RQ / Celery + Redis** | 处理浏览器搜索、爬虫、批量同步第三方数据的异步任务。|
| HTTP 客户端 | **httpx + Async** | 调用外部 API（TMDB、Google Books、TripAdvisor、RAWG 等）使用异步 client，支持重试与超时。|
| 配置管理 | **Pydantic Settings + dotenv** | 分环境（dev/staging/prod）管理第三方 Key、数据库、缓存地址。|
| 身份认证 | **JWT (PyJWT) 或 OAuth2 Password Flow** | 与前端 Bearer Token 方案匹配。|
| 监控日志 | **StructLog + OpenTelemetry** | 统一日志格式，便于追踪外部调用、缓存命中率。|

## 3. 系统模块划分
```
┌────────────────────────────────────────┐
│               API Gateway             │
│ (FastAPI Routers: auth, settings,     │
│  entertainment, goals, diary, etc.)   │
└──────────────┬────────────────────────┘
               │依赖注入
┌──────────────┴────────────────────────┐
│             Service Layer             │
│ - RecommendationService               │
│   · 聚合外部 API + 自定义条目         │
│   · 分页/缓存/排序                    │
│ - FavoritesService                    │
│ - GoalsService / StudyPlanService     │
│ - DiaryService / ScheduleService      │
│ - AiConfigService (模型配置/测试)     │
└──────────────┬────────────────────────┘
               │
┌──────────────┴───────────────────────────────────────────┐
│                Infrastructure Layer                       │
│ - Repositories (SQLAlchemy CRUD)                          │
│ - CacheAdapters (Redis)                                   │
│ - ExternalAPIClients (TMDBClient, BooksClient, etc.)      │
│ - Task Queue Workers (Celery/RQ)                          │
└───────────────────────────────────────────────────────────┘
```

## 4. 核心流程
### 4.1 娱乐推荐
1. 前端调用 `GET /api/entertainment/recommendations?type=movie&page=1&pageSize=20`。
2. API Gateway 调用 `RecommendationService`：
   - 先查 Redis 缓存（`rec:movie:page1:v1`）。
   - 未命中则调用 `ExternalAggregator`（并发请求 TMDB/备用源）或读取数据库存量。
   - 将结果标准化为 `Recommendation` 模型，写入缓存，返回 `items/featured/nextPage/hasMore`。
3. 同时队列任务负责周期性刷新热门榜单、处理自定义搜索。

### 4.2 下拉刷新
- 前端重新请求 `page=1`，Service 可按时间戳或随机顺序返回新的数据版本，并在缓存 key 中加入 `version`（如 `rec:movie:page1:v2`）。
- 若启用浏览器搜索型采集，队列任务完成后更新数据库并 bump version。

### 4.3 收藏 & 统计
- `PATCH /entertainment/recommendations/{id}/like` 更新数据库 + Redis，使用事务/事件驱动保持 `favorites` 与统计一致。
- `GET /favorites/stats` 走缓存，后台任务定期刷新或在收藏变更后立即更新。

### 4.4 目标 / 学习计划 / 日程 / 日记
- 直接使用 PostgreSQL + SQLAlchemy Models；提供 RESTful CRUD（见 `api-spec.md`）。
- 可按模块拆分 Router，复用通用 Repository 模板。

### 4.5 AI 模型配置 & 测试
- `POST /api/ai/models`：加密存储 API Key（如使用 KMS 或 pgcrypto），返回掩码。
- `POST /api/ai/models/test`：短超时调用第三方模型接口，结果缓存 1 分钟，避免频繁测试。

## 5. 数据模型示例（SQLAlchemy）
```python
class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(BigInteger, primary_key=True)
    type = Column(Enum("movie", "book", "activity", "game", name="rec_type"))
    title = Column(String(255))
    subtitle = Column(String(255))
    description = Column(Text)
    rating = Column(Float)
    image_url = Column(String(512))
    accent_color = Column(String(32))
    duration = Column(String(64))
    release_date = Column(Date)
    source = Column(String(64))  # TMDB, GoogleBooks...
    source_ref = Column(String(128))
    created_at = Column(DateTime, server_default=func.now())
```

## 6. 部署拓扑
- **服务形态**：
  - `lifelog-api`：FastAPI 主服务，Uvicorn/Gunicorn 部署。
  - `lifelog-worker`：Celery/RQ Worker，处理外部采集、缓存刷新。
- **依赖**：PostgreSQL、Redis、对象存储（若需保存封面图/附件）、监控（Prometheus + Grafana）。
- **CI/CD**：GitHub Actions → Docker 镜像 → K8s / ECS / Serverless（任选）。可在流水线中运行 pytest、lint、mypy。

## 7. 安全与合规
- 所有第三方 API Key 存入 Secrets/Vault，不写入仓库。
- 对外 API 提供速率限制（Redis + Sliding Window），防止滥用。
- 日志中不记录敏感字段（API Key、用户个人内容），对查询参数做脱敏。

## 8. 实施路线建议
1. **初始化项目**：建立 FastAPI 骨架、配置管理、基础 Router/Model。 
2. **接入数据库与用户模块**：实现认证、设置、AI 配置等基础接口。
3. **实现娱乐推荐聚合**：先落地 TMDB/Google Books 适配器，再扩展其它来源；同时搭建缓存与任务队列。
4. **迁移前端数据**：逐模块替换 mock 数据，确保分页/刷新体验稳定。
5. **监控与优化**：加入日志、Tracing、性能测试，逐步高可用。

该蓝图可根据团队规模灵活裁剪：如果初期资源有限，可先省略 Celery，以同步方式 + Redis 缓存实现；随着外部调用增多再拆分为独立 worker。
