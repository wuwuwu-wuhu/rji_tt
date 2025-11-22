from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    prompt = Column(Text, nullable=False)
    icon = Column(String(10), default="🤖")
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    user = relationship("User", back_populates="agents")

    def __repr__(self):
        return f"<Agent(id={self.id}, name='{self.name}', user_id={self.user_id})>"


# Agent CRUD 操作
class AgentCRUD:
    def create(self, db, obj_in):
        db_obj = Agent(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get(self, db, id: int):
        return db.query(Agent).filter(Agent.id == id).first()

    def get_multi(self, db, user_id: int = None, skip: int = 0, limit: int = 100):
        query = db.query(Agent)
        if user_id:
            query = query.filter(Agent.user_id == user_id)
        return query.offset(skip).limit(limit).all()

    def get_by_user(self, db, user_id: int):
        return db.query(Agent).filter(Agent.user_id == user_id).all()

    def get_default_by_user(self, db, user_id: int):
        return db.query(Agent).filter(Agent.user_id == user_id, Agent.is_default == True).first()

    def update(self, db, db_obj, obj_in):
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db, id: int):
        obj = db.query(Agent).filter(Agent.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def set_default(self, db, agent_id: int, user_id: int):
        # 先将该用户的所有agent设为非默认
        db.query(Agent).filter(Agent.user_id == user_id).update({"is_default": False})
        
        # 将指定的agent设为默认
        agent = db.query(Agent).filter(Agent.id == agent_id, Agent.user_id == user_id).first()
        if agent:
            agent.is_default = True
            db.commit()
            db.refresh(agent)
        return agent


# 创建CRUD实例
agent = AgentCRUD()