import json
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from app.db.base import CRUDBase
from app.models.entertainment import Entertainment, Favorite
from app.schemas.entertainment import FavoriteCreate, FavoriteUpdate


class CRUDEntertainment(CRUDBase[Entertainment, dict, dict]):
    def get_multi_by_type(
        self, db: Session, *, entertainment_type: str, skip: int = 0, limit: int = 100
    ) -> List[Entertainment]:
        return (
            db.query(self.model)
            .filter(Entertainment.type == entertainment_type)
            .order_by(desc(Entertainment.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search_by_keyword(
        self, db: Session, *, keyword: str, skip: int = 0, limit: int = 100
    ) -> List[Entertainment]:
        return (
            db.query(self.model)
            .filter(
                Entertainment.title.contains(keyword) | 
                Entertainment.description.contains(keyword) |
                Entertainment.genre.contains(keyword)
            )
            .order_by(desc(Entertainment.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )


class CRUDFavorite(CRUDBase[Favorite, FavoriteCreate, FavoriteUpdate]):
    def create_with_user(self, db: Session, *, obj_in: FavoriteCreate, user_id: int) -> Favorite:
        obj_in_data = obj_in.dict()
        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Favorite]:
        return (
            db.query(self.model)
            .filter(Favorite.user_id == user_id)
            .order_by(desc(Favorite.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_user_and_entertainment(
        self, db: Session, *, user_id: int, entertainment_id: int
    ) -> Optional[Favorite]:
        return (
            db.query(self.model)
            .filter(
                and_(
                    Favorite.user_id == user_id,
                    Favorite.entertainment_id == entertainment_id
                )
            )
            .first()
        )

    def update_with_user(
        self, db: Session, *, db_obj: Favorite, obj_in: FavoriteUpdate
    ) -> Favorite:
        update_data = obj_in.dict(exclude_unset=True)
        return super().update(db, db_obj=db_obj, obj_in=update_data)


entertainment = CRUDEntertainment(Entertainment)
favorite = CRUDFavorite(Favorite)