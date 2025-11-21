from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


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

    class Config:
        from_attributes = True


class DiaryResponse(Diary):
    pass