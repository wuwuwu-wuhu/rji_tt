from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class AssistantConfig(Base):
    __tablename__ = "assistant_configs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    prompt = Column(Text, nullable=False)
    model = Column(String(50), default="gpt-3.5-turbo")
    temperature = Column(String(10), default="0.7")
    max_tokens = Column(Integer, default=2000)
    top_p = Column(String(10), default="1")
    frequency_penalty = Column(String(10), default="0")
    presence_penalty = Column(String(10), default="0")
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    icon = Column(String(50), default="🤖")
    config = Column(JSON)  # 额外的配置信息
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    user = relationship("User", back_populates="assistant_configs")
    chat_messages = relationship("ChatMessage", back_populates="assistant_config")