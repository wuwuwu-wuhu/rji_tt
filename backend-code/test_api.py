#!/usr/bin/env python3
"""
简单的API测试脚本
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_api():
    """测试API基本功能"""
    print("🚀 开始测试 LifeLog AI API...")

    # 测试根路径
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ 根路径测试通过")
            print(f"   响应: {response.json()}")
        else:
            print("❌ 根路径测试失败")
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到服务器，请确保服务已启动")
        return

    # 测试API文档
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ API文档可访问")
        else:
            print("❌ API文档不可访问")
    except Exception as e:
        print(f"❌ API文档测试失败: {e}")

    print("\n📚 可用的API端点:")
    endpoints = [
        "/api/auth/register - 用户注册",
        "/api/auth/login - 用户登录",
        "/api/users/me - 获取当前用户信息",
        "/api/settings/assistants - AI助手配置",
        "/api/diary - 日记管理",
        "/api/ai/chat - AI聊天",
        "/api/ai/test - AI连接测试",
        "/docs - Swagger文档",
        "/redoc - ReDoc文档"
    ]

    for endpoint in endpoints:
        print(f"   {endpoint}")

    print("\n🎉 测试完成！请访问 http://localhost:8000/docs 查看完整API文档")

if __name__ == "__main__":
    test_api()