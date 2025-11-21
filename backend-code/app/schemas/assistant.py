from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class AssistantConfigBase(BaseModel):
    name: str
    description: Optional[str] = None
    prompt: str
    model: str = "gpt-3.5-turbo"
    temperature: str = "0.7"
    max_tokens: int = 2000
    top_p: str = "1"
    frequency_penalty: str = "0"
    presence_penalty: str = "0"
    icon: str = "🤖"
    is_default: bool = False
    is_active: bool = True


class AssistantConfigCreate(AssistantConfigBase):
    config: Optional[Dict[str, Any]] = None


class AssistantConfigUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    prompt: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[str] = None
    max_tokens: Optional[int] = None
    top_p: Optional[str] = None
    frequency_penalty: Optional[str] = None
    presence_penalty: Optional[str] = None
    icon: Optional[str] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None


class AssistantConfig(AssistantConfigBase):
    id: int
    user_id: int
    config: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AssistantConfigResponse(AssistantConfig):
    pass