#!/usr/bin/env python3
"""
检查日记数据的时区存储情况
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.db.diary import diary
from datetime import datetime
import pytz

def check_timezone_data():
    """检查数据库中日记的时间数据"""
    print("🔍 检查日记数据的时区存储情况")
    print("=" * 50)
    
    db = next(get_db())
    
    try:
        # 获取最新的几条日记
        diaries = diary.get_multi_by_user(db, user_id=3, skip=0, limit=5)
        
        if not diaries:
            print("❌ 没有找到日记数据")
            return
        
        print(f"📊 找到 {len(diaries)} 条日记")
        print()
        
        for i, diary_item in enumerate(diaries, 1):
            print(f"📝 日记 {i}:")
            print(f"   ID: {diary_item.id}")
            print(f"   标题: {diary_item.title}")
            print(f"   created_at (原始值): {diary_item.created_at}")
            print(f"   created_at 类型: {type(diary_item.created_at)}")
            
            if diary_item.created_at:
                # 检查时区信息
                if diary_item.created_at.tzinfo is not None:
                    print(f"   时区信息: {diary_item.created_at.tzinfo}")
                    print(f"   UTC时间: {diary_item.created_at.astimezone(pytz.UTC)}")
                    print(f"   中国时间: {diary_item.created_at.astimezone(pytz.timezone('Asia/Shanghai'))}")
                else:
                    print(f"   ⚠️  没有时区信息")
                    # 假设是UTC时间，添加时区信息
                    utc_time = diary_item.created_at.replace(tzinfo=pytz.UTC)
                    china_time = utc_time.astimezone(pytz.timezone('Asia/Shanghai'))
                    print(f"   假设UTC时间: {utc_time}")
                    print(f"   转换中国时间: {china_time}")
            
            print(f"   updated_at: {diary_item.updated_at}")
            print()
        
        # 检查当前时间
        print("🕐 当前时间信息:")
        utc_now = datetime.now(pytz.UTC)
        china_now = utc_now.astimezone(pytz.timezone('Asia/Shanghai'))
        print(f"   UTC现在: {utc_now}")
        print(f"   中国现在: {china_now}")
        print(f"   时差: {china_now - utc_now}")
        
    except Exception as e:
        print(f"❌ 检查失败: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_timezone_data()