# AI供应商配置调试指南

## 问题描述

用户反馈AI聊天功能使用了错误的供应商。用户配置的是DeepSeek，但系统显示的是OpenAI的模型。

## 调试措施

我们已经添加了详细的调试日志系统，包括文件输出和控制台输出，来帮助诊断供应商配置问题。

### 1. 日志系统配置

**日志文件位置**：`backend-code/ai_vendor_debug.log`

**日志特性**：
- 同时输出到文件和控制台
- 包含时间戳、日志级别和详细信息
- UTF-8编码支持中文
- 自动追加模式，不会覆盖之前的日志

### 2. 添加的调试日志

#### AI聊天功能调试
在 `backend-code/app/api/routes/ai.py` 的 `chat_with_ai` 函数中添加了：

```python
logger.info(f"调试信息 - 助手配置ID: {assistant_cfg.id}")
logger.info(f"调试信息 - 配置的模型: {assistant_cfg.model}")
logger.info(f"调试信息 - API配置: {api_config}")
logger.info(f"调试信息 - 供应商URL: {vendor_url}")
logger.info(f"调试信息 - API密钥: {'已设置' if api_key else '未设置'}")

if vendor_url and api_key:
    logger.info(f"调试信息 - 使用自定义供应商: {vendor_url}")
    ai_service = openai_service.__class__(api_key=api_key, base_url=vendor_url)
else:
    logger.info(f"调试信息 - 使用默认OpenAI服务")
    ai_service = openai_service
```

#### 测试连接功能调试
在 `test_ai_connection` 函数中添加了：

```python
logger.info(f"测试连接 - 默认配置ID: {default_config.id}")
logger.info(f"测试连接 - 默认配置模型: {default_config.model}")
logger.info(f"测试连接 - API配置: {api_config}")
logger.info(f"测试连接 - 供应商URL: {vendor_url}")
logger.info(f"测试连接 - API密钥: {'已设置' if api_key else '未设置'}")

if vendor_url and api_key:
    logger.info(f"测试连接 - 使用自定义供应商: {vendor_url}")
    ai_service = openai_service.__class__(api_key=api_key, base_url=vendor_url)
```

## 立即调试步骤

### 1. 重启后端服务
```bash
# 停止当前后端服务 (Ctrl+C)

# 重新启动后端服务
cd backend-code
python main.py
```

### 2. 测试AI聊天功能
1. 打开前端应用
2. 点击AI助手按钮
3. 发送一条测试消息
4. 查看后端控制台的调试输出
5. 检查日志文件内容

### 3. 查看日志文件

#### 方法1：直接打开日志文件
```bash
# 在backend-code目录下
cat ai_vendor_debug.log
# 或者使用文本编辑器打开
notepad ai_vendor_debug.log  # Windows
```

#### 方法2：实时监控日志
```bash
# 实时查看日志更新
tail -f ai_vendor_debug.log  # Linux/Mac
# Windows PowerShell
Get-Content ai_vendor_debug.log -Wait
```

#### 方法3：过滤特定信息
```bash
# 查看包含"调试信息"的日志
grep "调试信息" ai_vendor_debug.log

# 查看包含"测试连接"的日志
grep "测试连接" ai_vendor_debug.log
```

### 4. 分析调试日志

#### 预期的正确日志（使用DeepSeek）：
```
2024-01-01 12:00:00,000 - app.api.routes.ai - INFO - 调试信息 - 助手配置ID: 1
2024-01-01 12:00:00,001 - app.api.routes.ai - INFO - 调试信息 - 配置的模型: deepseek-chat
2024-01-01 12:00:00,002 - app.api.routes.ai - INFO - 调试信息 - API配置: {'vendor_url': 'https://api.deepseek.com', 'api_key': 'sk-...'}
2024-01-01 12:00:00,003 - app.api.routes.ai - INFO - 调试信息 - 供应商URL: https://api.deepseek.com
2024-01-01 12:00:00,004 - app.api.routes.ai - INFO - 调试信息 - API密钥: 已设置
2024-01-01 12:00:00,005 - app.api.routes.ai - INFO - 调试信息 - 使用自定义供应商: https://api.deepseek.com
```

#### 问题日志（使用默认OpenAI）：
```
2024-01-01 12:00:00,000 - app.api.routes.ai - INFO - 调试信息 - 助手配置ID: 1
2024-01-01 12:00:00,001 - app.api.routes.ai - INFO - 调试信息 - 配置的模型: deepseek-chat
2024-01-01 12:00:00,002 - app.api.routes.ai - INFO - 调试信息 - API配置: {}
2024-01-01 12:00:00,003 - app.api.routes.ai - INFO - 调试信息 - 供应商URL: None
2024-01-01 12:00:00,004 - app.api.routes.ai - INFO - 调试信息 - API密钥: 未设置
2024-01-01 12:00:00,005 - app.api.routes.ai - INFO - 调试信息 - 使用默认OpenAI服务
```

## 可能的问题和解决方案

### 1. 配置未正确保存

**问题**：`API配置: {}` 为空
**原因**：供应商配置没有正确保存到数据库
**解决方案**：
1. 检查设置页面的配置保存功能
2. 确认供应商URL和API密钥已正确输入
3. 重新保存配置

### 2. 配置字段格式错误

**问题**：`API配置: {'vendor_url': '', 'api_key': ''}` 字段为空字符串
**原因**：前端传递了空值
**解决方案**：
1. 在设置页面重新输入供应商URL和API密钥
2. 确保没有多余的空格
3. 保存配置后重启后端服务

### 3. 数据库中的配置损坏

**问题**：配置存在但格式不正确
**解决方案**：
1. 检查数据库中的assistant_configs表
2. 查看config字段的内容
3. 必要时重新创建配置

## 数据库检查方法

### 1. 查看用户配置
```sql
SELECT id, name, model, config, is_default 
FROM assistant_configs 
WHERE user_id = [你的用户ID]
ORDER BY is_default DESC, id DESC;
```

### 2. 检查config字段内容
```sql
SELECT id, name, config 
FROM assistant_configs 
WHERE user_id = [你的用户ID] AND is_default = 1;
```

### 3. 正确的config字段格式
```json
{
  "vendor_url": "https://api.deepseek.com",
  "api_key": "sk-your-api-key-here"
}
```

## 前端设置检查

### 1. 访问设置页面
1. 登录应用
2. 进入设置页面
3. 查看AI助手配置

### 2. 验证配置内容
1. 确认供应商URL正确（如：https://api.deepseek.com）
2. 确认API密钥已正确输入
3. 确认配置已设为默认
4. 重新保存配置

## 常见供应商配置

### DeepSeek
```json
{
  "vendor_url": "https://api.deepseek.com",
  "api_key": "sk-your-deepseek-api-key"
}
```

### OpenAI
```json
{
  "vendor_url": "https://api.openai.com/v1",
  "api_key": "sk-your-openai-api-key"
}
```

### Claude
```json
{
  "vendor_url": "https://api.anthropic.com",
  "api_key": "sk-ant-your-claude-api-key"
}
```

## 故障排除流程

### 1. 检查调试日志
重启后端服务，发送测试消息，查看控制台输出

### 2. 验证数据库配置
使用SQL查询检查配置是否正确保存

### 3. 重新配置
如果配置有问题，在前端设置页面重新配置

### 4. 测试连接
使用设置页面的"测试连接"功能验证配置

### 5. 重启服务
保存配置后重启后端服务

## 预期结果

修复后，调试日志应该显示：
- ✅ `API配置` 包含正确的vendor_url和api_key
- ✅ `供应商URL` 显示正确的供应商地址
- ✅ `API密钥` 显示"已设置"
- ✅ `使用自定义供应商` 显示正确的供应商URL

## 相关文件

- **主要修复**: `backend-code/app/api/routes/ai.py`
- **配置指南**: `backend-code/OPENAI_CONFIG_GUIDE.md`
- **前端设置**: `frontend-code-generation/app/settings/page.tsx`

## 总结

通过添加详细的调试日志，我们现在可以准确诊断供应商配置问题。请按照以下步骤操作：

1. **重启后端服务**
2. **发送测试消息**
3. **查看调试日志**
4. **根据日志信息修复配置**
5. **重新测试**

调试日志将清楚显示系统是否正确使用了用户配置的供应商，以及配置中可能存在的问题。