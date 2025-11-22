# 导入所有模型以确保alembic能够检测到它们
from app.db.user import User
from app.db.assistant import assistant_config
from app.db.diary import diary
from app.db.entertainment import entertainment
from app.db.goal import goal, goal_log
from app.db.schedule import schedule
from app.db.base import Base

# 确保所有模型都在Base的metadata中
__all__ = [
    "User",
    "assistant_config",
    "diary",
    "entertainment",
    "goal",
    "goal_log",
    "schedule",
    "Base"
]