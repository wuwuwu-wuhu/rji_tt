from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.utils.dependencies import get_current_active_user
from app.models.user import User as UserModel
from app.schemas.agent import Agent, AgentCreate, AgentUpdate
from app.models.agent import agent as agent_crud

router = APIRouter()


@router.get("/", response_model=List[Agent])
def get_agents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """获取当前用户的Agent列表"""
    agents = agent_crud.get_multi(db, user_id=current_user.id, skip=skip, limit=limit)
    return agents


@router.get("/default", response_model=Agent)
def get_default_agent(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """获取当前用户的默认Agent"""
    default_agent = agent_crud.get_default_by_user(db, user_id=current_user.id)
    if not default_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No default agent found"
        )
    return default_agent


@router.post("/", response_model=Agent)
def create_agent(
    agent_in: AgentCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """创建新的Agent"""
    # 如果是第一个Agent，自动设为默认
    existing_agents = agent_crud.get_by_user(db, user_id=current_user.id)
    if not existing_agents:
        agent_in.is_default = True
    
    agent_data = agent_in.dict()
    agent_data["user_id"] = current_user.id
    
    agent = agent_crud.create(db, obj_in=agent_data)
    return agent


@router.put("/{agent_id}", response_model=Agent)
def update_agent(
    agent_id: int,
    agent_in: AgentUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """更新Agent"""
    agent = agent_crud.get(db, id=agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    if agent.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this agent"
        )
    
    update_data = agent_in.dict(exclude_unset=True)
    agent = agent_crud.update(db, db_obj=agent, obj_in=update_data)
    return agent


@router.delete("/{agent_id}")
def delete_agent(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """删除Agent"""
    agent = agent_crud.get(db, id=agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    if agent.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this agent"
        )
    
    # 如果删除的是默认Agent，需要将其他Agent设为默认
    if agent.is_default:
        other_agents = agent_crud.get_by_user(db, user_id=current_user.id)
        other_agents = [a for a in other_agents if a.id != agent_id]
        if other_agents:
            agent_crud.set_default(db, agent_id=other_agents[0].id, user_id=current_user.id)
    
    agent_crud.delete(db, id=agent_id)
    return {"message": "Agent deleted successfully"}


@router.put("/{agent_id}/set-default", response_model=Agent)
def set_default_agent(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """设置默认Agent"""
    agent = agent_crud.get(db, id=agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    if agent.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this agent"
        )
    
    agent = agent_crud.set_default(db, agent_id=agent_id, user_id=current_user.id)
    return agent


@router.get("/{agent_id}", response_model=Agent)
def get_agent(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """获取特定Agent"""
    agent = agent_crud.get(db, id=agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    if agent.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this agent"
        )
    
    return agent