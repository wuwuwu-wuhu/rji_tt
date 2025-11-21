# LifeLog AI 移动端打包方案

## 打包目标

根据需求，需要生成两个APK：

1. **纯前端APK** - 仅包含前端UI，连接远程API服务
2. **完整APK** - 包含前端UI和后端API服务的完整应用

## 技术方案

### 方案一：React Native + 本地后端服务

#### 纯前端APK
- 使用React Native开发前端界面
- 连接远程API服务器
- 不包含后端代码

#### 完整APK
- React Native前端 + 嵌入式后端服务
- 使用React Native的后台服务
- 本地运行FastAPI后端

### 方案二：Capacitor + PWA（推荐）

#### 纯前端APK
- Next.js PWA应用
- Capacitor打包为APK
- 连接远程API

#### 完整APK
- Next.js PWA + 本地API服务
- Capacitor + 后台服务
- 内置SQLite数据库

### 方案三：Flutter + 本地服务器

#### 纯前端APK
- Flutter前端应用
- 连接远程API

#### 完整APK
- Flutter + 内置HTTP服务器
- 本地数据库存储

## 推荐方案：Capacitor + PWA

选择Capacitor方案的原因：
1. 可以复用现有的Next.js前端代码
2. 开发成本低，时间短
3. 支持PWA，用户体验好
4. 插件生态丰富

## 实施计划

### 第一阶段：纯前端APK
1. 将Next.js应用配置为PWA
2. 使用Capacitor打包为APK
3. 配置远程API连接

### 第二阶段：完整APK
1. 集成本地API服务
2. 配置本地数据库（SQLite）
3. 实现数据同步机制

## 文件结构

```
mobile-build/
├── frontend-only/          # 纯前端APK配置
│   ├── capacitor.config.ts
│   └── android/
├── full-app/              # 完整APK配置
│   ├── capacitor.config.ts
│   ├── android/
│   └── local-api/         # 本地API服务
└── scripts/               # 构建脚本
    ├── build-frontend.sh
    └── build-full.sh