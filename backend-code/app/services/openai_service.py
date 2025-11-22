import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.redis import RedisCache


class OpenAIService:
    def __init__(self, api_key=None, base_url=None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.base_url = base_url or settings.OPENAI_BASE_URL
        self.cache = RedisCache()

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "gpt-3.5-turbo",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs
    ) -> Dict[str, Any]:
        """调用OpenAI聊天完成API"""
        if not self.api_key:
            raise ValueError("OpenAI API key not configured")

        # 缓存键
        cache_key = f"openai:chat:{hash(str(messages))}:{model}:{temperature}:{max_tokens}"

        # 尝试从缓存获取
        cached_response = self.cache.get(cache_key)
        if cached_response:
            return cached_response

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            **kwargs
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=120.0  # 增加超时时间到120秒，支持知识库数据
            )
            response.raise_for_status()
            result = response.json()

        # 缓存结果
        self.cache.set(cache_key, result, expire=300)  # 5分钟缓存

        return result

    async def test_connection(self) -> Dict[str, Any]:
        """测试API连接"""
        try:
            test_messages = [
                {"role": "user", "content": "Hello, this is a test message."}
            ]
            response = await self.chat_completion(
                messages=test_messages,
                max_tokens=10
            )
            return {
                "status": "success",
                "message": "API connection successful",
                "model": response.get("model"),
                "usage": response.get("usage")
            }
        except Exception as e:
            error_msg = str(e)
            # 提供更详细的错误信息
            if "401" in error_msg:
                return {
                    "status": "error",
                    "message": "API密钥无效或未配置。请检查设置中的API密钥是否正确。"
                }
            elif "404" in error_msg:
                return {
                    "status": "error",
                    "message": "API地址不正确。请检查供应商地址是否正确。"
                }
            elif "timeout" in error_msg.lower():
                return {
                    "status": "error",
                    "message": "连接超时。请检查网络连接或API地址是否可访问。"
                }
            else:
                return {
                    "status": "error",
                    "message": f"API连接失败: {error_msg}"
                }

    async def get_models(self) -> List[str]:
        """获取可用模型列表"""
        if not self.api_key:
            return []

        cache_key = "openai:models"
        cached_models = self.cache.get(cache_key)
        if cached_models:
            return cached_models

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/models",
                headers=headers,
                timeout=10.0
            )
            response.raise_for_status()
            models_data = response.json()

        models = [model["id"] for model in models_data.get("data", []) if "gpt" in model["id"]]

        # 缓存1小时
        self.cache.set(cache_key, models, expire=3600)

        return models


openai_service = OpenAIService()