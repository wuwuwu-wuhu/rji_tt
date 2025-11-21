import redis
from typing import Optional, Any
import json
from app.core.config import settings

# 创建Redis连接
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


class RedisCache:
    """Redis缓存工具类"""

    @staticmethod
    def get(key: str) -> Optional[Any]:
        """获取缓存数据"""
        try:
            data = redis_client.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception:
            return None

    @staticmethod
    def set(key: str, value: Any, expire: Optional[int] = None) -> bool:
        """设置缓存数据"""
        try:
            if expire is None:
                expire = settings.CACHE_EXPIRE_TIME
            return redis_client.setex(key, expire, json.dumps(value, default=str))
        except Exception:
            return False

    @staticmethod
    def delete(key: str) -> bool:
        """删除缓存数据"""
        try:
            return bool(redis_client.delete(key))
        except Exception:
            return False

    @staticmethod
    def exists(key: str) -> bool:
        """检查缓存是否存在"""
        try:
            return bool(redis_client.exists(key))
        except Exception:
            return False

    @staticmethod
    def clear_pattern(pattern: str) -> int:
        """清除匹配模式的所有缓存"""
        try:
            keys = redis_client.keys(pattern)
            if keys:
                return redis_client.delete(*keys)
            return 0
        except Exception:
            return 0