from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.get("/")
async def get_schedule(current_user: User = Depends(get_current_active_user)):
    """获取日程列表"""
    # TODO: 实现日程管理功能
    return {"message": "Schedule endpoint - to be implemented"}


@router.post("/")
async def create_schedule(current_user: User = Depends(get_current_active_user)):
    """创建新日程"""
    # TODO: 实现日程创建功能
    return {"message": "Create schedule endpoint - to be implemented"}