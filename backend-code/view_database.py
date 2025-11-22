#!/usr/bin/env python3
"""
LifeLog AI 数据库查看器
快速查看 SQLite 数据库信息的命令行工具
"""

import sqlite3
import sys
import os
from datetime import datetime

def connect_db():
    """连接到数据库"""
    db_path = 'lifelog_ai.db'
    if not os.path.exists(db_path):
        print(f"❌ 数据库文件不存在: {db_path}")
        print("请先运行: python setup_database.py")
        return None
    
    try:
        conn = sqlite3.connect(db_path)
        return conn
    except Exception as e:
        print(f"❌ 连接数据库失败: {e}")
        return None

def show_tables(conn):
    """显示所有表"""
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("📋 数据库表:")
    for i, table in enumerate(tables, 1):
        print(f"  {i}. {table[0]}")
    return [table[0] for table in tables]

def show_table_data(conn, table_name, limit=10):
    """显示表数据"""
    cursor = conn.cursor()
    
    # 获取表结构
    cursor.execute(f"PRAGMA table_info({table_name});")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    # 获取数据
    cursor.execute(f"SELECT * FROM {table_name} LIMIT {limit};")
    rows = cursor.fetchall()
    
    print(f"\n📊 表 '{table_name}' 的数据 (最多显示 {limit} 条):")
    if rows:
        # 打印表头
        header = " | ".join(f"{name:15}" for name in column_names)
        print("-" * len(header))
        print(header)
        print("-" * len(header))
        
        # 打印数据行
        for row in rows:
            row_str = " | ".join(f"{str(cell):15}" for cell in row)
            print(row_str)
        print("-" * len(header))
    else:
        print("  (无数据)")
    
    # 显示总记录数
    cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
    count = cursor.fetchone()[0]
    print(f"\n总记录数: {count}")

def show_table_schema(conn, table_name):
    """显示表结构"""
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name});")
    columns = cursor.fetchall()
    
    print(f"\n🏗️ 表 '{table_name}' 的结构:")
    print("-" * 80)
    print(f"{'列名':20} {'类型':15} {'非空':8} {'默认值':15} {'主键':8}")
    print("-" * 80)
    
    for col in columns:
        cid, name, type_name, not_null, default_val, is_pk = col
        print(f"{name:20} {type_name:15} {'YES' if not_null else 'NO':8} {str(default_val or ''):15} {'YES' if is_pk else 'NO':8}")
    
    print("-" * 80)

def show_database_info(conn):
    """显示数据库基本信息"""
    cursor = conn.cursor()
    
    # 获取数据库文件大小
    db_path = 'lifelog_ai.db'
    size = os.path.getsize(db_path)
    size_mb = size / (1024 * 1024)
    
    print(f"🗄️  数据库信息:")
    print(f"  文件路径: {os.path.abspath(db_path)}")
    print(f"  文件大小: {size_mb:.2f} MB")
    
    # 获取表信息
    tables = show_tables(conn)
    
    # 统计总记录数
    total_records = 0
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table[0]};")
        count = cursor.fetchone()[0]
        total_records += count
    
    print(f"  总记录数: {total_records}")
    print(f"  最后更新: {datetime.fromtimestamp(os.path.getmtime(db_path))}")

def quick_stats(conn):
    """显示快速统计信息"""
    cursor = conn.cursor()
    
    print("\n📈 快速统计:")
    
    # 用户统计
    cursor.execute("SELECT COUNT(*) FROM users;")
    user_count = cursor.fetchone()[0]
    print(f"  👥 用户数量: {user_count}")
    
    # 日记统计
    cursor.execute("SELECT COUNT(*) FROM diaries;")
    diary_count = cursor.fetchone()[0]
    print(f"  📝 日记数量: {diary_count}")
    
    # AI助手配置统计
    cursor.execute("SELECT COUNT(*) FROM assistant_configs;")
    config_count = cursor.fetchone()[0]
    print(f"  🤖 AI配置数量: {config_count}")
    
    # 最近活动
    if diary_count > 0:
        cursor.execute("SELECT created_at FROM diaries ORDER BY created_at DESC LIMIT 1;")
        latest_diary = cursor.fetchone()[0]
        print(f"  🕐 最新日记: {latest_diary}")

def main():
    print("🗄️  LifeLog AI 数据库查看器")
    print("=" * 50)
    
    conn = connect_db()
    if not conn:
        return
    
    try:
        # 显示数据库基本信息
        show_database_info(conn)
        
        # 显示快速统计
        quick_stats(conn)
        
        # 交互式菜单
        while True:
            print("\n" + "="*50)
            print("选项:")
            print("  1. 查看表数据")
            print("  2. 查看表结构")
            print("  3. 执行自定义SQL")
            print("  4. 显示统计信息")
            print("  0. 退出")
            
            choice = input("\n请选择操作 (0-4): ").strip()
            
            if choice == '0':
                break
            elif choice == '1':
                tables = show_tables(conn)
                if tables:
                    table_num = input(f"请输入表编号 (1-{len(tables)}): ").strip()
                    try:
                        table_idx = int(table_num) - 1
                        if 0 <= table_idx < len(tables):
                            limit = input("显示条数 (默认10): ").strip()
                            limit = int(limit) if limit.isdigit() else 10
                            show_table_data(conn, tables[table_idx][0], limit)
                        else:
                            print("❌ 无效的表编号")
                    except ValueError:
                        print("❌ 请输入有效的数字")
            elif choice == '2':
                tables = show_tables(conn)
                if tables:
                    table_num = input(f"请输入表编号 (1-{len(tables)}): ").strip()
                    try:
                        table_idx = int(table_num) - 1
                        if 0 <= table_idx < len(tables):
                            show_table_schema(conn, tables[table_idx][0])
                        else:
                            print("❌ 无效的表编号")
                    except ValueError:
                        print("❌ 请输入有效的数字")
            elif choice == '3':
                sql = input("请输入SQL语句: ").strip()
                if sql:
                    try:
                        cursor = conn.cursor()
                        cursor.execute(sql)
                        if sql.strip().upper().startswith('SELECT'):
                            rows = cursor.fetchall()
                            if rows:
                                # 获取列名
                                col_names = [description[0] for description in cursor.description]
                                print(" | ".join(f"{name:15}" for name in col_names))
                                print("-" * (len(col_names) * 18))
                                for row in rows:
                                    print(" | ".join(f"{str(cell):15}" for cell in row))
                            else:
                                print("查询结果为空")
                        else:
                            conn.commit()
                            print("✅ SQL执行成功")
                    except Exception as e:
                        print(f"❌ SQL执行失败: {e}")
            elif choice == '4':
                quick_stats(conn)
            else:
                print("❌ 无效的选择")
    
    finally:
        conn.close()
        print("\n👋 再见!")

if __name__ == "__main__":
    main()