from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.db.assistant import assistant_config
from app.schemas.assistant import (
    AssistantConfig, AssistantConfigCreate, AssistantConfigUpdate, AssistantConfigResponse
)
from app.utils.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.post("/assistants", response_model=AssistantConfigResponse)
async def create_assistant_config(
    config: AssistantConfigCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建AI助手配置"""
    return assistant_config.create_with_user(db=db, obj_in=config, user_id=current_user.id)


@router.get("/assistants", response_model=List[AssistantConfigResponse])
async def read_assistant_configs(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取AI助手配置列表"""
    return assistant_config.get_multi_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/assistants/default", response_model=AssistantConfigResponse)
async def read_default_assistant_config(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取默认AI助手配置"""
    config = assistant_config.get_default_by_user(db, user_id=current_user.id)
    if not config:
        raise HTTPException(status_code=404, detail="Default assistant config not found")
    return config


@router.get("/assistants/{config_id}", response_model=AssistantConfigResponse)
async def read_assistant_config(
    config_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取单个AI助手配置"""
    config = assistant_config.get(db, config_id)
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assistant config not found")
    return config


@router.put("/assistants/{config_id}", response_model=AssistantConfigResponse)
async def update_assistant_config(
    config_id: int,
    config_update: AssistantConfigUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新AI助手配置"""
    config = assistant_config.get(db, config_id)
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assistant config not found")
    return assistant_config.update_with_user(db, db_obj=config, obj_in=config_update)


@router.delete("/assistants/{config_id}")
async def delete_assistant_config(
    config_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除AI助手配置"""
    config = assistant_config.get(db, config_id)
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assistant config not found")
    
    # 检查是否为默认配置
    if config.is_default:
        raise HTTPException(status_code=400, detail="Cannot delete default configuration")
    
    assistant_config.remove(db, id=config_id)
    return {"message": "Assistant config deleted successfully"}


@router.post("/assistants/{config_id}/set-default")
async def set_default_assistant_config(
    config_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """设置默认AI助手配置"""
    # 验证配置存在且属于当前用户
    config = assistant_config.get(db, config_id)
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assistant config not found")
    
    # 先取消所有默认配置
    db.query(assistant_config.model).filter(
        assistant_config.model.user_id == current_user.id
    ).update({"is_default": False})
    
    # 设置新的默认配置
    config.is_default = True
    db.commit()
    
    return {"message": "Default config set successfully"}