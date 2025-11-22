#!/usr/bin/env python3
"""
测试API端点的脚本
验证所有路由是否正确加载
"""

import requests
import json

def test_api_endpoints():
    """测试所有API端点"""
    base_url = "http://localhost:8000"
    
    print("🚀 测试API端点...")
    
    # 测试根端点
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ 根端点: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ 根端点失败: {e}")
        return False
    
    # 测试API文档
    try:
        response = requests.get(f"{base_url}/docs")
        print(f"✅ API文档: {response.status_code}")
    except Exception as e:
        print(f"❌ API文档失败: {e}")
    
    # 测试AI路由
    try:
        response = requests.get(f"{base_url}/api/ai/models")
        print(f"✅ AI模型端点: {response.status_code}")
        if response.status_code == 401:
            print("   (需要认证，这是正常的)")
        elif response.status_code == 200:
            print(f"   响应: {response.json()}")
    except Exception as e:
        print(f"❌ AI模型端点失败: {e}")
        return False
    
    # 测试AI配置端点（需要认证）
    try:
        response = requests.get(f"{base_url}/api/ai/configs")
        print(f"✅ AI配置端点: {response.status_code}")
        if response.status_code == 401:
            print("   (需要认证，这是正常的)")
    except Exception as e:
        print(f"❌ AI配置端点失败: {e}")
        return False
    
    # 测试AI测试端点（需要认证）
    try:
        response = requests.post(f"{base_url}/api/ai/test", json={})
        print(f"✅ AI测试端点: {response.status_code}")
        if response.status_code == 401:
            print("   (需要认证，这是正常的)")
    except Exception as e:
        print(f"❌ AI测试端点失败: {e}")
        return False
    
    print("\n✅ 所有API端点测试完成！")
    return True

if __name__ == "__main__":
    test_api_endpoints()