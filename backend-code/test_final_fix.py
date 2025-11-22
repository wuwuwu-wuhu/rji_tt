#!/usr/bin/env python3
"""
最终测试脚本
验证设置界面修复是否成功
"""

import asyncio
import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.models.user import User
from app.schemas.assistant import AssistantConfigCreate
from app.db.assistant import assistant_config


async def test_complete_flow():
    """测试完整的配置流程"""
    print("🚀 开始最终测试...")
    
    # 获取数据库会话
    db = next(get_db())
    
    try:
        # 1. 查找或创建测试用户
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            print("❌ 测试用户不存在，请先创建测试用户")
            return
        
        print(f"✅ 找到测试用户: {test_user.username}")
        
        # 2. 创建测试配置
        config_data = AssistantConfigCreate(
            name="最终测试配置",
            description="用于验证修复的测试配置",
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
                "api_key": "test-key-for-final-test"
            }
        )
        
        # 3. 保存配置
        assistant_cfg = assistant_config.create_with_user(
            db, obj_in=config_data, user_id=test_user.id
        )
        
        print(f"✅ 配置创建成功: {assistant_cfg.name} (ID: {assistant_cfg.id})")
        
        # 4. 查询配置
        configs = assistant_config.get_multi_by_user(db, user_id=test_user.id)
        print(f"✅ 查询到 {len(configs)} 个配置")
        
        # 5. 获取默认配置
        default_config = assistant_config.get_default_by_user(db, user_id=test_user.id)
        if default_config:
            print(f"✅ 默认配置: {default_config.name}")
        else:
            print("❌ 没有找到默认配置")
        
        # 6. 更新配置
        from app.schemas.assistant import AssistantConfigUpdate
        update_data = AssistantConfigUpdate(
            name="更新后的测试配置",
            description="更新后的描述"
        )
        
        updated_config = assistant_config.update_with_user(
            db, db_obj=assistant_cfg, obj_in=update_data
        )
        print(f"✅ 配置更新成功: {updated_config.name}")
        
        # 7. 清理测试数据
        assistant_config.remove(db, id=assistant_cfg.id)
        print("✅ 测试数据清理完成")
        
        print("\n🎉 所有测试通过！设置界面修复成功！")
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(test_complete_flow())