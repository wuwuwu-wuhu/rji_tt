# 依赖问题修复指南

## 问题描述

运行 `python setup_database.py` 时可能遇到以下错误：

### 错误1: 缺少依赖
```
ModuleNotFoundError: No module named 'python_jose'
```

### 错误2: 数据库连接失败
```
psycopg2.OperationalError: connection to server at "localhost", port 5432 failed
```

## 解决方案

### 1. 安装缺少的依赖

在虚拟环境中运行以下命令：

```bash
pip install python-jose[cryptography]==3.3.0
pip install passlib[bcrypt]==1.7.4
```

### 2. 修复数据库配置

**重要**: 项目已从PostgreSQL改为SQLite，无需安装PostgreSQL服务器。

确保 `.env` 文件中的数据库配置为：
```
DATABASE_URL=sqlite:///./lifelog_ai.db
```

如果配置错误，请修改 `.env` 文件第7行。

### 3. 更新requirements.txt

确保 `requirements.txt` 包含以下依赖：

```
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
```

### 4. 重新运行数据库初始化

```bash
python setup_database.py
```

## 验证成功

如果一切正常，你应该看到以下输出：

```
🗄️  初始化SQLite数据库...
✅ 数据库表创建成功！
✅ 创建演示用户: demo/demo123
🎉 数据库初始化完成！
```

## 测试账户

系统会自动创建一个演示账户：
- 用户名: demo
- 邮箱: demo@example.com
- 密码: demo123

## 后续步骤

1. 启动后端服务：`python main.py`
2. 启动前端服务：`npm run dev`
3. 访问 `http://localhost:3000` 测试应用

## 常见问题

### Q: 为什么改为SQLite？
A: SQLite无需安装数据库服务器，开箱即用，更适合开发和演示。

### Q: 如何切换回PostgreSQL？
A: 修改 `.env` 文件中的 `DATABASE_URL` 为PostgreSQL连接字符串，并确保PostgreSQL服务器运行。

### Q: 数据库文件在哪里？
A: SQLite数据库文件 `lifelog_ai.db` 会创建在 `backend-code` 目录下。

## 如果还有问题

### 清除并重新安装依赖
```bash
# 卸载可能有问题的包
pip uninstall python-jose passlib pyjwt -y

# 重新安装
pip install python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4 pyjwt==2.8.0
```

### 检查Python版本
确保使用Python 3.9+：
```bash
python --version
```

### 验证安装
```bash
# 测试导入
python -c "from jose import jwt; print('jose导入成功')"
python -c "from passlib.context import CryptContext; print('passlib导入成功')"
```

## 成功标志

运行 `python setup_database.py` 应该看到：
```
🗄️  初始化SQLite数据库...
✅ 数据库表创建成功！
✅ 创建演示用户: demo/demo123
🎉 数据库初始化完成！
```

然后启动后端应该看到：
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## 完整启动流程
1. `pip install -r requirements.txt`
2. `python setup_database.py`
3. `python main.py`
4. 在另一个终端启动前端