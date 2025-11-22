from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


def get_user(db: Session, user_id: int) -> User | None:
    """根据ID获取用户"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> User | None:
    """根据用户名获取用户"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    """根据邮箱获取用户"""
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    """获取用户列表"""
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user: UserCreate) -> User:
    """创建用户"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        bio=user.bio,
        avatar_url=user.avatar_url
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: UserUpdate) -> User | None:
    """更新用户"""
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    """删除用户"""
    db_user = get_user(db, user_id)
    if not db_user:
        return False

    db.delete(db_user)
    db.commit()
    return True


def authenticate_user(db: Session, username_or_email: str, password: str) -> User | None:
    """验证用户（支持用户名或邮箱）"""
    # 首先尝试按用户名查找
    user = get_user_by_username(db, username_or_email)
    
    # 如果用户名不存在，尝试按邮箱查找
    if not user:
        user = get_user_by_email(db, username_or_email)
    
    # 如果用户仍然不存在或密码错误，返回None
    if not user or not verify_password(password, user.hashed_password):
        return None
    
    return user


def user_exists(db: Session, username: str = None, email: str = None) -> bool:
    """检查用户是否存在"""
    query = db.query(User)
    if username:
        query = query.filter(User.username == username)
    if email:
        query = query.filter(User.email == email)
    return query.first() is not None