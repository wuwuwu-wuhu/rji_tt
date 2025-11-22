#!/usr/bin/env python3
"""
头像上传功能测试脚本
用于验证前端头像上传修复是否有效
"""

import requests
import json
import io
from PIL import Image
import base64

def create_test_image():
    """创建一个测试图片"""
    # 创建一个简单的测试图片
    img = Image.new('RGB', (100, 100), color='blue')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_avatar_upload():
    """测试头像上传功能"""
    print("🔍 [头像上传测试] 开始测试头像上传功能")
    
    try:
        # 1. 登录获取token
        print("\n1️⃣ 登录获取认证token...")
        login_data = {
            'username': 'test@example.com',
            'password': 'test123'
        }
        
        login_response = requests.post(
            'http://localhost:8000/api/auth/login',
            json=login_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if login_response.status_code != 200:
            print(f"   ❌ 登录失败: {login_response.status_code}")
            print(f"   📄 错误信息: {login_response.text}")
            return False
        
        token = login_response.json().get('access_token')
        print(f"   ✅ 登录成功，获取到token: {token[:20]}...")
        
        # 2. 获取当前头像信息
        print("\n2️⃣ 获取当前头像信息...")
        headers = {'Authorization': f'Bearer {token}'}
        
        info_response = requests.get(
            'http://localhost:8000/api/upload/avatar/info',
            headers=headers,
            timeout=10
        )
        
        if info_response.status_code == 200:
            info = info_response.json()
            print(f"   📋 当前头像信息: {info}")
        else:
            print(f"   ❌ 获取头像信息失败: {info_response.status_code}")
        
        # 3. 上传测试头像
        print("\n3️⃣ 上传测试头像...")
        test_image = create_test_image()
        
        files = {'file': ('test_avatar.jpg', test_image, 'image/jpeg')}  # 后端API期望的字段名是'file'
        upload_response = requests.post(
            'http://localhost:8000/api/upload/avatar',
            files=files,
            headers=headers,
            timeout=30
        )
        
        print(f"   📊 上传响应状态码: {upload_response.status_code}")
        
        if upload_response.status_code == 200:
            result = upload_response.json()
            print(f"   ✅ 头像上传成功!")
            print(f"   🔗 头像URL: {result.get('url')}")
            print(f"   📁 文件名: {result.get('filename')}")
            
            # 4. 验证头像更新
            print("\n4️⃣ 验证头像更新...")
            verify_response = requests.get(
                'http://localhost:8000/api/upload/avatar/info',
                headers=headers,
                timeout=10
            )
            
            if verify_response.status_code == 200:
                verify_info = verify_response.json()
                print(f"   📋 更新后头像信息: {verify_info}")
                
                if verify_info.get('has_avatar'):
                    print("   ✅ 头像更新验证成功!")
                    return True
                else:
                    print("   ❌ 头像更新验证失败: has_avatar仍为False")
                    return False
            else:
                print(f"   ❌ 验证头像信息失败: {verify_response.status_code}")
                return False
        else:
            print(f"   ❌ 头像上传失败: {upload_response.status_code}")
            print(f"   📄 错误信息: {upload_response.text}")
            return False
            
    except Exception as e:
        print(f"\n❌ 测试过程中发生异常: {str(e)}")
        return False

def test_frontend_api_url():
    """测试前端API URL配置"""
    print("\n🔍 [前端API测试] 测试前端API URL配置")
    
    # 模拟前端使用的API URL
    api_base_url = "http://localhost:8000"
    upload_url = f"{api_base_url}/api/upload/avatar"
    
    print(f"   🌐 前端将使用的上传URL: {upload_url}")
    
    try:
        # 测试URL是否可达
        response = requests.options(upload_url, timeout=5)
        print(f"   📊 OPTIONS请求状态码: {response.status_code}")
        print(f"   📋 允许的方法: {response.headers.get('Allow', '未知')}")
        print(f"   🌐 CORS头: {dict(response.headers)}")
        
        return True
    except Exception as e:
        print(f"   ❌ URL测试失败: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 LifeLog AI 头像上传功能测试")
    print("=" * 60)
    
    # 测试前端API URL配置
    api_test_result = test_frontend_api_url()
    
    # 测试头像上传功能
    upload_test_result = test_avatar_upload()
    
    print("\n" + "=" * 60)
    print("📊 测试结果总结:")
    print(f"   🔗 前端API URL测试: {'✅ 通过' if api_test_result else '❌ 失败'}")
    print(f"   📤 头像上传功能测试: {'✅ 通过' if upload_test_result else '❌ 失败'}")
    
    if api_test_result and upload_test_result:
        print("\n🎉 所有测试通过! 头像上传功能修复成功!")
    else:
        print("\n⚠️ 部分测试失败，请检查相关配置")
    
    print("=" * 60)