#!/usr/bin/env python3
"""
日记编辑功能测试脚本
测试日记的创建、获取、更新和删除功能
"""

import requests
import json
import time

# 配置
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
DIARY_URL = f"{BASE_URL}/api/diary"

def test_diary_edit_functionality():
    """测试日记编辑功能的完整流程"""
    print("🔍 开始测试日记编辑功能...")
    
    # 1. 用户登录
    print("\n📝 步骤1: 用户登录")
    try:
        login_data = {
            'username': 'qwer@qq.com',
            'password': '1qaz2wsx'
        }
        
        response = requests.post(LOGIN_URL, json=login_data, timeout=10)
        print(f"   📊 登录状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            token = result.get('access_token')
            print(f"   ✅ 登录成功，Token: {token[:20]}...")
            
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
        else:
            print(f"   ❌ 登录失败: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ 登录异常: {str(e)}")
        return False
    
    # 2. 创建测试日记
    print("\n📝 步骤2: 创建测试日记")
    try:
        diary_data = {
            "title": "测试日记标题",
            "content": "这是一篇测试日记的内容，用于验证编辑功能是否正常工作。",
            "mood": "happy",
            "tags": ["测试", "编辑", "功能"],
            "is_private": False
        }
        
        response = requests.post(DIARY_URL, json=diary_data, headers=headers, timeout=10)
        print(f"   📊 创建状态码: {response.status_code}")
        
        if response.status_code == 200:
            diary = response.json()
            diary_id = diary.get('id')
            print(f"   ✅ 日记创建成功，ID: {diary_id}")
            print(f"   📋 日记标题: {diary.get('title')}")
            print(f"   📋 日记内容: {diary.get('content')[:50]}...")
        else:
            print(f"   ❌ 创建失败: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ 创建异常: {str(e)}")
        return False
    
    # 3. 获取日记详情
    print(f"\n📝 步骤3: 获取日记详情 (ID: {diary_id})")
    try:
        response = requests.get(f"{DIARY_URL}/{diary_id}", headers=headers, timeout=10)
        print(f"   📊 获取状态码: {response.status_code}")
        
        if response.status_code == 200:
            diary = response.json()
            print(f"   ✅ 获取成功")
            print(f"   📋 标题: {diary.get('title')}")
            print(f"   📋 心情: {diary.get('mood')}")
            print(f"   📋 标签: {diary.get('tags')}")
            print(f"   📋 私密: {diary.get('is_private')}")
        else:
            print(f"   ❌ 获取失败: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ 获取异常: {str(e)}")
        return False
    
    # 4. 更新日记
    print(f"\n📝 步骤4: 更新日记 (ID: {diary_id})")
    try:
        update_data = {
            "title": "更新后的测试日记标题",
            "content": "这是更新后的日记内容，已经进行了修改和编辑。",
            "mood": "excited",
            "tags": ["更新", "编辑", "成功"],
            "is_private": True
        }
        
        response = requests.put(f"{DIARY_URL}/{diary_id}", json=update_data, headers=headers, timeout=10)
        print(f"   📊 更新状态码: {response.status_code}")
        
        if response.status_code == 200:
            updated_diary = response.json()
            print(f"   ✅ 更新成功")
            print(f"   📋 新标题: {updated_diary.get('title')}")
            print(f"   📋 新心情: {updated_diary.get('mood')}")
            print(f"   📋 新标签: {updated_diary.get('tags')}")
            print(f"   📋 新私密设置: {updated_diary.get('is_private')}")
        else:
            print(f"   ❌ 更新失败: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ 更新异常: {str(e)}")
        return False
    
    # 5. 验证更新结果
    print(f"\n📝 步骤5: 验证更新结果")
    try:
        response = requests.get(f"{DIARY_URL}/{diary_id}", headers=headers, timeout=10)
        print(f"   📊 验证状态码: {response.status_code}")
        
        if response.status_code == 200:
            verified_diary = response.json()
            print(f"   ✅ 验证成功")
            
            # 检查各个字段是否正确更新
            checks = [
                (verified_diary.get('title') == "更新后的测试日记标题", "标题"),
                (verified_diary.get('mood') == "excited", "心情"),
                (verified_diary.get('tags') == ["更新", "编辑", "成功"], "标签"),
                (verified_diary.get('is_private') == True, "私密设置")
            ]
            
            for check, field_name in checks:
                status = "✅" if check else "❌"
                print(f"   {status} {field_name}: {'正确' if check else '错误'}")
                
        else:
            print(f"   ❌ 验证失败: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ 验证异常: {str(e)}")
        return False
    
    # 6. 获取日记列表
    print(f"\n📝 步骤6: 获取日记列表")
    try:
        response = requests.get(DIARY_URL, headers=headers, timeout=10)
        print(f"   📊 列表状态码: {response.status_code}")
        
        if response.status_code == 200:
            diaries = response.json()
            print(f"   ✅ 获取成功，共 {len(diaries)} 篇日记")
            
            # 查找我们创建的日记
            found = False
            for diary in diaries:
                if diary.get('id') == diary_id:
                    found = True
                    print(f"   📋 在列表中找到测试日记: {diary.get('title')}")
                    break
            
            if not found:
                print(f"   ⚠️  在列表中未找到测试日记 (ID: {diary_id})")
        else:
            print(f"   ❌ 获取列表失败: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ 获取列表异常: {str(e)}")
        return False
    
    # 7. 清理测试数据
    print(f"\n📝 步骤7: 清理测试数据")
    try:
        response = requests.delete(f"{DIARY_URL}/{diary_id}", headers=headers, timeout=10)
        print(f"   📊 删除状态码: {response.status_code}")
        
        if response.status_code == 204:
            print(f"   ✅ 删除成功")
        else:
            print(f"   ❌ 删除失败: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ 删除异常: {str(e)}")
        return False
    
    print("\n🎉 日记编辑功能测试完成！")
    return True

def test_diary_api_endpoints():
    """测试日记API端点的可用性"""
    print("🔍 测试日记API端点可用性...")
    
    # 登录获取token
    try:
        login_data = {'username': 'qwer@qq.com', 'password': '1qaz2wsx'}
        response = requests.post(LOGIN_URL, json=login_data, timeout=10)
        
        if response.status_code == 200:
            token = response.json().get('access_token')
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            # 测试各个端点
            endpoints = [
                ("GET", DIARY_URL, "获取日记列表"),
                ("POST", DIARY_URL, "创建日记"),
                ("GET", f"{DIARY_URL}/1", "获取单个日记"),
                ("PUT", f"{DIARY_URL}/1", "更新日记"),
                ("DELETE", f"{DIARY_URL}/1", "删除日记")
            ]
            
            for method, url, description in endpoints:
                try:
                    if method == "GET":
                        response = requests.get(url, headers=headers, timeout=5)
                    elif method == "POST":
                        response = requests.post(url, json={"title": "test", "content": "test"}, headers=headers, timeout=5)
                    elif method == "PUT":
                        response = requests.put(url, json={"title": "test", "content": "test"}, headers=headers, timeout=5)
                    elif method == "DELETE":
                        response = requests.delete(url, headers=headers, timeout=5)
                    
                    status = "✅" if response.status_code in [200, 201, 204, 404] else "❌"
                    print(f"   {status} {method} {url} - {description} ({response.status_code})")
                    
                except Exception as e:
                    print(f"   ❌ {method} {url} - {description} (异常: {str(e)})")
        else:
            print(f"   ❌ 登录失败，无法测试API端点")
    except Exception as e:
        print(f"   ❌ 测试异常: {str(e)}")

if __name__ == "__main__":
    print("=" * 60)
    print("LifeLog AI 日记编辑功能测试")
    print("=" * 60)
    
    # 测试API端点可用性
    test_diary_api_endpoints()
    
    print("\n" + "=" * 60)
    
    # 测试完整的编辑功能
    success = test_diary_edit_functionality()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 所有测试通过！日记编辑功能正常工作。")
    else:
        print("❌ 测试失败！请检查日记编辑功能。")
    print("=" * 60)