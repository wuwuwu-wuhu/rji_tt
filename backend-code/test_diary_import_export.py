#!/usr/bin/env python3
"""
测试日记导入导出功能
"""

import requests
import json
import os
from datetime import datetime

# API基础URL
BASE_URL = "http://localhost:8000"

def login():
    """登录获取token"""
    print("🔐 正在登录...")
    
    login_data = {
        "username": "qwer@qq.com",
        "password": "1qaz2wsx"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if response.status_code == 200:
            result = response.json()
            token = result.get("access_token")
            print(f"✅ 登录成功，获取token: {token[:20]}...")
            return token
        else:
            print(f"❌ 登录失败: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ 登录请求失败: {e}")
        return None

def test_export_diaries(token):
    """测试导出日记功能"""
    print("\n📤 测试导出日记功能...")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/diary/export", headers=headers)
        
        print(f"📊 响应状态码: {response.status_code}")
        print(f"📄 响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            # 检查是否是文件下载
            content_type = response.headers.get('content-type', '')
            content_disposition = response.headers.get('content-disposition', '')
            
            print(f"📋 Content-Type: {content_type}")
            print(f"📋 Content-Disposition: {content_disposition}")
            
            if 'application/json' in content_type or 'attachment' in content_disposition:
                # 保存导出的文件
                filename = 'test_exported_diaries.json'
                
                # 从响应头提取文件名
                if content_disposition:
                    import re
                    filename_match = re.search(r'filename="([^"]+)"', content_disposition)
                    if filename_match:
                        filename = filename_match.group(1)
                
                with open(filename, 'wb') as f:
                    f.write(response.content)
                
                print(f"✅ 导出成功！文件已保存为: {filename}")
                print(f"📊 文件大小: {len(response.content)} bytes")
                
                # 解析并显示内容概要
                try:
                    content = response.json()
                    export_info = content.get('export_info', {})
                    diaries = content.get('diaries', [])
                    
                    print(f"📋 导出信息:")
                    print(f"   👤 用户ID: {export_info.get('user_id')}")
                    print(f"   📝 用户名: {export_info.get('username')}")
                    print(f"   📅 导出日期: {export_info.get('export_date')}")
                    print(f"   📊 日记总数: {export_info.get('total_diaries')}")
                    print(f"   📄 格式版本: {export_info.get('format_version')}")
                    
                    if diaries:
                        print(f"📄 日记列表预览:")
                        for i, diary in enumerate(diaries[:3]):  # 只显示前3个
                            print(f"   {i+1}. {diary.get('title', '无标题')} - {diary.get('created_at', '无日期')}")
                        
                        if len(diaries) > 3:
                            print(f"   ... 还有 {len(diaries) - 3} 条日记")
                    else:
                        print("📭 暂无日记数据")
                        
                    return True
                except json.JSONDecodeError:
                    print("⚠️ 响应不是有效的JSON格式")
                    return False
            else:
                print(f"⚠️ 意外的响应类型: {content_type}")
                print(f"📄 响应内容: {response.text[:500]}...")
                return False
        else:
            print(f"❌ 导出失败: {response.status_code}")
            print(f"📄 错误信息: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 导出请求失败: {e}")
        return False

def test_import_diaries(token, filename='test_exported_diaries.json'):
    """测试导入日记功能"""
    print(f"\n📥 测试导入日记功能...")
    
    if not os.path.exists(filename):
        print(f"❌ 导入文件不存在: {filename}")
        return False
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        with open(filename, 'rb') as f:
            files = {'file': (filename, f, 'application/json')}
            response = requests.post(f"{BASE_URL}/api/diary/import", headers=headers, files=files)
        
        print(f"📊 响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 导入成功！")
            print(f"📋 导入结果:")
            print(f"   📄 消息: {result.get('message', '无消息')}")
            print(f"   ✅ 成功导入: {result.get('imported_count', 0)} 条")
            print(f"   ⏭️ 跳过重复: {result.get('skipped_count', 0)} 条")
            print(f"   ❌ 导入失败: {result.get('error_count', 0)} 条")
            print(f"   📊 总计处理: {result.get('total_processed', 0)} 条")
            
            if result.get('errors'):
                print("🚨 错误详情:")
                for error in result.get('errors', [])[:5]:  # 只显示前5个错误
                    print(f"   ❌ {error}")
                if len(result.get('errors', [])) > 5:
                    print(f"   ... 还有 {len(result.get('errors', [])) - 5} 个错误")
            
            return True
        else:
            print(f"❌ 导入失败: {response.status_code}")
            try:
                error_data = response.json()
                print(f"📄 错误信息: {error_data.get('detail', '无详细信息')}")
            except:
                print(f"📄 错误信息: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 导入请求失败: {e}")
        return False

def test_diary_routes():
    """测试日记路由是否正确配置"""
    print("\n🔍 测试日记路由配置...")
    
    # 测试路由列表
    routes_to_test = [
        "/api/diary",
        "/api/diary/export",
        "/api/diary/import",
        "/api/diary/item/123"  # 测试新的item路径
    ]
    
    for route in routes_to_test:
        try:
            response = requests.options(f"{BASE_URL}{route}")
            print(f"📋 {route}: {response.status_code}")
        except Exception as e:
            print(f"❌ {route}: 请求失败 - {e}")

def main():
    """主测试函数"""
    print("🚀 开始测试日记导入导出功能")
    print("=" * 50)
    
    # 测试路由配置
    test_diary_routes()
    
    # 登录获取token
    token = login()
    if not token:
        print("❌ 无法获取认证token，测试终止")
        return
    
    # 测试导出功能
    export_success = test_export_diaries(token)
    
    if export_success:
        # 测试导入功能
        test_import_diaries(token)
    
    print("\n" + "=" * 50)
    print("🏁 测试完成")

if __name__ == "__main__":
    main()