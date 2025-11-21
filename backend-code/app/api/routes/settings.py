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


@router.delete("/assistants/{config_id}", status_code=204)
async def delete_assistant_config(
    config_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除AI助手配置"""
    config = assistant_config.get(db, config_id)
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assistant config not found")
    assistant_config.remove(db, id=config_id)