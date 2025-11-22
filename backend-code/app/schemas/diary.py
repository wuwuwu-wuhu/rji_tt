from pydantic import BaseModel, field_validator
from typing import Optional, List, Union
from datetime import datetime
import json


class DiaryBase(BaseModel):
    title: str
    content: str
    mood: str = "neutral"
    tags: Optional[List[str]] = None
    is_private: bool = True


class DiaryCreate(DiaryBase):
    pass


class DiaryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood: Optional[str] = None
    tags: Optional[List[str]] = None
    is_private: Optional[bool] = None


class Diary(DiaryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator('tags', mode='before')
    @classmethod
    def parse_tags(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                # 如果解析失败，返回空列表或原字符串
                return []
        return v

    class Config:
        from_attributes = True


class DiaryResponse(Diary):
    pass