from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.db.diary import diary as diary_crud
from app.models.diary import Diary
from app.schemas.diary import Diary, DiaryCreate, DiaryUpdate, DiaryResponse
from app.utils.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=DiaryResponse)
async def create_diary(
    diary: DiaryCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建日记"""
    return diary_crud.create_with_user(db=db, obj_in=diary, user_id=current_user.id)


@router.get("/", response_model=List[DiaryResponse])
async def read_diaries(
    skip: int = 0,
    limit: int = 20,
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取日记列表"""
    if keyword:
        return diary_crud.search_by_keyword(
            db, user_id=current_user.id, keyword=keyword, skip=skip, limit=limit
        )
    return diary_crud.get_multi_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/{diary_id}", response_model=DiaryResponse)
async def read_diary(
    diary_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取单个日记"""
    diary = diary_crud.get(db, diary_id)
    if not diary or diary.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Diary not found")
    return diary


@router.put("/{diary_id}", response_model=DiaryResponse)
async def update_diary(
    diary_id: int,
    diary_update: DiaryUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新日记"""
    diary = diary_crud.get(db, diary_id)
    if not diary or diary.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Diary not found")
    return diary_crud.update_with_user(db, db_obj=diary, obj_in=diary_update)


@router.delete("/{diary_id}", status_code=204)
async def delete_diary(
    diary_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除日记"""
    diary = diary_crud.get(db, diary_id)
    if not diary or diary.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Diary not found")
    diary_crud.remove(db, id=diary_id)