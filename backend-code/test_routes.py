#!/usr/bin/env python3
"""
测试路由注册情况
"""

import requests
import json

# API配置
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
DIARY_ROUTES_URL = f"{BASE_URL}/docs"  # 检查API文档

def test_routes():
    """测试路由注册"""
    print("🔍 检查API路由注册情况...")
    
    # 1. 登录获取token
    print("\n📝 步骤1: 用户登录")
    login_data = {
        'username': 'qwer@qq.com',
        'password': '1qaz2wsx'
    }
    
    try:
        response = requests.post(LOGIN_URL, json=login_data)
        if response.status_code == 200:
            token = response.json().get('access_token')
            print(f"   ✅ 登录成功，获取token: {token[:20]}...")
        else:
            print(f"   ❌ 登录失败: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"   ❌ 登录请求异常: {e}")
        return
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # 2. 测试不同的日记路由
    print("\n🔍 步骤2: 测试日记路由")
    
    # 测试路由列表
    test_routes = [
        ("/api/diary/", "GET", "获取日记列表"),
        ("/api/diary/export", "GET", "导出日记"),
        ("/api/diary/import", "POST", "导入日记"),
        ("/api/diary/999", "GET", "获取单个日记（测试ID）"),
    ]
    
    for route_path, method, description in test_routes:
        print(f"\n   📍 测试路由: {method} {route_path} - {description}")
        
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{route_path}", headers=headers)
            elif method == "POST":
                response = requests.post(f"{BASE_URL}{route_path}", headers=headers)
            
            print(f"      📊 状态码: {response.status_code}")
            
            if response.status_code == 422:
                print(f"      ⚠️ 路由存在但参数验证失败（这是正常的）")
            elif response.status_code == 404:
                print(f"      ❌ 路由不存在")
            elif response.status_code == 200:
                print(f"      ✅ 路由正常工作")
            else:
                print(f"      📄 响应: {response.text[:200]}...")
                
        except Exception as e:
            print(f"      ❌ 请求异常: {e}")
    
    # 3. 检查API文档中的路由
    print(f"\n📖 步骤3: 检查API文档")
    print(f"   🔗 请访问: {DIARY_ROUTES_URL}")
    print(f"   📋 在文档中查找 /api/diary 相关路由")
    
    print("\n🏁 路由测试完成")

if __name__ == "__main__":
    test_routes()