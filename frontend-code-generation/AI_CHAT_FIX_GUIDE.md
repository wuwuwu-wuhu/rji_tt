# AI聊天功能修复指南

## 问题描述
用户反馈AI聊天功能出现"Failed to fetch"错误，控制台显示：
```
Console TypeError: Failed to fetch
```

## 已实施的修复措施

### 1. 增强API客户端调试日志
在 `frontend-code-generation/lib/api.ts` 中添加了详细的调试日志，包括：
- 请求URL和方法
- 请求头信息
- 认证token状态
- 响应状态和数据
- 错误详情和堆栈信息

### 2. 扩展CORS配置
在 `backend-code/main.py` 中扩展了允许的源地址：
```python
allow_origins=[
    "http://localhost:3000", 
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
]
```

### 3. 创建环境变量配置
创建了 `frontend-code-generation/.env.local` 文件，确保API URL正确配置：
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 用户排查步骤

### 步骤1：确认服务运行状态
1. 确保后端服务正在运行：
   ```bash
   cd backend-code
   python main.py
   ```
   应该看到服务启动在 `http://localhost:8000`

2. 确保前端服务正在运行：
   ```bash
   cd frontend-code-generation
   npm run dev
   ```
   注意查看前端运行的实际端口

### 步骤2：检查网络连接
1. 在浏览器中直接访问 `http://localhost:8000`，应该看到API欢迎信息
2. 访问 `http://localhost:8000/docs` 查看API文档

### 步骤3：查看浏览器控制台
1. 打开浏览器开发者工具（F12）
2. 切换到"网络"标签页
3. 尝试使用AI聊天功能
4. 查看失败的请求详情，特别注意：
   - 请求URL是否正确
   - 请求状态码
   - 错误详情

### 步骤4：检查认证状态
1. 确保用户已登录
2. 在浏览器开发者工具中检查localStorage中是否有 `auth_token`
3. 如果没有token，先登录获取认证

### 步骤5：测试API端点
在浏览器控制台中执行以下测试：
```javascript
// 测试基础连接
fetch('http://localhost:8000/')
  .then(r => r.json())
  .then(console.log)

// 测试AI测试端点（需要先登录）
fetch('http://localhost:8000/api/ai/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
})
  .then(r => r.json())
  .then(console.log)
```

## 常见问题解决方案

### 问题1：端口不匹配
**症状**：前端运行在不同端口，但CORS未配置
**解决**：
1. 查看前端实际运行端口
2. 在 `backend-code/main.py` 中添加对应端口到CORS配置

### 问题2：认证失败
**症状**：401 Unauthorized错误
**解决**：
1. 确保用户已登录
2. 检查localStorage中的auth_token
3. 如果token过期，重新登录

### 问题3：后端服务未启动
**症状**：连接被拒绝或超时
**解决**：
1. 启动后端服务：`cd backend-code && python main.py`
2. 检查端口8000是否被占用

### 问题4：数据库问题
**症状**：500服务器错误
**解决**：
1. 检查数据库连接
2. 确保数据库表已创建
3. 查看后端控制台错误信息

## 高级调试

### 启用详细日志
在前端代码中，我们已经添加了详细的调试日志。查看浏览器控制台可以看到：
- API请求详情
- 响应状态
- 错误信息

### 检查网络请求
使用浏览器开发者工具的网络标签页：
1. 清除网络日志
2. 触发AI聊天功能
3. 查看失败的请求
4. 检查请求头、响应头和响应体

### 后端日志检查
查看后端控制台输出，注意：
- 请求接收情况
- 错误信息
- 数据库查询结果

## 联系支持
如果以上步骤都无法解决问题，请提供以下信息：
1. 浏览器控制台完整错误信息
2. 网络请求失败的详细信息
3. 后端控制台输出
4. 前端和后端运行的具体端口
5. 操作系统和浏览器版本

## 更新记录
- 2025-11-22：添加详细调试日志和CORS配置扩展
- 2025-11-22：创建环境变量配置文件