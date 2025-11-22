# LifeLog AI 运行指南

## 🚀 快速开始

### 前置要求

确保你的系统已安装：
- Node.js 18+ 
- Python 3.9+
- PostgreSQL 13+
- Redis (可选，用于缓存)

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend-code

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等

# 初始化数据库
python init_db.py

# 启动后端服务
python main.py
```

后端服务将在 `http://localhost:8000` 启动

### 2. 启动前端服务

```bash
# 进入前端目录
cd frontend-code-generation

# 安装依赖
pnpm install
# 或使用 npm
npm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 文件，确保 API_URL 指向正确的后端地址

# 启动开发服务器
pnpm dev
# 或使用 npm
npm run dev
```

前端服务将在 `http://localhost:3000` 启动

## 🔧 详细配置

### 后端环境变量配置

创建 `backend-code/.env` 文件：

```env
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/lifelog_ai

# Redis配置（可选）
REDIS_URL=redis://localhost:6379

# JWT密钥
SECRET_KEY=your-secret-key-here

# OpenAI API密钥（如果使用AI功能）
OPENAI_API_KEY=your-openai-api-key

# 环境设置
ENVIRONMENT=development
DEBUG=True
```

### 前端环境变量配置

创建 `frontend-code-generation/.env.local` 文件：

```env
# API配置
NEXT_PUBLIC_API_URL=http://localhost:8000

# 开发环境配置
NODE_ENV=development
```

## 🗄️ 数据库设置

### 使用Docker快速启动PostgreSQL

```bash
# 启动PostgreSQL容器
docker run --name lifelog-postgres \
  -e POSTGRES_DB=lifelog_ai \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:13

# 启动Redis容器（可选）
docker run --name lifelog-redis \
  -p 6379:6379 \
  -d redis:alpine
```

### 手动设置PostgreSQL

```sql
-- 连接到PostgreSQL
psql -U postgres

-- 创建数据库
CREATE DATABASE lifelog_ai;

-- 创建用户（可选）
CREATE USER lifelog_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lifelog_ai TO lifelog_user;
```

## 🧪 测试功能

### 1. 测试用户注册

1. 访问 `http://localhost:3000/auth/register`
2. 填写注册表单：
   - 用户名: testuser
   - 邮箱: test@example.com
   - 密码: password123
   - 姓名: 测试用户
3. 点击"注册"按钮
4. 成功后会自动跳转到首页

### 2. 测试用户登录

1. 访问 `http://localhost:3000/auth/login`
2. 使用注册的邮箱和密码登录
3. 成功后会跳转到首页并显示用户信息

### 3. 测试日记功能

1. 登录后，点击首页右下角的"+"按钮
2. 进入日记编写页面
3. 填写日记内容：
   - 标题: 我的第一篇日记
   - 内容: 这是测试日记内容
   - 心情: 选择一个心情
   - 标签: 测试,日记
4. 点击保存按钮
5. 返回首页查看新创建的日记

### 4. 测试API端点

使用curl或Postman测试后端API：

```bash
# 测试健康检查
curl http://localhost:8000/health

# 测试用户注册
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# 测试用户登录
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "password123"
  }'

# 测试获取日记列表（需要先登录获取token）
curl -X GET http://localhost:8000/api/diary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐛 故障排除

### 常见问题

#### 1. 前端无法连接后端

**症状**: 前端显示网络错误或API调用失败

**解决方案**:
- 检查后端服务是否在 `http://localhost:8000` 运行
- 确认 `frontend-code-generation/.env.local` 中的 `NEXT_PUBLIC_API_URL` 配置正确
- 检查防火墙设置

#### 2. 数据库连接失败

**症状**: 后端启动时显示数据库连接错误

**解决方案**:
- 确认PostgreSQL服务正在运行
- 检查 `backend-code/.env` 中的 `DATABASE_URL` 配置
- 确认数据库和用户已正确创建

#### 3. 认证失败

**症状**: 登录或注册失败

**解决方案**:
- 检查后端日志中的错误信息
- 确认JWT密钥配置正确
- 检查数据库中的用户表

#### 4. 前端依赖安装失败

**症状**: `pnpm install` 或 `npm install` 失败

**解决方案**:
- 清除缓存: `pnpm store prune` 或 `npm cache clean --force`
- 删除 `node_modules` 和 `package-lock.json`/`pnpm-lock.yaml`
- 重新安装依赖

### 调试技巧

#### 查看后端日志
```bash
# 在backend-code目录下
tail -f app.log
```

#### 查看前端控制台
1. 在浏览器中打开开发者工具 (F12)
2. 查看Console标签页的错误信息
3. 查看Network标签页的API请求状态

#### 检查数据库连接
```bash
# 测试PostgreSQL连接
psql -U postgres -h localhost -d lifelog_ai

# 查看表结构
\dt
```

## 📱 移动端测试

### 使用浏览器开发者工具

1. 在Chrome中打开开发者工具
2. 点击设备图标切换到移动端视图
3. 选择不同的设备尺寸测试响应式布局

### 使用真实设备测试

1. 确保移动设备和开发机器在同一网络
2. 查看开发机器的IP地址: `ipconfig` (Windows) 或 `ifconfig` (macOS/Linux)
3. 在移动设备浏览器中访问: `http://YOUR_IP:3000`

## 🚀 生产部署预览

### 构建生产版本

```bash
# 构建前端
cd frontend-code-generation
pnpm build

# 构建后端（如果需要）
cd ../backend-code
# 安装生产依赖
pip install -r requirements.txt
```

### 使用Docker Compose

```bash
# 在项目根目录创建docker-compose.yml
# 然后运行
docker-compose up -d
```

## 📞 获取帮助

如果遇到问题：

1. 查看项目文档: `DEVELOPMENT.md`
2. 检查Memory Bank文档: `memory-bank/` 目录
3. 查看后端API文档: `http://localhost:8000/docs`
4. 检查GitHub Issues（如果有）

## 🎯 下一步

成功运行后，你可以：

1. 测试所有已实现的功能
2. 探索代码结构和实现细节
3. 开始开发新功能
4. 参与项目贡献

祝你测试愉快！🎉