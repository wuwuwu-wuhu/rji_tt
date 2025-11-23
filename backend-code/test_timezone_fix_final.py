#!/usr/bin/env python3
"""
测试最终时区修复效果
验证前端时区转换逻辑是否正确
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.db.diary import Diary
from datetime import datetime, timezone
import json

def test_timezone_fix():
    """测试时区修复效果"""
    print("🔍 测试时区修复效果")
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
    
    # 模拟前端修复后的处理逻辑
    print("\n🔧 模拟前端修复后的处理:")
    
    # 1. 数据库时间（无时区信息）
    db_time_str = str(diary.created_at)
    print(f"   1. 数据库时间字符串: {db_time_str}")
    
    # 2. 前端构造UTC时间（添加'Z'表示UTC）
    frontend_utc_time_str = db_time_str + 'Z'
    print(f"   2. 前端构造UTC时间: {frontend_utc_time_str}")
    
    # 3. 转换为中国时区
    from datetime import datetime
    utc_time = datetime.fromisoformat(frontend_utc_time_str.replace('Z', '+00:00'))
    print(f"   3. 解析UTC时间: {utc_time}")
    
    # 4. 模拟JavaScript的toLocaleString转换
    # 这里我们手动计算中国时区时间
    from datetime import timedelta
    china_time = utc_time + timedelta(hours=8)
    print(f"   4. 转换中国时间: {china_time}")
    
    # 5. 格式化显示
    china_time_str = china_time.strftime('%Y/%m/%d %H:%M')
    print(f"   5. 格式化显示: {china_time_str}")
    
    # 获取当前时间进行对比
    now_utc = datetime.now(timezone.utc)
    now_china = now_utc.astimezone(timezone(timedelta(hours=8)))
    print(f"\n🕐 当前UTC时间: {now_utc.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🕐 当前中国时间: {now_china.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 计算时间差
    time_diff = now_china - china_time.replace(tzinfo=timezone(timedelta(hours=8)))
    print(f"📊 与当前时间差: {time_diff}")
    
    print(f"\n✅ 修复总结:")
    print(f"   - 数据库存储: {diary.created_at} (UTC时间，无时区标记)")
    print(f"   - 前端处理: 添加'Z'标记为UTC，然后转换为中国时区")
    print(f"   - 最终显示: {china_time_str} (中国时区)")
    print(f"   - 时间差: {time_diff} (应该小于24小时)")

if __name__ == "__main__":
    from datetime import timedelta
    test_timezone_fix()