from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import json
import os
from datetime import datetime, timezone
from dateutil import parser

from app.core.database import get_db
from app.db.diary import diary as diary_crud
from app.models.diary import Diary
from app.schemas.diary import Diary, DiaryCreate, DiaryUpdate, DiaryResponse
from app.utils.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=DiaryResponse)
async def create_diary(
    diary: DiaryCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建日记"""
    return diary_crud.create_with_user(db=db, obj_in=diary, user_id=current_user.id)


@router.get("/", response_model=List[DiaryResponse])
async def read_diaries(
    skip: int = 0,
    limit: int = 20,
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取日记列表"""
    if keyword:
        return diary_crud.search_by_keyword(
            db, user_id=current_user.id, keyword=keyword, skip=skip, limit=limit
        )
    return diary_crud.get_multi_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/export")
async def export_diaries(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """导出用户所有日记为JSON文件"""
    try:
        # 获取用户所有日记
        diaries = diary_crud.get_multi_by_user(db, user_id=current_user.id, skip=0, limit=10000)
        
        # 转换为可序列化的格式
        export_data = {
            "export_info": {
                "user_id": current_user.id,
                "username": current_user.username,
                "export_date": datetime.now(timezone.utc).isoformat(),
                "export_timezone": "UTC",
                "total_diaries": len(diaries),
                "format_version": "1.0"
            },
            "diaries": []
        }
        
        for diary in diaries:
            diary_data = {
                "id": diary.id,
                "title": diary.title,
                "content": diary.content,
                "mood": diary.mood,
                "tags": diary.tags if diary.tags else [],
                "is_private": diary.is_private,
                "created_at": diary.created_at.isoformat() if diary.created_at else None,
                "updated_at": diary.updated_at.isoformat() if diary.updated_at else None,
                "timezone": "UTC"
            }
            export_data["diaries"].append(diary_data)
        
        # 创建导出目录
        export_dir = "exports"
        if not os.path.exists(export_dir):
            os.makedirs(export_dir)
        
        # 生成文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"diaries_export_{current_user.username}_{timestamp}.json"
        filepath = os.path.join(export_dir, filename)
        
        # 写入文件
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
        
        print(f"📄 [日记导出] 用户 {current_user.username} 导出了 {len(diaries)} 篇日记")
        print(f"   📁 导出文件: {filepath}")
        
        return FileResponse(
            filepath,
            media_type="application/json",
            filename=filename
        )
        
    except Exception as e:
        print(f"❌ [日记导出] 导出失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"导出失败: {str(e)}")


@router.post("/import")
async def import_diaries(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """从JSON文件导入日记"""
    try:
        # 验证文件类型
        if not file.filename.endswith('.json'):
            raise HTTPException(status_code=400, detail="只支持JSON格式文件")
        
        # 读取文件内容
        content = await file.read()
        
        try:
            import_data = json.loads(content.decode('utf-8'))
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="无效的JSON文件格式")
        
        # 验证数据结构
        if "diaries" not in import_data:
            raise HTTPException(status_code=400, detail="文件格式错误：缺少diaries字段")
        
        diaries_to_import = import_data["diaries"]
        if not isinstance(diaries_to_import, list):
            raise HTTPException(status_code=400, detail="diaries字段必须是数组")
        
        # 统计信息
        imported_count = 0
        skipped_count = 0
        error_count = 0
        
        print(f"📄 [日记导入] 用户 {current_user.username} 开始导入日记")
        print(f"   📊 导入文件: {file.filename}")
        print(f"   📝 日记数量: {len(diaries_to_import)}")
        
        # 逐个导入日记
        for diary_data in diaries_to_import:
            try:
                # 验证必需字段
                if not diary_data.get("title") or not diary_data.get("content"):
                    print(f"   ⚠️ 跳过日记：缺少标题或内容")
                    skipped_count += 1
                    continue
                
                # 检查重复 - 基于标题和内容
                existing_diaries = diary_crud.get_multi_by_user(db, user_id=current_user.id, skip=0, limit=10000)
                is_duplicate = False
                
                for existing in existing_diaries:
                    if (existing.title == diary_data["title"] and
                        existing.content == diary_data["content"]):
                        print(f"   ⏭️ 跳过重复日记：{diary_data['title'][:30]}...")
                        skipped_count += 1
                        is_duplicate = True
                        break
                
                if is_duplicate:
                    continue
                
                # 创建日记对象
                diary_create = DiaryCreate(
                    title=diary_data["title"],
                    content=diary_data["content"],
                    mood=diary_data.get("mood", ""),
                    tags=diary_data.get("tags", []),
                    is_private=diary_data.get("is_private", False)
                )
                
                # 保存到数据库
                new_diary = diary_crud.create_with_user(db=db, obj_in=diary_create, user_id=current_user.id)
                
                # 如果导入数据包含时间信息，更新创建时间
                if diary_data.get("created_at"):
                    try:
                        # 解析时间字符串，自动处理时区
                        created_time = parser.isoparse(diary_data["created_at"])
                        # 确保时间以UTC格式存储
                        if created_time.tzinfo is None:
                            # 如果没有时区信息，假设为UTC
                            created_time = created_time.replace(tzinfo=timezone.utc)
                        else:
                            # 转换为UTC
                            created_time = created_time.astimezone(timezone.utc)
                        
                        # 更新数据库中的时间
                        new_diary.created_at = created_time
                        if diary_data.get("updated_at"):
                            updated_time = parser.isoparse(diary_data["updated_at"])
                            if updated_time.tzinfo is None:
                                updated_time = updated_time.replace(tzinfo=timezone.utc)
                            else:
                                updated_time = updated_time.astimezone(timezone.utc)
                            new_diary.updated_at = updated_time
                        
                        db.commit()
                        print(f"   ✅ 成功导入日记（含时间）：{diary_data['title'][:30]}...")
                    except Exception as time_error:
                        print(f"   ⚠️ 时间解析失败，使用当前时间：{str(time_error)}")
                        print(f"   ✅ 成功导入日记：{diary_data['title'][:30]}...")
                else:
                    print(f"   ✅ 成功导入日记：{diary_data['title'][:30]}...")
                
                imported_count += 1
                
            except Exception as e:
                print(f"   ❌ 导入日记失败: {str(e)}")
                error_count += 1
                continue
        
        print(f"✅ [日记导入] 导入完成:")
        print(f"   ✅ 成功导入: {imported_count} 篇")
        print(f"   ⚠️ 跳过: {skipped_count} 篇")
        print(f"   ❌ 失败: {error_count} 篇")
        
        return {
            "message": "日记导入完成",
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "error_count": error_count,
            "total_processed": len(diaries_to_import)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [日记导入] 导入失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"导入失败: {str(e)}")


@router.get("/item/{diary_id}", response_model=DiaryResponse)
async def read_diary(
    diary_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取单个日记"""
    diary = diary_crud.get(db, diary_id)
    if not diary or diary.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Diary not found")
    return diary


@router.put("/item/{diary_id}", response_model=DiaryResponse)
async def update_diary(
    diary_id: int,
    diary_update: DiaryUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新日记"""
    diary = diary_crud.get(db, diary_id)
    if not diary or diary.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Diary not found")
    return diary_crud.update_with_user(db, db_obj=diary, obj_in=diary_update)


@router.delete("/item/{diary_id}", status_code=204)
async def delete_diary(
    diary_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除日记"""
    diary = diary_crud.get(db, diary_id)
    if not diary or diary.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Diary not found")
    diary_crud.remove(db, id=diary_id)