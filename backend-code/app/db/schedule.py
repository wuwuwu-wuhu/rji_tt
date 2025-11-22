import json
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from datetime import datetime, timedelta

from app.db.base import CRUDBase
from app.models.schedule import Schedule
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate


class CRUDSchedule(CRUDBase[Schedule, ScheduleCreate, ScheduleUpdate]):
    def create_with_user(self, db: Session, *, obj_in: ScheduleCreate, user_id: int) -> Schedule:
        obj_in_data = obj_in.dict()
        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Schedule]:
        return (
            db.query(self.model)
            .filter(Schedule.user_id == user_id)
            .order_by(desc(Schedule.start_time))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_upcoming_by_user(
        self, db: Session, *, user_id: int, days: int = 7
    ) -> List[Schedule]:
        start_date = datetime.utcnow()
        end_date = start_date + timedelta(days=days)
        
        return (
            db.query(self.model)
            .filter(
                and_(
                    Schedule.user_id == user_id,
                    Schedule.start_time >= start_date,
                    Schedule.start_time <= end_date,
                    Schedule.is_completed == False
                )
            )
            .order_by(Schedule.start_time)
            .all()
        )

    def get_today_by_user(
        self, db: Session, *, user_id: int
    ) -> List[Schedule]:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        return (
            db.query(self.model)
            .filter(
                and_(
                    Schedule.user_id == user_id,
                    Schedule.start_time >= today_start,
                    Schedule.start_time < today_end
                )
            )
            .order_by(Schedule.start_time)
            .all()
        )

    def update_with_user(
        self, db: Session, *, db_obj: Schedule, obj_in: ScheduleUpdate
    ) -> Schedule:
        update_data = obj_in.dict(exclude_unset=True)
        return super().update(db, db_obj=db_obj, obj_in=update_data)


schedule = CRUDSchedule(Schedule)