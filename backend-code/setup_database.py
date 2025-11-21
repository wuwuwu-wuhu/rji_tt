#!/usr/bin/env python3
"""
自动数据库设置脚本
支持自动创建数据库和初始化表结构
"""
import psycopg2
from psycopg2 import OperationalError
from sqlalchemy import create_engine
from app.core.database import Base
from app.core.config import settings
from app.models import *  # 导入所有模型
import time


def create_database_if_not_exists():
    """如果数据库不存在则创建"""
    # 从DATABASE_URL中提取连接信息
    db_url = settings.DATABASE_URL
    # 解析连接字符串，获取数据库名称
    # 格式: postgresql://user:password@host:port/dbname
    import re
    match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', db_url)
    if not match:
        print("无法解析数据库连接字符串")
        return False
    
    user, password, host, port, dbname = match.groups()
    
    # 连接到PostgreSQL默认数据库（通常是postgres）
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database='postgres'  # 连接到默认数据库
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # 检查数据库是否存在
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (dbname,))
        exists = cursor.fetchone()
        
        if not exists:
            print(f"创建数据库: {dbname}")
            cursor.execute(f"CREATE DATABASE {dbname}")
            print(f"数据库 {dbname} 创建成功")
        else:
            print(f"数据库 {dbname} 已存在")
        
        cursor.close()
        conn.close()
        return True
        
    except OperationalError as e:
        print(f"数据库连接错误: {e}")
        return False


def init_database_tables():
    """初始化数据库表"""
    try:
        print("创建数据库表...")
        engine = create_engine(settings.DATABASE_URL)
        Base.metadata.create_all(bind=engine)
        print("数据库表创建成功!")
        return True
    except Exception as e:
        print(f"创建数据库表时出错: {e}")
        return False


def wait_for_database(max_retries=30, retry_interval=2):
    """等待数据库可用"""
    print("等待数据库连接...")
    
    for i in range(max_retries):
        try:
            # 尝试连接数据库
            engine = create_engine(settings.DATABASE_URL)
            with engine.connect() as conn:
                print("数据库连接成功!")
                return True
        except Exception as e:
            print(f"数据库连接失败 (尝试 {i+1}/{max_retries}): {e}")
            time.sleep(retry_interval)
    
    print("无法连接到数据库，请检查配置")
    return False


def main():
    """主函数"""
    print("开始数据库自动设置...")
    
    # 等待数据库服务可用
    if not wait_for_database():
        return False
    
    # 创建数据库（如果不存在）
    if not create_database_if_not_exists():
        return False
    
    # 创建表结构
    if not init_database_tables():
        return False
    
    print("数据库设置完成!")
    return True


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)