# AI供应商配置指南

## 问题描述
当使用AI聊天功能时，出现以下错误：
```
API connection failed: Client error '401 Unauthorized' for url 'https://api.openai.com/v1/chat/completions'
```

这个错误表示AI供应商API密钥无效、缺失或配置错误。

## 重要说明
本系统支持多种AI供应商，不仅限于OpenAI。您可以在设置界面中配置任何兼容OpenAI API格式的供应商，包括：
- OpenAI (GPT-3.5, GPT-4等)
- DeepSeek
- Claude (通过代理)
- 其他兼容OpenAI API格式的服务

## 解决方案

### 方法1：创建.env文件（推荐）

1. **复制环境变量模板**：
   ```bash
   cd backend-code
   cp .env.example .env
   ```

2. **编辑.env文件**：
   ```bash
   # 使用记事本或其他编辑器打开.env文件
   notepad .env
   ```

3. **配置OpenAI API密钥**：
   ```env
   # 将your-openai-api-key-here替换为你的真实API密钥
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   OPENAI_BASE_URL=https://api.openai.com/v1
   ```

### 方法2：使用环境变量

1. **Windows系统**：
   ```cmd
   set OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```

2. **PowerShell**：
   ```powershell
   $env:OPENAI_API_KEY="sk-your-actual-openai-api-key-here"
   ```

3. **Linux/Mac**：
   ```bash
   export OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```

## 获取OpenAI API密钥

1. **访问OpenAI官网**：https://platform.openai.com/
2. **登录或注册账户**
3. **进入API Keys页面**：
   - 点击右上角的个人头像
   - 选择"View API Keys"
4. **创建新的API密钥**：
   - 点击"Create new secret key"
   - 输入密钥名称（可选）
   - 点击"Create secret key"
5. **复制并保存密钥**：
   - ⚠️ **重要**：密钥只显示一次，请立即复制并妥善保存

## 验证配置

### 1. 检查后端配置
```python
# 在backend-code目录下运行Python
python -c "from app.core.config import settings; print(f'API Key: {settings.OPENAI_API_KEY[:10]}...' if settings.OPENAI_API_KEY else 'API Key: None')"
```

### 2. 测试API连接
启动后端服务后，访问：
```
http://localhost:8000/api/ai/test
```

### 3. 查看后端日志
启动后端服务时，检查控制台输出是否有相关错误信息。

## 常见问题

### Q: API密钥格式是什么样的？
A: OpenAI API密钥通常以`sk-`开头，例如：`sk-1234567890abcdef1234567890abcdef12345678`

### Q: 为什么还是401错误？
A: 请检查：
1. API密钥是否正确复制（没有多余空格）
2. API密钥是否有效（未过期）
3. 账户是否有足够的余额
4. 是否使用了正确的API端点

### Q: 如何检查API余额？
A: 访问OpenAI平台的Usage页面查看账户余额和使用情况。

### Q: 如何使用其他AI供应商？
A: 在设置界面中配置自定义供应商：
1. 进入设置页面
2. 在AI模型配置部分点击"添加配置"
3. 填写以下信息：
   - **供应商地址**：如`https://api.deepseek.com/v1`
   - **API密钥**：对应服务的API密钥
   - **模型名称**：如`deepseek-chat`
   - **其他参数**：根据需要调整温度、最大token等

### Q: 常见的AI供应商配置示例
A: 以下是常见供应商的配置示例：

**DeepSeek**:
- 供应商地址：`https://api.deepseek.com/v1`
- 模型名称：`deepseek-chat`

**Claude (通过代理)**:
- 供应商地址：`https://your-proxy.com/v1`
- 模型名称：`claude-3-sonnet-20240229`

**本地模型 (通过本地代理)**:
- 供应商地址：`http://localhost:8080/v1`
- 模型名称：`llama2-7b`

## 安全注意事项

1. **不要提交API密钥到版本控制系统**
2. **定期轮换API密钥**
3. **限制API密钥的权限和使用范围**
4. **监控API使用量和费用**

## 故障排除步骤

1. **确认API密钥正确**
   - 重新从OpenAI平台复制密钥
   - 检查是否有前导/后缀空格

2. **检查网络连接**
   ```bash
   curl https://api.openai.com/v1/models
   ```

3. **验证环境变量**
   ```bash
   echo $OPENAI_API_KEY  # Linux/Mac
   echo %OPENAI_API_KEY% # Windows
   ```

4. **重启后端服务**
   ```bash
   cd backend-code
   python main.py
   ```

5. **查看详细错误日志**
   检查后端控制台输出的完整错误信息。

## 配置示例

### 方法1：使用设置界面（推荐）
1. 登录系统后进入设置页面
2. 在AI模型配置部分点击"添加配置"
3. 填写供应商信息：
   ```
   供应商地址: https://api.deepseek.com/v1
   API密钥: your-deepseek-api-key
   模型名称: deepseek-chat
   ```
4. 点击"测试连接"验证配置
5. 保存配置并设为默认

### 方法2：环境变量配置（默认供应商）
完整的.env文件示例：
```env
# 应用配置
DEBUG=True
HOST=0.0.0.0
PORT=8000

# 数据库配置
DATABASE_URL=sqlite:///./lifelog_ai.db

# Redis配置
REDIS_URL=redis://localhost:6379/0

# JWT配置
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# 默认AI供应商配置
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1

# 日志级别
LOG_LEVEL=INFO
```

### 常见供应商配置示例

**DeepSeek**:
```
供应商地址: https://api.deepseek.com/v1
API密钥: sk-your-deepseek-api-key
模型名称: deepseek-chat
```

**OpenAI**:
```
供应商地址: https://api.openai.com/v1
API密钥: sk-your-openai-api-key
模型名称: gpt-3.5-turbo
```

**本地Ollama**:
```
供应商地址: http://localhost:11434/v1
API密钥: any-string (Ollama不需要真实密钥)
模型名称: llama2
```

## 联系支持

如果以上步骤都无法解决问题，请提供：
1. 完整的错误信息
2. .env文件中的配置（隐藏API密钥）
3. 后端服务的完整日志输出
4. 操作系统和Python版本信息

---

**更新时间**: 2025-11-22  
**版本**: 1.0