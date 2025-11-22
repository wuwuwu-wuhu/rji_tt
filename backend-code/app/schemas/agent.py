from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    prompt: str
    icon: str = "🤖"
    is_active: bool = True
    is_default: bool = False


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    prompt: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None


class Agent(AgentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgentResponse(Agent):
    pass