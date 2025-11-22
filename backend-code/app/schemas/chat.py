from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChatMessageBase(BaseModel):
    content: str
    role: str  # user, assistant, system


class ChatMessageCreate(ChatMessageBase):
    session_id: str
    assistant_config_id: Optional[int] = None


class ChatMessage(ChatMessageBase):
    id: int
    user_id: int
    session_id: str
    assistant_config_id: Optional[int] = None
    tokens_used: int
    model: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageResponse(ChatMessage):
    pass


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    assistant_config_id: Optional[int] = None
    use_knowledge_base: Optional[bool] = True


class ChatResponse(BaseModel):
    message: str
    session_id: str
    tokens_used: int
    model: str