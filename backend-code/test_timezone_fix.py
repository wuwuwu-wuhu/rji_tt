#!/usr/bin/env python3
"""
测试时区修复脚本
验证日记时区显示是否正确
"""

import requests
import json
from datetime import datetime, timezone, timedelta

def test_timezone_conversion():
    """测试时区转换功能"""
    print("🔍 测试时区转换功能")
    print("=" * 50)
    
    # 登录获取token
    try:
        login_data = {
            'username': 'test@example.com',
            'password': 'test123'
        }
        
        response = requests.post(
            'http://localhost:8000/api/auth/login',
            json=login_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ 登录失败: {response.status_code}")
            return
            
        token = response.json().get('access_token')
        print("✅ 登录成功")
        
        # 获取日记列表
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        diaries_response = requests.get(
            'http://localhost:8000/api/diary',
            headers=headers,
            timeout=10
        )
        
        if diaries_response.status_code != 200:
            print(f"❌ 获取日记失败: {diaries_response.status_code}")
            return
            
        diaries = diaries_response.json()
        print(f"✅ 获取到 {len(diaries)} 篇日记")
        
        if not diaries:
            print("⚠️ 没有日记数据，创建测试日记...")
            
            # 创建测试日记
            now = datetime.now(timezone.utc)
            test_diary = {
                'title': '时区测试日记',
                'content': f'这是一篇用于测试时区显示的日记。创建时间: {now.isoformat()}',
                'mood': '测试',
                'tags': ['测试', '时区'],
                'is_private': False
            }
            
            create_response = requests.post(
                'http://localhost:8000/api/diary',
                json=test_diary,
                headers=headers,
                timeout=10
            )
            
            if create_response.status_code == 200:
                print("✅ 测试日记创建成功")
                diaries = [create_response.json()]
            else:
                print(f"❌ 创建测试日记失败: {create_response.status_code}")
                return
        
        # 分析时区转换
        print("\n📊 时区转换分析:")
        print("-" * 30)
        
        for i, diary in enumerate(diaries[:3]):  # 只显示前3篇
            created_at = diary.get('created_at')
            if not created_at:
                continue
                
            print(f"\n📝 日记 {i+1}:")
            print(f"   标题: {diary.get('title', '无标题')}")
            print(f"   原始时间 (UTC): {created_at}")
            
            # 解析UTC时间
            try:
                utc_time = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                print(f"   解析UTC时间: {utc_time}")
                
                # 转换为中国时区
                china_time = utc_time.astimezone(timezone(timedelta(hours=8)))
                print(f"   中国时区: {china_time}")
                print(f"   格式化时间: {china_time.strftime('%Y/%m/%d %H:%M')}")
                
                # 模拟前端转换逻辑
                frontend_china_str = utc_time.strftime('%Y/%m/%d %H:%M')
                print(f"   前端显示时间: {frontend_china_str}")
                
            except Exception as e:
                print(f"   ❌ 时间解析失败: {e}")
        
        # 测试导出功能
        print("\n🔍 测试导出功能:")
        export_response = requests.get(
            'http://localhost:8000/api/diary/export',
            headers=headers,
            timeout=30
        )
        
        if export_response.status_code == 200:
            print("✅ 导出功能正常")
            
            # 检查导出内容
            try:
                content = export_response.content.decode('utf-8')
                data = json.loads(content)
                
                export_info = data.get('export_info', {})
                print(f"   导出用户: {export_info.get('username')}")
                print(f"   导出时间: {export_info.get('export_date')}")
                print(f"   日记数量: {export_info.get('total_diaries')}")
                print(f"   时区信息: {export_info.get('export_timezone')}")
                
                # 检查第一篇日记的时间
                diaries = data.get('diaries', [])
                if diaries:
                    first_diary = diaries[0]
                    print(f"   第一篇日记时间: {first_diary.get('created_at')}")
                    
            except Exception as e:
                print(f"   ⚠️ 解析导出内容失败: {e}")
        else:
            print(f"❌ 导出失败: {export_response.status_code}")
            
    except Exception as e:
        print(f"❌ 测试失败: {e}")

if __name__ == "__main__":
    test_timezone_conversion()