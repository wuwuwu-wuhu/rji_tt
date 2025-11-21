from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Entertainment(Base):
    __tablename__ = "entertainment"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    type = Column(String(20), nullable=False, index=True)  # movie, book, game, music
    description = Column(Text)
    rating = Column(Float)  # 评分
    year = Column(Integer)
    genre = Column(String(100))
    director = Column(String(100))  # 导演/作者等
    duration = Column(String(50))  # 时长/页数等
    image_url = Column(String(500))
    external_id = Column(String(100))  # 外部API的ID
    source = Column(String(50))  # 数据来源
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    favorites = relationship("Favorite", back_populates="entertainment")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    entertainment_id = Column(Integer, ForeignKey("entertainment.id"), nullable=False)
    status = Column(String(20), default="want")  # want, watching, finished
    rating = Column(Float)  # 用户评分
    notes = Column(Text)  # 用户笔记
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    user = relationship("User", back_populates="favorites")
    entertainment = relationship("Entertainment", back_populates="favorites")