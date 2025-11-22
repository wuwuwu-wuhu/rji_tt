#!/bin/bash

echo "========================================"
echo "LifeLog AI 快速启动脚本"
echo "========================================"
echo

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js 18+"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到Python，请先安装Python 3.9+"
    echo "下载地址: https://www.python.org/"
    exit 1
fi

echo "✅ 环境检查通过"
echo

# 启动后端
echo "🚀 启动后端服务..."
cd backend-code

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "📦 安装后端依赖..."
pip install -r requirements.txt

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚙️  创建后端环境变量文件..."
    cp .env.example .env
    echo "请编辑 backend-code/.env 文件配置数据库连接"
fi

# 初始化数据库
echo "🗄️  初始化数据库..."
python init_db.py

# 启动后端服务（在后台运行）
echo "🔧 启动后端服务..."
python main.py &
BACKEND_PID=$!

# 返回项目根目录
cd ..

# 启动前端
echo "🚀 启动前端服务..."
cd frontend-code-generation

# 检查pnpm
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
else
    echo "❌ 错误: 未找到pnpm或npm"
    exit 1
fi

# 安装依赖
echo "📦 安装前端依赖..."
$PKG_MANAGER install

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    echo "⚙️  创建前端环境变量文件..."
    cp .env.local.example .env.local
fi

# 启动前端服务
echo "🌐 启动前端开发服务器..."
echo "前端将在 http://localhost:3000 启动"
echo "后端在 http://localhost:8000 运行"
echo
echo "请等待几秒钟，然后打开浏览器访问: http://localhost:3000"
echo
echo "按 Ctrl+C 停止服务"
echo

# 启动前端
$PKG_MANAGER dev

# 清理：停止后端服务
echo "🛑 停止后端服务..."
kill $BACKEND_PID 2>/dev/null

echo "👋 再见！"