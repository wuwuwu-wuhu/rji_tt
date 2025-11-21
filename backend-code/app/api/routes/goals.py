from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.get("/")
async def get_goals(current_user: User = Depends(get_current_active_user)):
    """获取目标列表"""
    # TODO: 实现目标管理功能
    return {"message": "Goals endpoint - to be implemented"}


@router.post("/")
async def create_goal(current_user: User = Depends(get_current_active_user)):
    """创建新目标"""
    # TODO: 实现目标创建功能
    return {"message": "Create goal endpoint - to be implemented"}