# LifeLog AI 快速启动指南

## 🚀 超简单启动（推荐）

### 方法1: 使用快速启动脚本

**Windows用户:**
```bash
# 双击运行或在命令行执行
quick-start.bat
```

**macOS/Linux用户:**
```bash
# 在终端执行
chmod +x quick-start.sh
./quick-start.sh
```

### 方法2: 手动启动（如果脚本有问题）

#### 步骤1: 启动后端（使用SQLite，无需安装PostgreSQL）

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

# 初始化SQLite数据库
python setup_database.py

# 启动后端服务
python main.py
```

后端将在 `http://localhost:8000` 启动

#### 步骤2: 启动前端

```bash
# 新开一个终端，进入前端目录
cd frontend-code-generation

# 安装依赖
npm install
# 或使用 pnpm
pnpm install

# 配置环境变量
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 启动前端
npm run dev
# 或使用 pnpm
pnpm dev
```

前端将在 `http://localhost:3000` 启动

## 🧪 测试功能

### 1. 访问应用
打开浏览器访问: `http://localhost:3000`

### 2. 注册新用户
- 点击右上角登录按钮
- 选择"注册"
- 填写信息:
  - 用户名: testuser
  - 邮箱: test@example.com  
  - 密码: 123456
  - 姓名: 测试用户

### 3. 登录测试
使用刚注册的账号登录

### 4. 测试日记功能
- 点击首页右下角的"+"按钮
- 写一篇测试日记
- 保存后查看首页

## 🔧 常见问题解决

### 问题1: 数据库连接失败
**解决方案**: 使用SQLite版本，我们已经配置好了

### 问题2: 前端无法连接后端
**解决方案**: 
1. 确保后端在 `http://localhost:8000` 运行
2. 检查 `frontend-code-generation/.env.local` 文件内容:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

### 问题3: 端口被占用
**解决方案**:
```bash
# 查看端口占用
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# macOS/Linux  
lsof -i :8000
lsof -i :3000

# 杀死进程
# Windows
taskkill /PID <进程ID> /F
# macOS/Linux
kill -9 <进程ID>
```

### 问题4: 依赖安装失败
**解决方案**:
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install

# Python依赖问题
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## 📱 移动端测试

在手机浏览器中访问: `http://你的电脑IP:3000`

查看电脑IP:
- Windows: `ipconfig`
- macOS: `ifconfig` 或 `ip a`

## 🎯 验证成功标志

✅ 后端启动成功: 访问 `http://localhost:8000` 看到 API 文档
✅ 前端启动成功: 访问 `http://localhost:3000` 看到应用界面
✅ 用户注册成功: 能够创建新账户
✅ 用户登录成功: 能够登录并看到用户信息
✅ 日记功能正常: 能够创建和查看日记

## 🆘 需要帮助？

如果遇到问题:

1. **查看后端日志**: 后端终端会显示详细错误信息
2. **查看前端控制台**: 按F12打开开发者工具查看Console
3. **检查端口**: 确保8000和3000端口没有被占用
4. **重启服务**: 有时候重启一下就能解决奇怪问题

## 🎉 成功！

如果一切正常，你现在可以:
- ✅ 注册和登录用户账户
- ✅ 创建和管理日记
- ✅ 体验完整的前后端集成
- ✅ 查看美观的用户界面

享受你的LifeLog AI应用吧！🚀