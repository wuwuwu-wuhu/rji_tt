import json
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from app.db.base import CRUDBase
from app.models.diary import Diary
from app.schemas.diary import DiaryCreate, DiaryUpdate


class CRUDDiary(CRUDBase[Diary, DiaryCreate, DiaryUpdate]):
    def create_with_user(self, db: Session, *, obj_in: DiaryCreate, user_id: int) -> Diary:
        obj_in_data = obj_in.dict()
        if obj_in_data.get("tags"):
            obj_in_data["tags"] = json.dumps(obj_in_data["tags"])
        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Diary]:
        return (
            db.query(self.model)
            .filter(Diary.user_id == user_id)
            .order_by(desc(Diary.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_with_user(
        self, db: Session, *, db_obj: Diary, obj_in: DiaryUpdate
    ) -> Diary:
        update_data = obj_in.dict(exclude_unset=True)
        if "tags" in update_data:
            update_data["tags"] = json.dumps(update_data["tags"])
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def search_by_keyword(
        self, db: Session, *, user_id: int, keyword: str, skip: int = 0, limit: int = 100
    ) -> List[Diary]:
        return (
            db.query(self.model)
            .filter(
                and_(
                    Diary.user_id == user_id,
                    Diary.title.contains(keyword) | Diary.content.contains(keyword)
                )
            )
            .order_by(desc(Diary.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )


diary = CRUDDiary(Diary)