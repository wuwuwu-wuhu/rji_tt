#!/bin/bash

# 构建纯前端APK脚本

echo "开始构建纯前端APK..."

# 检查依赖
if ! command -v npm &> /dev/null; then
    echo "错误: npm 未安装"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "错误: npx 未安装"
    exit 1
fi

# 进入前端目录
cd ../../frontend-code-generation

# 安装依赖
echo "安装前端依赖..."
pnpm install

# 构建前端应用
echo "构建前端应用..."
pnpm build

# 安装Capacitor
echo "安装Capacitor..."
npm install @capacitor/cli @capacitor/core @capacitor/android

# 初始化Capacitor
echo "初始化Capacitor..."
npx cap init "LifeLog AI" "com.lifelog.ai.frontend"

# 复制配置文件
cp ../mobile-build/frontend-only/capacitor.config.ts .

# 添加Android平台
echo "添加Android平台..."
npx cap add android

# 同步资源
echo "同步资源..."
npx cap sync android

# 构建APK
echo "构建APK..."
cd android
./gradlew assembleDebug

# 复制APK到输出目录
cp app/build/outputs/apk/debug/app-debug.apk ../../mobile-build/output/LifeLogAI-Frontend.apk

echo "纯前端APK构建完成: mobile-build/output/LifeLogAI-Frontend.apk"