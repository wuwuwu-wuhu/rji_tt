# LifeLog AI Backend

智能生活日志助手后端服务

## 功能特性

- 🔐 用户认证和权限管理
- 🤖 AI助手配置管理
- 📝 日记模块CRUD操作
- 🎬 娱乐推荐和收藏功能
- 🎯 目标和学习计划管理
- 📅 日程安排管理
- 💬 AI聊天和模型测试
- 🗄️ Redis缓存和外部API集成

## 技术栈

- **FastAPI** - 现代化的Web框架
- **PostgreSQL** - 关系型数据库
- **Redis** - 缓存和会话存储
- **SQLAlchemy** - ORM框架
- **Alembic** - 数据库迁移
- **Pydantic** - 数据验证
- **JWT** - 身份认证
- **OpenAI API** - AI服务集成

## 快速开始

### 1. 环境准备

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境 (Windows)
venv\Scripts\activate

# 激活虚拟环境 (Linux/Mac)
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，配置数据库和API密钥
```

### 3. 数据库设置

```bash
# 初始化数据库
python init_db.py

# 运行数据库迁移（可选）
alembic upgrade head
```

### 4. 启动服务

```bash
# 开发模式启动
python run.py

# 或使用uvicorn直接启动
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. 访问API文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API端点

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户管理
- `GET /api/users/me` - 获取当前用户信息
- `PUT /api/users/me` - 更新当前用户信息

### AI助手配置
- `GET /api/settings/assistants` - 获取助手配置列表
- `POST /api/settings/assistants` - 创建助手配置
- `GET /api/settings/assistants/{id}` - 获取单个助手配置
- `PUT /api/settings/assistants/{id}` - 更新助手配置
- `DELETE /api/settings/assistants/{id}` - 删除助手配置

### 日记管理
- `GET /api/diary` - 获取日记列表
- `POST /api/diary` - 创建日记
- `GET /api/diary/{id}` - 获取单个日记
- `PUT /api/diary/{id}` - 更新日记
- `DELETE /api/diary/{id}` - 删除日记

### AI聊天
- `POST /api/ai/chat` - 与AI聊天
- `GET /api/ai/chat/history/{session_id}` - 获取聊天历史
- `POST /api/ai/test` - 测试AI连接
- `GET /api/ai/models` - 获取可用模型

## 开发说明

### 项目结构

```
backend-code/
├── app/
│   ├── api/             # API路由
│   │   └── routes/      # 各模块路由
│   ├── core/            # 核心配置
│   │   ├── config.py    # 应用配置
│   │   ├── database.py  # 数据库连接
│   │   ├── redis.py     # Redis配置
│   │   └── security.py  # 安全相关
│   ├── db/              # 数据库操作
│   ├── models/          # 数据库模型
│   ├── schemas/         # Pydantic模式
│   ├── services/        # 业务服务
│   └── utils/           # 工具函数
├── migrations/          # 数据库迁移
├── tests/              # 测试文件
├── main.py             # 应用入口
├── run.py              # 启动脚本
└── requirements.txt    # 依赖列表
```

### 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DATABASE_URL | 数据库连接字符串 | postgresql://postgres:password@localhost:5432/lifelog_db |
| REDIS_URL | Redis连接字符串 | redis://localhost:6379/0 |
| SECRET_KEY | JWT密钥 | your-secret-key-here |
| OPENAI_API_KEY | OpenAI API密钥 | None |
| DEBUG | 调试模式 | False |

## 部署

### Docker部署

```bash
# 构建镜像
docker build -t lifelog-ai-backend .

# 运行容器
docker run -d -p 8000:8000 --env-file .env lifelog-ai-backend
```

### 生产环境配置

1. 使用强密码和安全的SECRET_KEY
2. 配置HTTPS
3. 设置适当的CORS策略
4. 配置日志记录
5. 设置数据库连接池
6. 配置Redis集群（如需要）

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。