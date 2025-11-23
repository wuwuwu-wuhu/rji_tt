#!/usr/bin/env python3
"""
检查导出文件内容
"""

import json

def check_export_file():
    filename = 'diaries_export_qwer_20251123_014700.json'
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)

        print('📄 导出文件内容分析:')
        export_info = data.get('export_info', {})
        print(f'📋 导出信息:')
        print(f'   👤 用户ID: {export_info.get("user_id")}')
        print(f'   📝 用户名: {export_info.get("username")}')
        print(f'   📅 导出日期: {export_info.get("export_date")}')
        print(f'   📊 日记总数: {export_info.get("total_diaries")}')
        print(f'   📄 格式版本: {export_info.get("format_version")}')
        
        diaries = data.get('diaries', [])
        print(f'📊 日记数量: {len(diaries)}')

        print('📄 日记列表:')
        for i, diary in enumerate(diaries):
            print(f'   {i+1}. ID:{diary.get("id")} - 标题:{diary.get("title")} - 创建时间:{diary.get("created_at")}')
            content = diary.get('content', '')
            if len(content) > 50:
                print(f'      内容预览: {content[:50]}...')
            else:
                print(f'      内容: {content}')
            print('   ---')
            
    except Exception as e:
        print(f'❌ 读取文件失败: {e}')

if __name__ == "__main__":
    check_export_file()