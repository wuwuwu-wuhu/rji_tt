#!/bin/bash
set -e

# 数据库初始化脚本
# 这个脚本会在PostgreSQL容器启动时自动执行

echo "Initializing database..."

# 等待PostgreSQL服务启动
until pg_isready -U postgres; do
  echo "Waiting for PostgreSQL to start..."
  sleep 2
done

echo "PostgreSQL is ready. Creating database and tables..."

# 数据库已经在docker-compose.yml中通过POSTGRES_DB环境变量创建
# 这里只需要创建表结构
psql -v ON_ERROR_STOP=1 --username postgres --dbname lifelog_db <<-EOSQL
    -- 创建扩展（如果需要）
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- 输出初始化完成信息
    SELECT 'Database initialization completed' as status;
EOSQL

echo "Database initialization script completed."