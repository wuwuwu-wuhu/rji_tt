# LifeLog AI 部署指南

## 快速开始

### 使用Docker Compose一键部署（推荐）

这是最简单的部署方式，适合开发和生产环境：

```bash
# 克隆项目
git clone <repository-url>
cd lifelog-ai

# 启动所有服务（自动创建数据库、初始化表结构）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

访问地址：
- 前端应用: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 服务架构

Docker Compose包含以下服务：

1. **PostgreSQL数据库** (端口5432)
   - 自动创建数据库 `lifelog_db`
   - 数据持久化存储
   - 健康检查

2. **Redis缓存** (端口6379)
   - 会话存储和缓存
   - 数据持久化

3. **后端API** (端口8000)
   - FastAPI应用
   - 自动数据库初始化
   - 依赖数据库和Redis服务

4. **前端应用** (端口3000)
   - Next.js应用
   - 依赖后端服务

## 环境配置

### 必需的环境变量

创建 `.env` 文件：

```bash
# OpenAI API密钥（必需，用于AI功能）
OPENAI_API_KEY=your-openai-api-key-here

# 其他配置（可选，有默认值）
SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=false
```

### 数据库配置

数据库连接信息在 `docker-compose.yml` 中配置：
- 数据库名: `lifelog_db`
- 用户名: `postgres`
- 密码: `password`
- 主机: `postgres` (容器名)

## 开发环境设置

### 手动设置（不使用Docker）

如果需要手动设置开发环境：

1. **安装PostgreSQL和Redis**
2. **创建数据库**:
   ```bash
   psql -h localhost -U postgres
   CREATE DATABASE lifelog_db;
   \q
   ```
3. **启动后端**:
   ```bash
   cd backend-code
   pip install -r requirements.txt
   python setup_database.py  # 自动创建数据库和表
   python run.py
   ```
4. **启动前端**:
   ```bash
   cd frontend-code-generation
   pnpm install
   pnpm dev
   ```

## 生产环境部署

### 安全配置

1. **更改默认密码**:
   - 修改 `docker-compose.yml` 中的PostgreSQL密码
   - 设置强密码的 `SECRET_KEY`

2. **环境变量**:
   - 设置 `OPENAI_API_KEY`
   - 设置 `DEBUG=false`
   - 配置适当的CORS设置

3. **HTTPS配置**:
   - 使用反向代理（如Nginx）
   - 配置SSL证书

### 扩展部署

1. **负载均衡**:
   ```yaml
   # 在docker-compose.yml中添加多个后端实例
   backend:
     # ... 现有配置
     deploy:
       replicas: 3
   ```

2. **数据库集群**:
   - 使用PostgreSQL主从复制
   - 配置连接池

3. **监控和日志**:
   - 集成Prometheus和Grafana
   - 配置日志聚合

## 故障排除

### 常见问题

1. **数据库连接失败**:
   ```bash
   # 检查PostgreSQL容器状态
   docker-compose logs postgres
   
   # 重启数据库服务
   docker-compose restart postgres
   ```

2. **前端无法连接后端**:
   ```bash
   # 检查后端服务状态
   docker-compose logs backend
   
   # 检查网络连接
   docker-compose exec frontend curl http://backend:8000
   ```

3. **AI功能不工作**:
   - 检查 `OPENAI_API_KEY` 是否设置
   - 查看后端日志中的API调用错误

### 重置环境

```bash
# 停止所有服务
docker-compose down

# 删除数据卷（注意：会删除所有数据）
docker-compose down -v

# 重新启动
docker-compose up -d
```

## 备份和恢复

### 数据库备份

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U postgres lifelog_db > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U postgres lifelog_db < backup.sql
```

### 数据卷备份

```bash
# 备份所有数据卷
docker run --rm -v lifelog_ai_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .
```

## 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 查看更新状态
docker-compose logs -f
```

---

## 支持

如果遇到问题，请：
1. 查看日志: `docker-compose logs -f`
2. 检查服务状态: `docker-compose ps`
3. 参考项目文档: `memory-bank-all/` 目录
4. 提交Issue到项目仓库