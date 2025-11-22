#!/usr/bin/env python3
"""
测试设置界面修复的脚本
验证测试连接和保存配置功能
"""

import asyncio
import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.models.user import User
from app.models.assistant import AssistantConfig
from app.schemas.assistant import AssistantConfigCreate
from app.db.assistant import assistant_config
from app.services.openai_service import OpenAIService


async def test_openai_service():
    """测试OpenAI服务"""
    print("🔧 测试OpenAI服务...")
    
    # 测试默认服务
    try:
        default_service = OpenAIService()
        print(f"✅ 默认服务创建成功: {default_service.base_url}")
    except Exception as e:
        print(f"❌ 默认服务创建失败: {e}")
    
    # 测试自定义配置服务
    try:
        custom_service = OpenAIService(
            api_key="test-key",
            base_url="https://api.openai.com/v1"
        )
        print(f"✅ 自定义服务创建成功: {custom_service.base_url}")
    except Exception as e:
        print(f"❌ 自定义服务创建失败: {e}")


async def test_assistant_config():
    """测试助手配置"""
    print("\n🔧 测试助手配置...")
    
    # 获取数据库会话
    db = next(get_db())
    
    try:
        # 查找测试用户
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            print("❌ 测试用户不存在，请先创建测试用户")
            return
        
        # 创建测试配置
        config_data = AssistantConfigCreate(
            name="测试配置",
            description="测试描述",
            prompt="你是一个测试助手",
            model="gpt-3.5-turbo",
            temperature="0.7",
            max_tokens=1000,
            top_p="1",
            frequency_penalty="0",
            presence_penalty="0",
            icon="🤖",
            is_default=True,
            is_active=True,
            config={
                "vendor_url": "https://api.openai.com/v1",
                "api_key": "test-key"
            }
        )
        
        # 保存配置
        assistant_cfg = assistant_config.create_with_user(
            db, obj_in=config_data, user_id=test_user.id
        )
        
        print(f"✅ 助手配置创建成功: {assistant_cfg.name} (ID: {assistant_cfg.id})")
        
        # 查询配置
        configs = assistant_config.get_multi_by_user(db, user_id=test_user.id)
        print(f"✅ 查询到 {len(configs)} 个配置")
        
        # 清理测试数据
        assistant_config.remove(db, id=assistant_cfg.id)
        print("✅ 测试数据清理完成")
        
    except Exception as e:
        print(f"❌ 助手配置测试失败: {e}")
        db.rollback()
    finally:
        db.close()


async def main():
    """主测试函数"""
    print("🚀 开始测试设置界面修复...")
    
    await test_openai_service()
    await test_assistant_config()
    
    print("\n✅ 测试完成！")


if __name__ == "__main__":
    asyncio.run(main())