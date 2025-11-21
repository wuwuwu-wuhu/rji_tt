#!/usr/bin/env python3
"""
移动端本地API服务
为完整APK提供本地后端服务
"""
import os
import sys
import sqlite3
import json
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import threading
import time

# 添加后端代码路径
sys.path.append(str(Path(__file__).parent.parent.parent.parent / 'backend-code'))

from app.core.config import Settings
from app.models import *

app = Flask(__name__)
CORS(app)

# 移动端配置
class MobileSettings(Settings):
    def __init__(self):
        super().__init__()
        # 使用SQLite数据库
        self.DATABASE_URL = "sqlite:///lifelog.db"
        # 本地服务端口
        self.HOST = "127.0.0.1"
        self.PORT = 8080

settings = MobileSettings()

# 初始化SQLite数据库
def init_sqlite_db():
    """初始化SQLite数据库"""
    conn = sqlite3.connect('lifelog.db')
    cursor = conn.cursor()
    
    # 创建用户表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            full_name TEXT,
            is_active BOOLEAN DEFAULT 1,
            is_superuser BOOLEAN DEFAULT 0,
            avatar_url TEXT,
            bio TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP
        )
    ''')
    
    # 创建日记表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS diaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            mood TEXT DEFAULT 'neutral',
            tags TEXT,
            is_private BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # 创建AI助手配置表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS assistant_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            prompt TEXT NOT NULL,
            model TEXT DEFAULT 'gpt-3.5-turbo',
            temperature TEXT DEFAULT '0.7',
            max_tokens INTEGER DEFAULT 2000,
            is_default BOOLEAN DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # 创建默认用户
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, email, hashed_password, full_name)
        VALUES ('mobile_user', 'mobile@lifelog.ai', 'hashed_password', 'Mobile User')
    ''')
    
    conn.commit()
    conn.close()
    print("SQLite数据库初始化完成")

# API路由
@app.route('/api/health')
def health_check():
    """健康检查"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/users/me')
def get_current_user():
    """获取当前用户信息"""
    conn = sqlite3.connect('lifelog.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', ('mobile_user',))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify({
            "id": user[0],
            "username": user[1],
            "email": user[2],
            "full_name": user[4],
            "is_active": bool(user[5])
        })
    return jsonify({"error": "User not found"}), 404

@app.route('/api/diary')
def get_diaries():
    """获取日记列表"""
    conn = sqlite3.connect('lifelog.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT d.id, d.title, d.content, d.mood, d.created_at 
        FROM diaries d 
        JOIN users u ON d.user_id = u.id 
        WHERE u.username = 'mobile_user'
        ORDER BY d.created_at DESC
    ''')
    diaries = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        "id": d[0],
        "title": d[1],
        "content": d[2],
        "mood": d[3],
        "created_at": d[4]
    } for d in diaries])

@app.route('/api/diary', methods=['POST'])
def create_diary():
    """创建日记"""
    data = request.json
    conn = sqlite3.connect('lifelog.db')
    cursor = conn.cursor()
    
    # 获取用户ID
    cursor.execute('SELECT id FROM users WHERE username = ?', ('mobile_user',))
    user = cursor.fetchone()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # 插入日记
    cursor.execute('''
        INSERT INTO diaries (user_id, title, content, mood)
        VALUES (?, ?, ?, ?)
    ''', (user[0], data['title'], data['content'], data.get('mood', 'neutral')))
    
    conn.commit()
    diary_id = cursor.lastrowid
    conn.close()
    
    return jsonify({"id": diary_id, "message": "Diary created successfully"})

def start_server():
    """启动本地服务器"""
    init_sqlite_db()
    print("启动本地API服务...")
    app.run(host=settings.HOST, port=settings.PORT, debug=False)

if __name__ == "__main__":
    start_server()