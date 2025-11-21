from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.utils.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.get("/movies")
async def get_movies(
    page: int = Query(1, ge=1),
    search: str = Query(None),
    current_user: User = Depends(get_current_active_user)
):
    """获取电影推荐"""
    # TODO: 实现电影推荐功能
    return {"message": "Movies endpoint - to be implemented"}


@router.get("/books")
async def get_books(
    page: int = Query(1, ge=1),
    search: str = Query(None),
    current_user: User = Depends(get_current_active_user)
):
    """获取书籍推荐"""
    # TODO: 实现书籍推荐功能
    return {"message": "Books endpoint - to be implemented"}


@router.get("/games")
async def get_games(
    page: int = Query(1, ge=1),
    search: str = Query(None),
    current_user: User = Depends(get_current_active_user)
):
    """获取游戏推荐"""
    # TODO: 实现游戏推荐功能
    return {"message": "Games endpoint - to be implemented"}


@router.get("/music")
async def get_music(
    page: int = Query(1, ge=1),
    search: str = Query(None),
    current_user: User = Depends(get_current_active_user)
):
    """获取音乐推荐"""
    # TODO: 实现音乐推荐功能
    return {"message": "Music endpoint - to be implemented"}


@router.get("/favorites")
async def get_favorites(
    current_user: User = Depends(get_current_active_user)
):
    """获取收藏列表"""
    # TODO: 实现收藏功能
    return {"message": "Favorites endpoint - to be implemented"}