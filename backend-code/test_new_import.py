#!/usr/bin/env python3
"""
测试新日记导入功能
"""

import requests

def test_new_import():
    # 登录获取token
    login_data = {'username': 'qwer@qq.com', 'password': '1qaz2wsx'}
    response = requests.post('http://localhost:8000/api/auth/login', json=login_data)
    token = response.json().get('access_token')

    # 测试导入新日记
    headers = {'Authorization': f'Bearer {token}'}

    filename = 'test_new_diaries.json'
    with open(filename, 'rb') as f:
        files = {'file': (filename, f, 'application/json')}
        response = requests.post('http://localhost:8000/api/diary/import', headers=headers, files=files)

    print(f'📊 导入状态码: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print('✅ 导入成功！')
        print(f'📋 导入结果:')
        print(f'   📄 消息: {result.get("message", "无消息")}')
        print(f'   ✅ 成功导入: {result.get("imported_count", 0)} 条')
        print(f'   ⏭️ 跳过重复: {result.get("skipped_count", 0)} 条')
        print(f'   ❌ 导入失败: {result.get("error_count", 0)} 条')
        print(f'   📊 总计处理: {result.get("total_processed", 0)} 条')
    else:
        print(f'❌ 导入失败: {response.status_code}')
        print(f'📄 错误信息: {response.text}')

if __name__ == "__main__":
    test_new_import()