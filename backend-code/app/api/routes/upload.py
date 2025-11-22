import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.utils.dependencies import get_current_user
from app.schemas.user import UserResponse

router = APIRouter()

# 允许的图片文件类型
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
# 最大文件大小 (5MB)
MAX_FILE_SIZE = 5 * 1024 * 1024

def validate_image_file(file: UploadFile) -> bool:
    """验证图片文件"""
    # 检查文件扩展名
    if not file.filename:
        return False
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    
    # 检查MIME类型
    allowed_mime_types = [
        "image/jpeg", "image/jpg", "image/png", 
        "image/gif", "image/webp"
    ]
    if file.content_type not in allowed_mime_types:
        return False
    
    return True

def generate_unique_filename(original_filename: str) -> str:
    """生成唯一的文件名"""
    file_ext = os.path.splitext(original_filename)[1].lower()
    unique_id = str(uuid.uuid4())
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"avatar_{timestamp}_{unique_id}{file_ext}"

@router.post("/avatar", response_model=dict)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传用户头像"""
    try:
        print(f"🔍 [头像上传] 开始处理头像上传: {file.filename}")
        print(f"   📊 文件大小: {file.size if hasattr(file, 'size') else '未知'}")
        print(f"   📄 MIME类型: {file.content_type}")
        print(f"   👤 用户ID: {current_user.id}")
        
        # 验证文件
        if not validate_image_file(file):
            print(f"   ❌ 文件验证失败: {file.filename}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不支持的文件格式。请上传 JPG、PNG、GIF 或 WebP 格式的图片"
            )
        
        # 检查文件大小
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > MAX_FILE_SIZE:
            print(f"   ❌ 文件过大: {file_size} bytes")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="文件过大。请上传小于 5MB 的图片"
            )
        
        # 重置文件指针
        await file.seek(0)
        
        # 创建上传目录
        upload_dir = "uploads/avatars"
        os.makedirs(upload_dir, exist_ok=True)
        
        # 生成唯一文件名
        unique_filename = generate_unique_filename(file.filename)
        file_path = os.path.join(upload_dir, unique_filename)
        
        print(f"   💾 保存路径: {file_path}")
        
        # 保存文件
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # 生成访问URL
        avatar_url = f"/{file_path}"
        
        # 更新用户头像URL
        current_user.avatar_url = avatar_url
        db.commit()
        db.refresh(current_user)
        
        print(f"   ✅ 头像上传成功: {avatar_url}")
        
        return {
            "url": avatar_url,
            "message": "头像上传成功",
            "filename": unique_filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"   ❌ 头像上传失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"头像上传失败: {str(e)}"
        )

@router.delete("/avatar", response_model=dict)
async def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除用户头像"""
    try:
        print(f"🔍 [头像删除] 开始删除用户头像: {current_user.id}")
        
        if not current_user.avatar_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户没有设置头像"
            )
        
        # 删除文件
        file_path = current_user.avatar_url.lstrip("/")
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"   🗑️ 已删除文件: {file_path}")
        
        # 更新数据库
        current_user.avatar_url = None
        db.commit()
        
        print(f"   ✅ 头像删除成功")
        
        return {
            "message": "头像删除成功"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"   ❌ 头像删除失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"头像删除失败: {str(e)}"
        )

@router.get("/avatar/info", response_model=dict)
async def get_avatar_info(
    current_user: User = Depends(get_current_user)
):
    """获取用户头像信息"""
    try:
        avatar_info = {
            "has_avatar": bool(current_user.avatar_url),
            "avatar_url": current_user.avatar_url,
            "upload_date": current_user.updated_at.isoformat() if current_user.updated_at else None
        }
        
        return avatar_info
        
    except Exception as e:
        print(f"   ❌ 获取头像信息失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取头像信息失败: {str(e)}"
        )