# 网络连接诊断指南

## 问题描述
当出现以下错误时，表示前端无法连接到后端服务：
```
API请求错误: {}
Failed to fetch
```

## 快速诊断步骤

### 1. 检查后端服务状态
在浏览器中直接访问以下URL：
```
http://localhost:8000
```

**预期结果**：应该看到JSON响应：
```json
{
  "message": "Welcome to LifeLog AI API",
  "version": "1.0.0",
  "docs": "/docs"
}
```

**如果无法访问**：
- 后端服务未启动
- 端口8000被占用
- 防火墙阻止连接

### 2. 检查API文档
访问API文档页面：
```
http://localhost:8000/docs
```

**预期结果**：应该看到Swagger UI文档页面

### 3. 检查浏览器控制台
按F12打开开发者工具，查看网络标签页：
1. 刷新页面
2. 查看失败的请求
3. 检查请求URL和响应状态

## 常见问题和解决方案

### 问题1：后端服务未启动
**症状**：无法访问 `http://localhost:8000`

**解决方案**：
```bash
cd backend-code
python main.py
```

**预期输出**：
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 问题2：端口被占用
**症状**：启动后端时出现端口占用错误

**解决方案**：
1. 查找占用端口的进程：
   ```bash
   netstat -ano | findstr :8000
   ```
2. 结束占用进程或使用其他端口

### 问题3：CORS问题
**症状**：浏览器控制台显示CORS错误

**解决方案**：
- 确保后端CORS配置包含前端端口
- 检查 `backend-code/main.py` 中的CORS设置

### 问题4：前端端口不匹配
**症状**：前端运行在不同端口但CORS未配置

**解决方案**：
1. 查看前端实际运行端口
2. 确认在 `backend-code/main.py` 中已添加该端口到CORS配置

## 高级诊断

### 使用curl测试连接
```bash
# 测试基础连接
curl http://localhost:8000

# 测试AI端点
curl -X POST http://localhost:8000/api/ai/test \
  -H "Content-Type: application/json" \
  -d '{}'

# 测试认证端点
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 检查网络配置
1. **防火墙设置**：确保端口8000未被阻止
2. **代理设置**：检查浏览器代理配置
3. **DNS解析**：确保localhost正确解析

## 开发环境检查清单

### 后端检查
- [ ] Python环境正确安装
- [ ] 依赖包已安装：`pip install -r requirements.txt`
- [ ] 数据库文件存在：`lifelog_ai.db`
- [ ] 环境变量配置正确：`.env`文件
- [ ] 后端服务启动成功

### 前端检查
- [ ] Node.js环境正确安装
- [ ] 依赖包已安装：`npm install`
- [ ] 环境变量配置正确：`.env.local`文件
- [ ] 前端服务启动成功
- [ ] 浏览器控制台无错误

### 网络检查
- [ ] 后端端口可访问：`http://localhost:8000`
- [ ] 前端端口可访问：`http://localhost:3000`
- [ ] CORS配置正确
- [ ] 防火墙设置正确

## 故障排除工具

### 1. 网络状态检查脚本
创建 `check-connection.js` 文件：
```javascript
// 在浏览器控制台中运行
fetch('http://localhost:8000')
  .then(r => r.json())
  .then(data => console.log('✅ 后端连接正常:', data))
  .catch(err => console.error('❌ 后端连接失败:', err));
```

### 2. 端口扫描工具
使用以下命令检查端口状态：
```bash
# Windows
netstat -an | findstr :8000

# Linux/Mac
lsof -i :8000
```

### 3. 服务状态监控
创建简单的监控脚本：
```python
# monitor.py
import requests
import time

def check_service():
    try:
        response = requests.get('http://localhost:8000')
        return response.status_code == 200
    except:
        return False

while True:
    if check_service():
        print("✅ 服务正常运行")
    else:
        print("❌ 服务异常")
    time.sleep(5)
```

## 联系支持

如果以上步骤都无法解决问题，请提供以下信息：

1. **错误详情**：
   - 完整的错误信息
   - 浏览器控制台截图
   - 网络请求详情

2. **环境信息**：
   - 操作系统版本
   - Python版本
   - Node.js版本
   - 浏览器版本

3. **服务状态**：
   - 后端启动日志
   - 前端启动日志
   - 端口占用情况

4. **配置文件**：
   - `.env`文件内容（隐藏敏感信息）
   - `.env.local`文件内容
   - `main.py`中的CORS配置

---

**更新时间**: 2025-11-22  
**版本**: 1.0