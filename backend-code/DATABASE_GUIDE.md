# SQLite 数据库查看指南

## 📍 数据库位置

LifeLog AI 使用 SQLite 数据库，数据库文件位于：
```
backend-code/lifelog_ai.db
```

## 🔍 查看数据库的方法

### 方法1: 使用命令行 (推荐)

#### 1. 安装 SQLite 命令行工具

**Windows:**
- 下载 SQLite 官方工具: https://www.sqlite.org/download.html
- 或使用包管理器: `choco install sqlite`

**macOS:**
```bash
brew install sqlite
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install sqlite3
```

#### 2. 连接到数据库
```bash
cd backend-code
sqlite3 lifelog_ai.db
```

#### 3. 基本命令
```sql
-- 查看所有表
.tables

-- 查看表结构
.schema users

-- 查看所有用户
SELECT * FROM users;

-- 查看所有日记
SELECT * FROM diaries;

-- 退出
.quit
```

### 方法2: 使用 Python 脚本

#### 1. 创建查看脚本
```bash
cd backend-code
python -c "
import sqlite3
conn = sqlite3.connect('lifelog_ai.db')
cursor = conn.cursor()

# 查看所有表
cursor.execute(\"SELECT name FROM sqlite_master WHERE type='table';\")
tables = cursor.fetchall()
print('数据库表:')
for table in tables:
    print(f'  - {table[0]}')

# 查看用户数据
cursor.execute('SELECT id, username, email, full_name, is_active FROM users;')
users = cursor.fetchall()
print('\n用户数据:')
for user in users:
    print(f'  ID: {user[0]}, 用户名: {user[1]}, 邮箱: {user[2]}, 姓名: {user[3]}, 激活: {user[4]}')

conn.close()
"
```

#### 2. 创建交互式查看脚本
创建 `view_database.py`:
```python
import sqlite3
import sys
from tabulate import tabulate

def connect_db():
    """连接到数据库"""
    try:
        conn = sqlite3.connect('lifelog_ai.db')
        return conn
    except Exception as e:
        print(f"连接数据库失败: {e}")
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
        print(tabulate(rows, headers=column_names, tablefmt='grid'))
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
    print(tabulate(columns, headers=['CID', 'Name', 'Type', 'NotNull', 'Default', 'PK'], tablefmt='grid'))

def main():
    conn = connect_db()
    if not conn:
        return
    
    try:
        while True:
            print("\n" + "="*50)
            print("🗄️  LifeLog AI 数据库查看器")
            print("="*50)
            
            tables = show_tables(conn)
            
            print("\n选项:")
            print("  1. 查看表数据")
            print("  2. 查看表结构")
            print("  3. 执行自定义SQL")
            print("  0. 退出")
            
            choice = input("\n请选择操作 (0-3): ").strip()
            
            if choice == '0':
                break
            elif choice == '1':
                table_num = input(f"请输入表编号 (1-{len(tables)}): ").strip()
                try:
                    table_idx = int(table_num) - 1
                    if 0 <= table_idx < len(tables):
                        show_table_data(conn, tables[table_idx][0])
                    else:
                        print("❌ 无效的表编号")
                except ValueError:
                    print("❌ 请输入有效的数字")
            elif choice == '2':
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
                try:
                    cursor = conn.cursor()
                    cursor.execute(sql)
                    if sql.strip().upper().startswith('SELECT'):
                        rows = cursor.fetchall()
                        if rows:
                            print(tabulate(rows, tablefmt='grid'))
                        else:
                            print("查询结果为空")
                    else:
                        conn.commit()
                        print("✅ SQL执行成功")
                except Exception as e:
                    print(f"❌ SQL执行失败: {e}")
            else:
                print("❌ 无效的选择")
    
    finally:
        conn.close()
        print("\n👋 再见!")

if __name__ == "__main__":
    main()
```

### 方法3: 使用图形化工具

#### 1. DB Browser for SQLite (推荐)
- 下载地址: https://sqlitebrowser.org/
- 免费开源，跨平台支持
- 提供直观的图形界面

#### 2. DBeaver
- 下载地址: https://dbeaver.io/
- 功能强大的数据库管理工具
- 支持多种数据库类型

#### 3. VS Code 扩展
- 安装 "SQLite" 扩展
- 可以直接在 VS Code 中查看数据库

## 📊 数据库表结构

### users 表 (用户表)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

### diaries 表 (日记表)
```sql
CREATE TABLE diaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    mood VARCHAR(50),
    tags VARCHAR(500),
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### assistant_configs 表 (AI助手配置表)
```sql
CREATE TABLE assistant_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    model VARCHAR(50) DEFAULT 'gpt-3.5-turbo',
    temperature VARCHAR(10) DEFAULT '0.7',
    max_tokens INTEGER DEFAULT 1000,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    icon VARCHAR(50) DEFAULT '🤖',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🔧 常用查询示例

### 查看所有用户
```sql
SELECT id, username, email, full_name, created_at FROM users;
```

### 查看特定用户的日记
```sql
SELECT d.id, d.title, d.mood, d.created_at 
FROM diaries d 
JOIN users u ON d.user_id = u.id 
WHERE u.username = 'demo';
```

### 查看最近的日记
```sql
SELECT title, mood, created_at 
FROM diaries 
ORDER BY created_at DESC 
LIMIT 10;
```

### 统计用户数量
```sql
SELECT COUNT(*) as user_count FROM users;
```

### 统计每个用户的日记数量
```sql
SELECT u.username, COUNT(d.id) as diary_count
FROM users u
LEFT JOIN diaries d ON u.id = d.user_id
GROUP BY u.id, u.username;
```

## 🛠️ 数据库维护

### 备份数据库
```bash
# 备份整个数据库
cp lifelog_ai.db lifelog_ai_backup_$(date +%Y%m%d_%H%M%S).db

# 或使用 SQLite 命令
sqlite3 lifelog_ai.db ".backup lifelog_ai_backup.db"
```

### 清理数据
```sql
-- 删除测试数据
DELETE FROM diaries WHERE user_id IN (
    SELECT id FROM users WHERE username LIKE 'test%'
);

-- 重置自增ID
DELETE FROM sqlite_sequence WHERE name = 'diaries';
```

### 优化数据库
```sql
VACUUM;
ANALYZE;
```

## 🚨 注意事项

1. **备份数据**: 在执行删除操作前务必备份数据库
2. **关闭连接**: 确保应用关闭后再操作数据库文件
3. **权限问题**: 确保有读写数据库文件的权限
4. **并发访问**: SQLite 不支持高并发写入，适合单用户或小团队使用

## 📞 获取帮助

如果遇到问题：
1. 检查数据库文件是否存在: `ls -la lifelog_ai.db`
2. 检查文件权限: `chmod 664 lifelog_ai.db`
3. 查看数据库大小: `du -h lifelog_ai.db`
4. 重新初始化: `python setup_database.py`

通过以上方法，你可以轻松查看和管理 LifeLog AI 的 SQLite 数据库！