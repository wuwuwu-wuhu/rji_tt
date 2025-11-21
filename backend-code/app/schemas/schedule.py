from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ScheduleBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    category: Optional[str] = None
    priority: str = "medium"  # high, medium, low
    is_all_day: bool = False
    reminder_time: Optional[datetime] = None


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    is_all_day: Optional[bool] = None
    is_completed: Optional[bool] = None
    reminder_time: Optional[datetime] = None


class Schedule(ScheduleBase):
    id: int
    user_id: int
    is_completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ScheduleResponse(Schedule):
    pass