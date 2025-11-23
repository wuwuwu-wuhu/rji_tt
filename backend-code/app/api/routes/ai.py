import uuid
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.database import get_db
from app.db.assistant import assistant_config
from app.db.diary import diary
from app.db.goal import goal
from app.db.schedule import schedule
from app.db.entertainment import favorite
from app.models.chat import ChatMessage
from app.models.assistant import AssistantConfig
from app.schemas.chat import (
    ChatMessage, ChatMessageCreate, ChatMessageResponse, ChatRequest, ChatResponse
)
from app.schemas.assistant import (
    AssistantConfigCreate, AssistantConfigUpdate, AssistantConfigResponse
)
from app.services.openai_service import openai_service
from app.utils.dependencies import get_current_active_user
from app.models.user import User

# 配置日志记录到文件
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai_vendor_debug.log', encoding='utf-8'),
        logging.StreamHandler()  # 同时输出到控制台
    ]
)

logger = logging.getLogger(__name__)

router = APIRouter()


async def get_knowledge_context(db: Session, user_id: int, user_message: str) -> str:
    """获取用户的知识库上下文信息"""
    try:
        context_parts = []
        
        # 1. 获取最近的日记条目（减少数量和长度）
        recent_diaries = diary.get_multi_by_user(db, user_id=user_id, skip=0, limit=3)
        if recent_diaries:
            diary_context = "最近的日记记录：\n"
            for entry in recent_diaries:
                diary_context += f"- {entry.created_at.strftime('%Y-%m-%d')}: {entry.title}\n"
                diary_context += f"  内容: {entry.content[:100]}...\n"  # 减少内容长度
            context_parts.append(diary_context)
        
        # 2. 获取活跃的目标（限制数量）
        active_goals = goal.get_active_by_user(db, user_id=user_id)
        if active_goals:
            goals_context = "当前活跃目标：\n"
            for goal_item in active_goals[:3]:  # 只取前3个目标
                progress = (goal_item.current_value / goal_item.target_value * 100) if goal_item.target_value else 0
                goals_context += f"- {goal_item.title} (进度: {progress:.1f}%)\n"
                if goal_item.description:
                    goals_context += f"  描述: {goal_item.description[:50]}...\n"  # 减少描述长度
            context_parts.append(goals_context)
        
        # 3. 获取今日和即将到来的日程（减少数量）
        today_schedules = schedule.get_today_by_user(db, user_id=user_id)
        upcoming_schedules = schedule.get_upcoming_by_user(db, user_id=user_id, days=3)  # 减少到3天
        
        if today_schedules or upcoming_schedules:
            schedule_context = "日程安排：\n"
            
            if today_schedules:
                schedule_context += "今日日程：\n"
                for sched in today_schedules[:3]:  # 只取前3个
                    schedule_context += f"- {sched.start_time.strftime('%H:%M')}: {sched.title}\n"
                    if sched.description:
                        schedule_context += f"  详情: {sched.description[:50]}...\n"  # 减少详情长度
            
            if upcoming_schedules:
                schedule_context += "未来3天日程：\n"
                for sched in upcoming_schedules[:3]:  # 只取前3个
                    schedule_context += f"- {sched.start_time.strftime('%m-%d %H:%M')}: {sched.title}\n"
            
            context_parts.append(schedule_context)
        
        # 4. 获取娱乐收藏（减少数量）
        user_favorites = favorite.get_multi_by_user(db, user_id=user_id, skip=0, limit=5)
        if user_favorites:
            entertainment_context = "娱乐收藏：\n"
            for fav in user_favorites:
                if fav.entertainment:
                    entertainment_context += f"- {fav.entertainment.title} ({fav.entertainment.type})\n"
                    if fav.rating:
                        entertainment_context += f"  评分: {fav.rating}/5\n"
                    if fav.notes:
                        entertainment_context += f"  笔记: {fav.notes[:50]}...\n"  # 减少笔记长度
            context_parts.append(entertainment_context)
        
        # 5. 获取用户基本信息（简化）
        user_info = db.query(User).filter(User.id == user_id).first()
        if user_info:
            user_context = "用户基本信息：\n"
            user_context += f"- 用户名: {user_info.username}\n"
            if user_info.full_name:
                user_context += f"- 姓名: {user_info.full_name}\n"
            # 移除个人简介以减少数据量
            context_parts.append(user_context)
        
        # 合并所有上下文，并限制总长度
        if context_parts:
            full_context = "\n".join(context_parts)
            # 限制总上下文长度在1000字符以内
            if len(full_context) > 1000:
                full_context = full_context[:1000] + "...\n[上下文已截断]"
            return full_context
        else:
            return ""
            
    except Exception as e:
        logger.error(f"获取知识库上下文失败: {str(e)}")
        return ""


@router.get("/debug")
async def debug_route():
    """调试路由 - 确认AI路由正常工作"""
    print("🔍 [DEBUG] AI路由被访问!")
    return {"message": "AI路由工作正常", "status": "ok"}


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """与AI聊天"""
    # 获取助手配置
    assistant_cfg = None
    if chat_request.assistant_config_id:
        assistant_cfg = assistant_config.get(db, chat_request.assistant_config_id)
        if not assistant_cfg or assistant_cfg.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Assistant config not found")
    else:
        # 使用默认配置
        assistant_cfg = assistant_config.get_default_by_user(db, user_id=current_user.id)
        if not assistant_cfg:
            raise HTTPException(status_code=404, detail="No default assistant config found")

    # 生成或使用现有会话ID
    session_id = chat_request.session_id or str(uuid.uuid4())

    # 保存用户消息 - 使用数据库模型而不是Pydantic Schema
    from datetime import datetime
    from app.models.chat import ChatMessage as ChatMessageModel
    
    user_message = ChatMessageModel(
        user_id=current_user.id,
        session_id=session_id,
        assistant_config_id=assistant_cfg.id,
        role="user",
        content=chat_request.message,
        tokens_used=0,  # 用户消息不消耗tokens
        model=None,  # 用户消息不需要模型
        created_at=datetime.utcnow()  # 显式设置创建时间
    )
    db.add(user_message)
    db.flush()  # 确保用户消息获得ID

    # 构建对话历史
    chat_history = db.query(ChatMessageModel).filter(
        ChatMessageModel.session_id == session_id
    ).order_by(ChatMessageModel.created_at).limit(20).all()

    messages = []
    
    # 构建系统提示，包含知识库信息
    system_prompt = assistant_cfg.prompt or "你是一个有用的AI助手，请根据用户的问题提供准确、有帮助的回答。"
    
    # 检查是否启用知识库并获取相关知识
    if chat_request.use_knowledge_base is not False:  # 默认启用知识库
        knowledge_context = await get_knowledge_context(db, current_user.id, chat_request.message)
        if knowledge_context:
            system_prompt += f"\n\n以下是用户的个人数据，请根据这些信息提供更个性化的回答：\n\n{knowledge_context}"
    
    messages.append({"role": "system", "content": system_prompt})

    for msg in chat_history:
        messages.append({"role": msg.role, "content": msg.content})

    try:
        # 获取用户配置的API信息
        api_config = assistant_cfg.config or {}
        vendor_url = api_config.get("vendor_url")
        api_key = api_config.get("api_key")
        
        # 🔍 详细的服务商配置调试信息
        print(f"\n🔍 [AI聊天] 服务商配置详情:")
        print(f"   📋 助手配置ID: {assistant_cfg.id}")
        print(f"   🤖 配置的模型: {assistant_cfg.model}")
        print(f"   🔗 供应商URL: {vendor_url}")
        print(f"   🔑 API密钥状态: {'已设置' if api_key else '未设置'}")
        print(f"   📝 完整API配置: {api_config}")
        print(f"   👤 用户ID: {current_user.id}")
        print(f"   💬 会话ID: {session_id}")
        
        logger.info(f"调试信息 - 助手配置ID: {assistant_cfg.id}")
        logger.info(f"调试信息 - 配置的模型: {assistant_cfg.model}")
        logger.info(f"调试信息 - API配置: {api_config}")
        logger.info(f"调试信息 - 供应商URL: {vendor_url}")
        logger.info(f"调试信息 - API密钥: {'已设置' if api_key else '未设置'}")
        
        # 创建使用用户配置的服务实例
        if vendor_url and api_key:
            print(f"   ✅ 使用自定义供应商: {vendor_url}")
            logger.info(f"调试信息 - 使用自定义供应商: {vendor_url}")
            ai_service = openai_service.__class__(api_key=api_key, base_url=vendor_url)
        else:
            # 如果没有配置自定义API，使用默认服务
            print(f"   ⚠️  使用默认OpenAI服务")
            logger.info(f"调试信息 - 使用默认OpenAI服务")
            ai_service = openai_service
        
        # 调用AI API
        response = await ai_service.chat_completion(
            messages=messages,
            model=assistant_cfg.model,
            temperature=float(assistant_cfg.temperature),
            max_tokens=assistant_cfg.max_tokens,
            top_p=float(assistant_cfg.top_p),
            frequency_penalty=float(assistant_cfg.frequency_penalty),
            presence_penalty=float(assistant_cfg.presence_penalty)
        )

        ai_content = response["choices"][0]["message"]["content"]
        tokens_used = response["usage"]["total_tokens"]
        model_used = response["model"]

        # 保存AI回复 - 使用数据库模型而不是Pydantic Schema
        ai_message = ChatMessageModel(
            user_id=current_user.id,
            session_id=session_id,
            assistant_config_id=assistant_cfg.id,
            role="assistant",
            content=ai_content,
            tokens_used=tokens_used,
            model=model_used,
            created_at=datetime.utcnow()  # 显式设置创建时间
        )
        db.add(ai_message)
        db.commit()

        return ChatResponse(
            message=ai_content,
            session_id=session_id,
            tokens_used=tokens_used,
            model=model_used
        )

    except Exception as e:
        db.rollback()
        # 🔍 详细的错误信息输出
        print(f"\n❌ [AI聊天] 异常详情:")
        print(f"   🔍 错误类型: {type(e).__name__}")
        print(f"   📝 错误消息: {str(e)}")
        print(f"   📊 错误详情: {repr(e)}")
        print(f"   👤 用户ID: {current_user.id}")
        print(f"   💬 会话ID: {session_id}")
        print(f"   🤖 助手配置ID: {assistant_cfg.id}")
        
        logger.error(f"AI聊天异常 - 类型: {type(e).__name__}, 消息: {str(e)}")
        logger.error(f"用户ID: {current_user.id}, 会话ID: {session_id}, 配置ID: {assistant_cfg.id}")
        
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.get("/chat/history/{session_id}", response_model=List[ChatMessageResponse])
async def get_chat_history(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取聊天历史"""
    from app.models.chat import ChatMessage as ChatMessageModel
    
    messages = db.query(ChatMessageModel).filter(
        ChatMessageModel.session_id == session_id,
        ChatMessageModel.user_id == current_user.id
    ).order_by(ChatMessageModel.created_at).all()
    return messages


@router.get("/chat/sessions", response_model=List[str])
async def get_chat_sessions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取所有会话ID"""
    from app.models.chat import ChatMessage as ChatMessageModel
    
    sessions = db.query(ChatMessageModel.session_id).filter(
        ChatMessageModel.user_id == current_user.id
    ).distinct().all()
    return [session[0] for session in sessions]


@router.post("/test", response_model=dict)
async def test_ai_connection(
    test_config: dict = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """测试AI连接"""
    if test_config:
        # 使用用户提供的配置进行测试
        vendor_url = test_config.get("vendor_url")
        api_key = test_config.get("api_key")
        model = test_config.get("model", "gpt-3.5-turbo")
        
        # 🔍 测试连接的详细服务商信息
        print(f"\n🔍 [测试连接] 用户提供的配置:")
        print(f"   🔗 供应商URL: {vendor_url}")
        print(f"   🤖 模型名称: {model}")
        print(f"   🔑 API密钥状态: {'已设置' if api_key else '未设置'}")
        print(f"   👤 测试用户ID: {current_user.id}")
        
        logger.info(f"测试连接 - 用户提供的配置URL: {vendor_url}")
        logger.info(f"测试连接 - 用户提供的模型: {model}")
        logger.info(f"测试连接 - API密钥状态: {'已设置' if api_key else '未设置'}")
        
        if not vendor_url or not api_key:
            print(f"   ❌ 测试失败: 缺少供应商地址或API Key")
            return {
                "status": "error",
                "message": "请提供供应商地址和API Key"
            }
        
        # 创建临时服务实例进行测试
        print(f"   🚀 创建临时服务实例进行测试...")
        temp_service = openai_service.__class__(api_key=api_key, base_url=vendor_url)
        
        try:
            print(f"   📤 发送测试请求到: {vendor_url}")
            test_messages = [
                {"role": "user", "content": "Hello, this is a test message."}
            ]
            response = await temp_service.chat_completion(
                messages=test_messages,
                model=model,
                max_tokens=10
            )
            print(f"   ✅ 测试成功! 响应模型: {response.get('model')}")
            print(f"   📊 Token使用: {response.get('usage')}")
            return {
                "status": "success",
                "message": "API连接成功",
                "model": response.get("model"),
                "usage": response.get("usage")
            }
        except Exception as e:
            print(f"   ❌ 测试失败: {str(e)}")
            print(f"   🔍 错误类型: {type(e).__name__}")
            print(f"   📊 错误详情: {repr(e)}")
            logger.error(f"测试连接失败 - 类型: {type(e).__name__}, 消息: {str(e)}")
            return {
                "status": "error",
                "message": f"API连接失败: {str(e)}"
            }
    else:
        # 使用用户的默认配置进行测试
        try:
            # 获取用户的默认助手配置
            default_config = assistant_config.get_default_by_user(db, user_id=current_user.id)
            if default_config:
                # 🔍 默认配置测试的详细服务商信息
                print(f"\n🔍 [测试连接] 使用默认配置:")
                print(f"   📋 默认配置ID: {default_config.id}")
                print(f"   🤖 默认配置模型: {default_config.model}")
                print(f"   👤 用户ID: {current_user.id}")
                
                logger.info(f"测试连接 - 默认配置ID: {default_config.id}")
                logger.info(f"测试连接 - 默认配置模型: {default_config.model}")
                
                # 获取用户配置的API信息
                api_config = default_config.config or {}
                vendor_url = api_config.get("vendor_url")
                api_key = api_config.get("api_key")
                
                print(f"   🔗 供应商URL: {vendor_url}")
                print(f"   🔑 API密钥状态: {'已设置' if api_key else '未设置'}")
                print(f"   📝 完整API配置: {api_config}")
                
                logger.info(f"测试连接 - API配置: {api_config}")
                logger.info(f"测试连接 - 供应商URL: {vendor_url}")
                logger.info(f"测试连接 - API密钥: {'已设置' if api_key else '未设置'}")
                
                if vendor_url and api_key:
                    # 使用用户配置的服务实例
                    print(f"   ✅ 使用自定义供应商进行测试: {vendor_url}")
                    logger.info(f"测试连接 - 使用自定义供应商: {vendor_url}")
                    ai_service = openai_service.__class__(api_key=api_key, base_url=vendor_url)
                    
                    print(f"   📤 发送测试请求...")
                    test_messages = [
                        {"role": "user", "content": "Hello, this is a test message."}
                    ]
                    response = await ai_service.chat_completion(
                        messages=test_messages,
                        model=default_config.model,
                        max_tokens=10
                    )
                    print(f"   ✅ 默认配置测试成功! 响应模型: {response.get('model')}")
                    print(f"   📊 Token使用: {response.get('usage')}")
                    return {
                        "status": "success",
                        "message": "API连接成功",
                        "model": response.get("model"),
                        "usage": response.get("usage")
                    }
                else:
                    return {
                        "status": "error",
                        "message": "默认配置中缺少供应商地址或API密钥，请在设置中完善配置"
                    }
            else:
                return {
                    "status": "error",
                    "message": "未找到默认配置，请在设置中创建并设为默认配置"
                }
        except Exception as e:
            print(f"\n❌ [测试连接] 默认配置异常:")
            print(f"   🔍 错误类型: {type(e).__name__}")
            print(f"   📝 错误消息: {str(e)}")
            print(f"   📊 错误详情: {repr(e)}")
            print(f"   👤 用户ID: {current_user.id}")
            
            logger.error(f"默认配置测试异常 - 类型: {type(e).__name__}, 消息: {str(e)}")
            logger.error(f"用户ID: {current_user.id}")
            
            return {
                "status": "error",
                "message": f"测试连接失败: {str(e)}"
            }


@router.get("/models", response_model=List[str])
async def get_available_models():
    """获取可用模型列表"""
    return await openai_service.get_models()


# 助手配置相关端点
@router.post("/configs", response_model=AssistantConfigResponse)
async def create_assistant_config(
    config: AssistantConfigCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建助手配置"""
    try:
        # 将API配置信息存储在config字段中
        config_data = config.dict()
        
        # 如果没有设置prompt，使用默认prompt
        if not config_data.get("prompt"):
            config_data["prompt"] = "你是一个有用的AI助手，请根据用户的问题提供准确、有帮助的回答。"
        
        assistant_cfg = assistant_config.create_with_user(db, obj_in=config, user_id=current_user.id)
        return assistant_cfg
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"创建配置失败: {str(e)}")


@router.get("/configs", response_model=List[AssistantConfigResponse])
async def get_assistant_configs(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取用户的助手配置列表"""
    configs = assistant_config.get_multi_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    return configs


@router.get("/configs/{config_id}", response_model=AssistantConfigResponse)
async def get_assistant_config(
    config_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取特定的助手配置"""
    config = assistant_config.get(db, id=config_id)
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assistant config not found")
    return config


@router.put("/configs/{config_id}", response_model=AssistantConfigResponse)
async def update_assistant_config(
    config_id: int,
    config_update: AssistantConfigUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新助手配置"""
    config = assistant_config.get(db, id=config_id)
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assistant config not found")
    
    updated_config = assistant_config.update_with_user(db, db_obj=config, obj_in=config_update)
    return updated_config


@router.delete("/configs/{config_id}")
async def delete_assistant_config(
    config_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除助手配置"""
    config = assistant_config.get(db, id=config_id)
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assistant config not found")
    
    assistant_config.remove(db, id=config_id)
    return {"message": "Assistant config deleted successfully"}


@router.post("/configs/{config_id}/set-default")
async def set_default_config(
    config_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """设置默认助手配置"""
    config = assistant_config.get(db, id=config_id)
    if not config or config.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assistant config not found")
    
    # 先取消所有默认配置
    db.query(AssistantConfig).filter(
        AssistantConfig.user_id == current_user.id
    ).update({"is_default": False})
    
    # 设置新的默认配置
    config.is_default = True
    db.commit()
    
    return {"message": "Default config set successfully"}


@router.post("/generate-study-plan", response_model=dict)
async def generate_study_plan(
    request: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """AI生成学习计划"""
    try:
        # 获取用户的默认助手配置
        assistant_cfg = assistant_config.get_default_by_user(db, user_id=current_user.id)
        if not assistant_cfg:
            raise HTTPException(status_code=404, detail="No default assistant config found")
        
        # 获取用户配置的API信息
        api_config = assistant_cfg.config or {}
        vendor_url = api_config.get("vendor_url")
        api_key = api_config.get("api_key")
        
        # 🔍 学习计划生成的详细调试信息
        print(f"\n🔍 [学习计划生成] 开始生成学习计划:")
        print(f"   👤 用户ID: {current_user.id}")
        print(f"   📋 助手配置ID: {assistant_cfg.id}")
        print(f"   🤖 配置的模型: {assistant_cfg.model}")
        print(f"   🔗 供应商URL: {vendor_url}")
        print(f"   🔑 API密钥状态: {'已设置' if api_key else '未设置'}")
        
        logger.info(f"学习计划生成 - 用户ID: {current_user.id}")
        logger.info(f"学习计划生成 - 助手配置ID: {assistant_cfg.id}")
        logger.info(f"学习计划生成 - 模型: {assistant_cfg.model}")
        
        # 创建使用用户配置的服务实例
        if vendor_url and api_key:
            print(f"   ✅ 使用自定义供应商: {vendor_url}")
            logger.info(f"学习计划生成 - 使用自定义供应商: {vendor_url}")
            ai_service = openai_service.__class__(api_key=api_key, base_url=vendor_url)
        else:
            print(f"   ⚠️  使用默认OpenAI服务")
            logger.info(f"学习计划生成 - 使用默认OpenAI服务")
            ai_service = openai_service
        
        # 获取用户需求
        user_requirement = request.get("prompt", "请为我生成一个通用的学习计划，适合初学者入门")
        
        # 获取用户知识库上下文，提供个性化信息
        knowledge_context = await get_knowledge_context(db, current_user.id, user_requirement)
        
        # 构建优化的学习计划生成系统提示（更简洁）
        system_prompt = """学习计划生成助手。根据用户需求生成JSON格式学习计划。

格式要求：
{
  "title": "简短标题",
  "priority": "High/Medium/Low",
  "tasks": [
    {"title": "任务1", "duration": "30m"},
    {"title": "任务2", "duration": "1h"}
  ]
}

要求：3-5个任务，总时长2-6小时，循序渐进。只返回JSON，无其他文字。"""

        # 构建消息，包含知识库上下文
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # 如果有知识库上下文，添加到用户消息中
        if knowledge_context:
            user_content = f"用户需求：{user_requirement}\n\n用户背景信息：\n{knowledge_context}"
        else:
            user_content = f"用户需求：{user_requirement}"
        
        messages.append({"role": "user", "content": user_content})
        
        print(f"   📤 发送学习计划生成请求...")
        print(f"   📝 用户需求: {user_requirement}")
        print(f"   📚 知识库上下文: {'有' if knowledge_context else '无'}")
        
        # 调用AI API，优化参数设置
        response = await ai_service.chat_completion(
            messages=messages,
            model=assistant_cfg.model,
            temperature=0.3,  # 稍微提高温度，加快生成速度
            max_tokens=500,   # 减少max_tokens，因为学习计划不需要太长
            top_p=0.9,
            frequency_penalty=0.0,
            presence_penalty=0.0,
            timeout=120  # 减少超时时间到2分钟，因为优化后应该更快
        )
        
        ai_content = response["choices"][0]["message"]["content"].strip()
        tokens_used = response["usage"]["total_tokens"]
        model_used = response["model"]
        
        print(f"   ✅ AI生成成功!")
        print(f"   📝 生成内容: {ai_content[:200]}...")
        print(f"   📊 Token使用: {tokens_used}")
        print(f"   🤖 使用模型: {model_used}")
        
        logger.info(f"学习计划生成成功 - Token使用: {tokens_used}")
        logger.info(f"学习计划生成成功 - 模型: {model_used}")
        
        # 尝试解析JSON，如果失败则返回原始内容
        try:
            # 清理可能的markdown格式
            if ai_content.startswith("```json"):
                ai_content = ai_content.replace("```json", "").replace("```", "").strip()
            
            parsed_plan = eval(ai_content)  # 使用eval而不是json.parse，因为AI可能返回单引号
            
            # 验证必要字段
            if not isinstance(parsed_plan, dict):
                raise ValueError("返回的不是字典格式")
            
            if "title" not in parsed_plan or "priority" not in parsed_plan or "tasks" not in parsed_plan:
                raise ValueError("缺少必要字段")
            
            if not isinstance(parsed_plan["tasks"], list):
                raise ValueError("tasks字段不是列表")
            
            # 验证每个任务
            for task in parsed_plan["tasks"]:
                if not isinstance(task, dict) or "title" not in task or "duration" not in task:
                    raise ValueError("任务格式不正确")
            
            print(f"   ✅ JSON解析成功，格式正确")
            
            return {
                "status": "success",
                "data": parsed_plan,
                "tokens_used": tokens_used,
                "model": model_used
            }
            
        except Exception as parse_error:
            print(f"   ⚠️  JSON解析失败: {str(parse_error)}")
            print(f"   📝 原始内容: {ai_content}")
            logger.error(f"学习计划生成 - JSON解析失败: {str(parse_error)}")
            
            # 如果解析失败，返回原始内容让前端处理
            return {
                "status": "parse_error",
                "raw_content": ai_content,
                "tokens_used": tokens_used,
                "model": model_used,
                "error": f"JSON解析失败: {str(parse_error)}"
            }
        
    except Exception as e:
        # 🔍 详细的错误信息输出
        print(f"\n❌ [学习计划生成] 异常详情:")
        print(f"   🔍 错误类型: {type(e).__name__}")
        print(f"   📝 错误消息: {str(e)}")
        print(f"   📊 错误详情: {repr(e)}")
        print(f"   👤 用户ID: {current_user.id}")
        
        logger.error(f"学习计划生成异常 - 类型: {type(e).__name__}, 消息: {str(e)}")
        logger.error(f"用户ID: {current_user.id}")
        
        raise HTTPException(status_code=500, detail=f"学习计划生成失败: {str(e)}")