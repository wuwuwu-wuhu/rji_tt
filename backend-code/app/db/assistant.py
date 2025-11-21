from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.db.base import CRUDBase
from app.models.assistant import AssistantConfig
from app.schemas.assistant import AssistantConfigCreate, AssistantConfigUpdate


class CRUDAssistantConfig(CRUDBase[AssistantConfig, AssistantConfigCreate, AssistantConfigUpdate]):
    def create_with_user(self, db: Session, *, obj_in: AssistantConfigCreate, user_id: int) -> AssistantConfig:
        obj_in_data = obj_in.dict()

        # 如果设置为默认，先取消其他默认配置
        if obj_in_data.get("is_default"):
            db.query(AssistantConfig).filter(
                and_(AssistantConfig.user_id == user_id, AssistantConfig.is_default == True)
            ).update({"is_default": False})

        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[AssistantConfig]:
        return (
            db.query(self.model)
            .filter(AssistantConfig.user_id == user_id)
            .order_by(AssistantConfig.is_default.desc(), AssistantConfig.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_default_by_user(self, db: Session, *, user_id: int) -> Optional[AssistantConfig]:
        return (
            db.query(self.model)
            .filter(and_(AssistantConfig.user_id == user_id, AssistantConfig.is_default == True))
            .first()
        )

    def update_with_user(
        self, db: Session, *, db_obj: AssistantConfig, obj_in: AssistantConfigUpdate
    ) -> AssistantConfig:
        update_data = obj_in.dict(exclude_unset=True)

        # 如果设置为默认，先取消其他默认配置
        if update_data.get("is_default"):
            db.query(AssistantConfig).filter(
                and_(
                    AssistantConfig.user_id == db_obj.user_id,
                    AssistantConfig.id != db_obj.id,
                    AssistantConfig.is_default == True
                )
            ).update({"is_default": False})

        return super().update(db, db_obj=db_obj, obj_in=update_data)


assistant_config = CRUDAssistantConfig(AssistantConfig)