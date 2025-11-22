@echo off
echo ========================================
echo LifeLog AI 快速启动脚本
echo ========================================
echo.

:: 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js 18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Python，请先安装Python 3.9+
    echo 下载地址: https://www.python.org/
    pause
    exit /b 1
)

echo ✅ 环境检查通过
echo.

:: 启动后端
echo 🚀 启动后端服务...
cd backend-code

:: 检查虚拟环境
if not exist venv (
    echo 📦 创建Python虚拟环境...
    python -m venv venv
)

:: 激活虚拟环境
call venv\Scripts\activate

:: 安装依赖
echo 📦 安装后端依赖...
pip install -r requirements.txt

:: 检查环境变量文件
if not exist .env (
    echo ⚙️  创建后端环境变量文件...
    copy .env.example .env
    echo 请编辑 backend-code\.env 文件配置数据库连接
)

:: 初始化数据库
echo 🗄️  初始化数据库...
python init_db.py

:: 启动后端服务（在新窗口中）
start "LifeLog AI Backend" cmd /k "python main.py"

:: 返回项目根目录
cd ..

:: 启动前端
echo 🚀 启动前端服务...
cd frontend-code-generation

:: 安装依赖
echo 📦 安装前端依赖...
call pnpm install
if %errorlevel% neq 0 (
    echo pnpm安装失败，尝试使用npm...
    call npm install
)

:: 检查环境变量文件
if not exist .env.local (
    echo ⚙️  创建前端环境变量文件...
    copy .env.local.example .env.local
)

:: 启动前端服务
echo 🌐 启动前端开发服务器...
echo 前端将在 http://localhost:3000 启动
echo 后端在 http://localhost:8000 运行
echo.
echo 请等待几秒钟，然后打开浏览器访问: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务
echo.

call pnpm dev
if %errorlevel% neq 0 (
    echo pnpm dev失败，尝试使用npm...
    call npm run dev
)

pause