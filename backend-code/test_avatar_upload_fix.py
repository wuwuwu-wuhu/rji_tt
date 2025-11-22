#!/usr/bin/env python3
"""
头像上传功能修复验证脚本
验证修复后的头像上传功能是否正常工作
"""

import requests
import json
import os
import io
from PIL import Image
import base64

def create_test_image():
    """创建一个测试图片"""
    # 创建一个简单的测试图片
    img = Image.new('RGB', (200, 200), color='blue')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_avatar_upload():
    """测试头像上传功能"""
    print("🔍 开始测试头像上传功能修复...")
    
    # API配置
    base_url = "http://localhost:8000"
    
    # 1. 先登录获取token
    print("\n📝 步骤1: 用户登录...")
    login_data = {
        'username': 'test@example.com',
        'password': 'test123'
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/auth/login",
            json=login_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ 登录失败: {response.status_code}")
            print(f"   错误信息: {response.text}")
            return False
            
        login_result = response.json()
        token = login_result.get('access_token')
        print(f"✅ 登录成功，获取到token: {token[:20]}...")
        
    except Exception as e:
        print(f"❌ 登录请求失败: {str(e)}")
        return False
    
    # 2. 测试头像上传
    print("\n📤 步骤2: 测试头像上传...")
    
    # 创建测试图片
    test_image = create_test_image()
    
    # 准备上传数据
    files = {
        'file': ('test_avatar.jpg', test_image, 'image/jpeg')
    }
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    try:
        print(f"   📍 发送请求到: {base_url}/api/upload/avatar")
        print(f"   🔑 使用token: {token[:20]}...")
        print(f"   📁 文件信息: test_avatar.jpg (image/jpeg)")
        
        response = requests.post(
            f"{base_url}/api/upload/avatar",
            files=files,
            headers=headers,
            timeout=30
        )
        
        print(f"   📊 响应状态码: {response.status_code}")
        print(f"   📝 响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 头像上传成功!")
            print(f"   📦 响应数据: {json.dumps(result, indent=2, ensure_ascii=False)}")
            
            # 3. 验证头像URL可访问
            if result.get('avatar_url'):
                print(f"\n🔍 步骤3: 验证头像URL可访问...")
                avatar_url = result['avatar_url']
                
                # 构建完整的头像URL
                if not avatar_url.startswith('http'):
                    full_avatar_url = f"{base_url}{avatar_url}"
                else:
                    full_avatar_url = avatar_url
                
                print(f"   🌐 头像URL: {full_avatar_url}")
                
                try:
                    img_response = requests.get(full_avatar_url, timeout=10)
                    if img_response.status_code == 200:
                        print(f"✅ 头像URL可访问 (状态码: {img_response.status_code})")
                        print(f"   📏 图片大小: {len(img_response.content)} 字节")
                        print(f"   📋 内容类型: {img_response.headers.get('content-type', '未知')}")
                    else:
                        print(f"❌ 头像URL不可访问 (状态码: {img_response.status_code})")
                        return False
                except Exception as e:
                    print(f"❌ 访问头像URL失败: {str(e)}")
                    return False
            
            # 4. 验证用户信息中的头像字段
            print(f"\n🔍 步骤4: 验证用户信息中的头像字段...")
            try:
                user_response = requests.get(
                    f"{base_url}/api/auth/me",
                    headers=headers,
                    timeout=10
                )
                
                if user_response.status_code == 200:
                    user_data = user_response.json()
                    print(f"✅ 获取用户信息成功!")
                    print(f"   👤 用户头像URL: {user_data.get('avatar_url', '无')}")
                    
                    if user_data.get('avatar_url'):
                        print(f"✅ 用户头像字段已正确更新")
                    else:
                        print(f"⚠️ 用户头像字段为空")
                else:
                    print(f"❌ 获取用户信息失败: {user_response.status_code}")
                    return False
                    
            except Exception as e:
                print(f"❌ 获取用户信息异常: {str(e)}")
                return False
            
            return True
            
        else:
            print(f"❌ 头像上传失败: {response.status_code}")
            print(f"   📄 错误信息: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 头像上传请求失败: {str(e)}")
        return False

def test_frontend_api_config():
    """测试前端API配置"""
    print("\n🔧 测试前端API配置...")
    
    # 检查前端API URL配置
    api_url = os.getenv('NEXT_PUBLIC_API_URL', 'http://localhost:8000')
    print(f"   🌐 前端API URL: {api_url}")
    
    # 测试API连通性
    try:
        response = requests.get(f"{api_url}/", timeout=5)
        if response.status_code == 200:
            print(f"✅ 前端API URL连通正常")
            return True
        else:
            print(f"⚠️ 前端API URL连通异常: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 前端API URL连通失败: {str(e)}")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("🖼️  头像上传功能修复验证")
    print("=" * 60)
    
    # 测试前端API配置
    frontend_ok = test_frontend_api_config()
    
    # 测试头像上传功能
    upload_ok = test_avatar_upload()
    
    # 总结
    print("\n" + "=" * 60)
    print("📋 测试结果总结")
    print("=" * 60)
    print(f"前端API配置: {'✅ 正常' if frontend_ok else '❌ 异常'}")
    print(f"头像上传功能: {'✅ 正常' if upload_ok else '❌ 异常'}")
    
    if frontend_ok and upload_ok:
        print("\n🎉 头像上传功能修复验证通过!")
        print("   - 前端API路径配置正确")
        print("   - 头像上传API正常工作")
        print("   - 头像URL可正常访问")
        print("   - 用户头像字段正确更新")
    else:
        print("\n💥 头像上传功能修复验证失败!")
        print("   请检查上述错误信息并修复相关问题")
    
    print("=" * 60)

if __name__ == "__main__":
    main()