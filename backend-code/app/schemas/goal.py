from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    priority: str = "medium"  # high, medium, low
    target_value: Optional[float] = None
    current_value: float = 0
    unit: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    unit: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    is_completed: Optional[bool] = None


class Goal(GoalBase):
    id: int
    user_id: int
    is_completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GoalResponse(Goal):
    pass


class GoalLogBase(BaseModel):
    value: float
    notes: Optional[str] = None


class GoalLogCreate(GoalLogBase):
    goal_id: int


class GoalLog(GoalLogBase):
    id: int
    goal_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class GoalLogResponse(GoalLog):
    pass