"""
简化的数据库设置脚本 - 使用SQLite
"""
import os
import sys
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.append(str(Path(__file__).parent))

from app.core.database import engine, Base
from app.db import user, diary, assistant

def init_sqlite_database():
    """初始化SQLite数据库"""
    print("🗄️  初始化SQLite数据库...")
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    print("✅ 数据库表创建成功！")
    
    # 创建示例用户（可选）
    from app.core.database import SessionLocal
    from app.db.user import User
    from app.core.security import get_password_hash
    
    db = SessionLocal()
    try:
        # 检查是否已有用户
        if db.query(User).count() == 0:
            # 创建示例用户
            demo_user = User(
                username="demo",
                email="demo@example.com",
                full_name="演示用户",
                hashed_password=get_password_hash("demo123"),
                is_active=True,
            )
            db.add(demo_user)
            db.commit()
            print("✅ 创建演示用户: demo/demo123")
        else:
            print("ℹ️  数据库中已有用户，跳过演示用户创建")
    except Exception as e:
        print(f"⚠️  创建演示用户时出错: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_sqlite_database()
    print("🎉 数据库初始化完成！")