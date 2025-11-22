import json
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from app.db.base import CRUDBase
from app.models.goal import Goal, GoalLog
from app.schemas.goal import GoalCreate, GoalUpdate, GoalLogCreate


class CRUDGoal(CRUDBase[Goal, GoalCreate, GoalUpdate]):
    def create_with_user(self, db: Session, *, obj_in: GoalCreate, user_id: int) -> Goal:
        obj_in_data = obj_in.dict()
        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Goal]:
        return (
            db.query(self.model)
            .filter(Goal.user_id == user_id)
            .order_by(desc(Goal.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_active_by_user(
        self, db: Session, *, user_id: int
    ) -> List[Goal]:
        return (
            db.query(self.model)
            .filter(
                and_(
                    Goal.user_id == user_id,
                    Goal.is_active == True,
                    Goal.is_completed == False
                )
            )
            .order_by(desc(Goal.created_at))
            .all()
        )

    def update_with_user(
        self, db: Session, *, db_obj: Goal, obj_in: GoalUpdate
    ) -> Goal:
        update_data = obj_in.dict(exclude_unset=True)
        return super().update(db, db_obj=db_obj, obj_in=update_data)


class CRUDGoalLog(CRUDBase[GoalLog, GoalLogCreate, dict]):
    def create_with_goal(self, db: Session, *, obj_in: GoalLogCreate, goal_id: int) -> GoalLog:
        obj_in_data = obj_in.dict()
        db_obj = self.model(**obj_in_data, goal_id=goal_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_goal(
        self, db: Session, *, goal_id: int, skip: int = 0, limit: int = 100
    ) -> List[GoalLog]:
        return (
            db.query(self.model)
            .filter(GoalLog.goal_id == goal_id)
            .order_by(desc(GoalLog.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )


goal = CRUDGoal(Goal)
goal_log = CRUDGoalLog(GoalLog)