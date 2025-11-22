#!/usr/bin/env python3
"""
创建agents表的脚本
"""
from app.core.database import get_db
from sqlalchemy import text

def create_agents_table():
    """直接创建agents表"""
    db = next(get_db())
    print('🔍 直接创建agents表:')

    create_table_sql = '''
    CREATE TABLE IF NOT EXISTS agents (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        prompt TEXT NOT NULL,
        icon VARCHAR(10),
        is_active BOOLEAN DEFAULT 1,
        is_default BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    '''

    create_index_sql = '''
    CREATE INDEX IF NOT EXISTS ix_agents_id ON agents (id)
    '''

    try:
        # 先创建表
        db.execute(text(create_table_sql))
        # 再创建索引
        db.execute(text(create_index_sql))
        db.commit()
        print('   ✅ agents表创建成功')
        
        # 验证表是否创建成功
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='agents'"))
        table_exists = result.fetchone()
        if table_exists:
            print('   ✅ 验证成功: agents表存在')
            
            # 检查表结构
            result = db.execute(text("PRAGMA table_info(agents)"))
            columns = result.fetchall()
            print('   📋 表结构:')
            for col in columns:
                print('      - {}: {} ({})'.format(col[1], col[2], 'NOT NULL' if col[3] else 'NULL'))
        else:
            print('   ❌ 验证失败: agents表不存在')
            
    except Exception as e:
        print('   ❌ 创建失败: {}'.format(str(e)))
        db.rollback()

if __name__ == "__main__":
    create_agents_table()