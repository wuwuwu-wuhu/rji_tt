#!/usr/bin/env python3
"""
数据库初始化脚本
"""
from sqlalchemy import create_engine
from app.core.database import Base
from app.core.config import settings
from app.models import *  # 导入所有模型

def init_database():
    """初始化数据库"""
    print("Creating database tables...")
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_database()