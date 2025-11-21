import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.db.assistant import assistant_config
from app.models.chat import ChatMessage
from app.schemas.chat import (
    ChatMessage, ChatMessageCreate, ChatMessageResponse, ChatRequest, ChatResponse
)
from app.schemas.assistant import AssistantConfigResponse
from app.services.openai_service import openai_service
from app.utils.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()


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

    # 保存用户消息
    user_message = ChatMessage(
        user_id=current_user.id,
        session_id=session_id,
        assistant_config_id=assistant_cfg.id,
        role="user",
        content=chat_request.message
    )
    db.add(user_message)

    # 构建对话历史
    chat_history = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at).limit(20).all()

    messages = []
    if assistant_cfg.prompt:
        messages.append({"role": "system", "content": assistant_cfg.prompt})

    for msg in chat_history:
        messages.append({"role": msg.role, "content": msg.content})

    try:
        # 调用OpenAI API
        response = await openai_service.chat_completion(
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

        # 保存AI回复
        ai_message = ChatMessage(
            user_id=current_user.id,
            session_id=session_id,
            assistant_config_id=assistant_cfg.id,
            role="assistant",
            content=ai_content,
            tokens_used=tokens_used,
            model=model_used
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
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.get("/chat/history/{session_id}", response_model=List[ChatMessageResponse])
async def get_chat_history(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取聊天历史"""
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id,
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at).all()
    return messages


@router.get("/chat/sessions", response_model=List[str])
async def get_chat_sessions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取所有会话ID"""
    sessions = db.query(ChatMessage.session_id).filter(
        ChatMessage.user_id == current_user.id
    ).distinct().all()
    return [session[0] for session in sessions]


@router.post("/test", response_model=dict)
async def test_ai_connection():
    """测试AI连接"""
    return await openai_service.test_connection()


@router.get("/models", response_model=List[str])
async def get_available_models():
    """获取可用模型列表"""
    return await openai_service.get_models()