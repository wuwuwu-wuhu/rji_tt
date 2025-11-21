from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EntertainmentBase(BaseModel):
    title: str
    type: str  # movie, book, game, music
    description: Optional[str] = None
    rating: Optional[float] = None
    year: Optional[int] = None
    genre: Optional[str] = None
    director: Optional[str] = None
    duration: Optional[str] = None
    image_url: Optional[str] = None
    external_id: Optional[str] = None
    source: Optional[str] = None


class Entertainment(EntertainmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EntertainmentResponse(Entertainment):
    pass


class FavoriteBase(BaseModel):
    status: str = "want"  # want, watching, finished
    rating: Optional[float] = None
    notes: Optional[str] = None


class FavoriteCreate(FavoriteBase):
    entertainment_id: int


class FavoriteUpdate(BaseModel):
    status: Optional[str] = None
    rating: Optional[float] = None
    notes: Optional[str] = None


class Favorite(FavoriteBase):
    id: int
    user_id: int
    entertainment_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    entertainment: Optional[Entertainment] = None

    class Config:
        from_attributes = True


class FavoriteResponse(Favorite):
    pass