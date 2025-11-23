#!/usr/bin/env python3
"""
测试实际时区问题
验证数据库中存储的时间是否已经是中国时区时间
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.db.diary import Diary
from datetime import datetime, timezone
import json

def test_timezone_issue():
    """测试时区问题"""
    print("🔍 测试时区问题")
    print("=" * 60)
    
    db = next(get_db())
    
    # 获取最新的日记
    diary = db.query(Diary).order_by(Diary.id.desc()).first()
    
    if not diary:
        print("❌ 没有找到日记数据")
        return
    
    print(f"📝 日记ID: {diary.id}")
    print(f"📋 标题: {diary.title}")
    print(f"🕐 数据库原始时间: {diary.created_at}")
    print(f"🔍 时间类型: {type(diary.created_at)}")
    print(f"🔍 时区信息: {diary.created_at.tzinfo}")
    
    # 检查时间是否有时区信息
    if diary.created_at.tzinfo is None:
        print("⚠️  数据库中的时间没有时区信息")
        
        # 假设1：这是UTC时间，需要加8小时
        utc_time = diary.created_at.replace(tzinfo=timezone.utc)
        china_time = utc_time.astimezone(timezone(timedelta(hours=8)))
        print(f"🌍 假设1 - 如果是UTC时间:")
        print(f"   UTC时间: {utc_time}")
        print(f"   转换中国时间: {china_time}")
        
        # 假设2：这已经是中国时区时间，不需要转换
        print(f"🌍 假设2 - 如果已经是中国时区时间:")
        print(f"   直接显示: {diary.created_at}")
        
        # 获取当前时间进行对比
        now_utc = datetime.now(timezone.utc)
        now_china = now_utc.astimezone(timezone(timedelta(hours=8)))
        print(f"🕐 当前UTC时间: {now_utc}")
        print(f"🕐 当前中国时间: {now_china}")
        
        # 计算时间差
        time_diff = now_china - diary.created_at
        print(f"📊 时间差: {time_diff}")
        
        # 判断哪个假设更合理
        if abs(time_diff.total_seconds()) < 86400:  # 如果时间差小于24小时
            print("✅ 结论：数据库中的时间很可能已经是中国时区时间")
            print("💡 建议：前端不需要进行时区转换，直接显示原始时间")
        else:
            print("✅ 结论：数据库中的时间可能是UTC时间")
            print("💡 建议：前端需要加8小时进行时区转换")
    else:
        print("✅ 数据库中的时间有时区信息")
        print(f"🕐 带时区的时间: {diary.created_at}")

if __name__ == "__main__":
    from datetime import timedelta
    test_timezone_issue()