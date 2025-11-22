# 前端错误修复指南

## 问题描述

前端应用可能出现以下错误：

### 1. 无限循环错误
```
Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

### 2. API连接失败
```
Failed to fetch
```

## 已修复的问题

### ✅ 无限循环问题修复

**问题原因**: 
- `auth-context.tsx` 中的 `useEffect` 依赖了 `fetchUser`，但 `fetchUser` 在每次渲染时都会重新创建
- `use-api.ts` 中的 `useCallback` 依赖项设置不当，导致函数重新创建

**修复方案**:
1. **认证上下文修复** (`contexts/auth-context.tsx`):
   ```typescript
   // 修复前
   useEffect(() => {
     // ... 认证逻辑
   }, [fetchUser]); // fetchUser每次都重新创建
   
   // 修复后
   useEffect(() => {
     // ... 认证逻辑
   }, []); // 只在组件挂载时执行一次
   ```

2. **API Hook修复** (`hooks/use-api.ts`):
   ```typescript
   // 修复前
   const execute = useCallback(async () => {
     // ... API逻辑
   }, [apiFunction, options, retryCount]); // 依赖项过多
   
   // 修复后
   const execute = useCallback(async () => {
     // ... API逻辑
   }, [apiFunction, options.retry, options.retryDelay, options.onError, options.onSuccess, retryCount]); // 精确依赖
   ```

### ✅ API连接配置

**环境变量配置** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**API客户端配置** (`lib/api.ts`):
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

## 验证修复效果

### 1. 检查无限循环是否修复

打开浏览器开发者工具，应该不再看到以下错误：
- `Maximum update depth exceeded`
- 控制台不再有重复的API请求

### 2. 检查API连接

1. **确保后端服务运行**:
   ```bash
   cd backend-code
   python main.py
   ```
   应该看到: `INFO: Uvicorn running on http://0.0.0.0:8000`

2. **测试API连接**:
   访问 `http://localhost:8000/docs` 应该看到API文档

3. **检查前端环境变量**:
   ```bash
   cd frontend-code-generation
   cat .env.local
   ```
   应该包含: `NEXT_PUBLIC_API_URL=http://localhost:8000`

## 常见问题排查

### Q: 仍然看到无限循环错误
**A**: 检查以下几点：
1. 确保已重启前端开发服务器
2. 清除浏览器缓存和localStorage
3. 检查是否有其他组件也存在类似问题

### Q: API请求仍然失败
**A**: 按以下步骤排查：
1. 确认后端服务正在运行
2. 检查端口是否被占用
3. 验证CORS配置是否正确
4. 检查防火墙设置

### Q: 登录后页面刷新丢失认证状态
**A**: 这是预期行为，因为：
1. 我们使用localStorage存储token
2. 页面刷新时会重新验证token
3. 如果token无效，会自动跳转到登录页

## 开发建议

### 1. 避免无限循环的最佳实践

```typescript
// ❌ 错误做法
useEffect(() => {
  fetchData();
}, [fetchData]); // fetchData每次都重新创建

// ✅ 正确做法
useEffect(() => {
  fetchData();
}, []); // 只在挂载时执行，或者使用稳定的依赖

// ✅ 或者使用useMemo/useCallback稳定函数
const stableFetchData = useCallback(fetchData, [stableDependencies]);
useEffect(() => {
  stableFetchData();
}, [stableFetchData]);
```

### 2. API错误处理

```typescript
// ✅ 良好的错误处理
const { data, loading, error } = useApi(() => apiService.getData(), {
  onError: (error) => {
    console.error('API错误:', error);
    // 显示用户友好的错误信息
  }
});
```

### 3. 调试技巧

1. **使用React DevTools** 检查组件重渲染
2. **在useEffect中添加日志** 追踪执行次数
3. **使用React.StrictMode** 发现潜在问题

## 测试步骤

1. **启动后端服务**:
   ```bash
   cd backend-code
   python main.py
   ```

2. **启动前端服务**:
   ```bash
   cd frontend-code-generation
   npm run dev
   ```

3. **测试功能**:
   - 访问 `http://localhost:3000`
   - 检查控制台无错误
   - 尝试注册/登录功能
   - 验证API请求正常

## 如果问题仍然存在

1. **清除所有缓存**:
   ```bash
   # 前端
   rm -rf .next
   npm install
   
   # 后端
   pip install -r requirements.txt
   ```

2. **重新初始化数据库**:
   ```bash
   cd backend-code
   python setup_database.py
   ```

3. **检查日志**:
   - 浏览器控制台日志
   - 后端终端输出
   - 网络面板的请求状态

通过以上步骤，应该能够解决前端的无限循环和API连接问题。