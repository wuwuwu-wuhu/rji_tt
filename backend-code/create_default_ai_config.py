#!/usr/bin/env python3
"""
为现有用户创建默认AI配置的脚本
解决"No default assistant config found"错误
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.db.assistant import assistant_config
from app.models.user import User
from app.schemas.assistant import AssistantConfigCreate
import json

def create_default_config_for_user(db, user_id: int):
    """为指定用户创建默认AI配置"""
    
    # 检查用户是否已有默认配置
    existing_default = assistant_config.get_default_by_user(db, user_id=user_id)
    if existing_default:
        print(f"   ✅ 用户{user_id}已有默认配置: {existing_default.name}")
        return existing_default
    
    # 创建默认配置
    default_config_data = AssistantConfigCreate(
        name="默认AI助手",
        model="gpt-3.5-turbo",
        prompt="""你是LifeLog AI智能助手，专门帮助用户记录、管理和优化个人生活。

## 核心职责
1. **生活记录助手**：帮助用户记录日记、管理日程、制定目标和学习计划
2. **智能分析顾问**：基于用户数据提供个性化建议和洞察
3. **情感支持伙伴**：理解用户情绪状态，提供温暖的支持和鼓励
4. **效率提升专家**：帮助用户优化时间管理和生活习惯

## 交互风格
- 温暖友好，像贴心的朋友一样交流
- 专业可靠，提供有价值的建议
- 积极正面，鼓励用户持续进步
- 尊重隐私，谨慎处理个人信息

## 知识库使用
当用户开启知识库功能时，你可以：
- 参考用户的日记记录了解情绪变化
- 结合日程安排提供时间管理建议
- 基于目标设定给出个性化指导
- 考虑学习计划提供相关资源推荐

## 回答原则
- 简洁明了，重点突出
- 具体实用，避免空泛
- 因人而异，个性化定制
- 积极引导，正向激励

记住：你不仅是工具，更是用户生活中的得力助手和温暖伙伴。""",
        temperature=str(0.7),
        max_tokens=1000,
        top_p=str(1.0),
        frequency_penalty=str(0.0),
        presence_penalty=str(0.0),
        is_default=True,
        config={
            "vendor_url": "https://api.openai.com/v1",
            "api_key": "",  # 用户需要自己设置API密钥
            "model": "gpt-3.5-turbo"
        }
    )
    
    try:
        # 创建配置
        new_config = assistant_config.create_with_user(
            db=db, 
            obj_in=default_config_data, 
            user_id=user_id
        )
        print(f"   ✅ 为用户{user_id}创建默认配置成功: {new_config.name}")
        return new_config
    except Exception as e:
        print(f"   ❌ 为用户{user_id}创建默认配置失败: {str(e)}")
        return None

def main():
    """主函数"""
    print("🔧 开始为现有用户创建默认AI配置...")
    
    db = next(get_db())
    
    try:
        # 获取所有用户
        users = db.query(User).all()
        print(f"   📊 找到 {len(users)} 个用户")
        
        if not users:
            print("   ⚠️  没有找到任何用户")
            return
        
        success_count = 0
        for user in users:
            print(f"\n   👤 处理用户: {user.username} (ID: {user.id})")
            
            # 检查该用户现有的AI配置
            existing_configs = db.query(assistant_config.model).filter(
                assistant_config.model.user_id == user.id
            ).all()
            
            print(f"   📋 现有配置数量: {len(existing_configs)}")
            
            # 如果有配置但没有默认的，将第一个设为默认
            if existing_configs and not any(config.is_default for config in existing_configs):
                print("   🔧 将第一个现有配置设为默认...")
                first_config = existing_configs[0]
                first_config.is_default = True
                db.commit()
                print(f"   ✅ 已将配置 '{first_config.name}' 设为默认")
                success_count += 1
            # 如果没有任何配置，创建默认配置
            elif not existing_configs:
                print("   🔧 创建新的默认配置...")
                new_config = create_default_config_for_user(db, user.id)
                if new_config:
                    success_count += 1
            else:
                print("   ✅ 用户已有默认配置")
                success_count += 1
        
        print(f"\n🎉 处理完成!")
        print(f"   ✅ 成功处理: {success_count}/{len(users)} 个用户")
        
        # 验证结果
        print("\n🔍 验证结果:")
        for user in users:
            default_config = assistant_config.get_default_by_user(db, user_id=user.id)
            if default_config:
                print(f"   ✅ 用户{user.username}: 默认配置ID {default_config.id}")
            else:
                print(f"   ❌ 用户{user.username}: 仍无默认配置")
    
    except Exception as e:
        print(f"❌ 脚本执行失败: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()