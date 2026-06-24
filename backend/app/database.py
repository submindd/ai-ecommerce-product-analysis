"""
数据库连接管理模块
使用 SQLAlchemy 管理 MySQL 连接和会话
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


# ========== 同步引擎（用于 Alembic 迁移等场景） ==========
sync_engine = create_engine(
    settings.database_url,
    pool_size=settings.DB_POOL_SIZE,
    pool_recycle=settings.DB_POOL_RECYCLE,
    echo=settings.DB_ECHO,
)

# 同步会话工厂
SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False,
)

# ========== 异步引擎（用于 FastAPI 请求处理） ==========
async_engine = create_async_engine(
    settings.async_database_url,
    pool_size=settings.DB_POOL_SIZE,
    pool_recycle=settings.DB_POOL_RECYCLE,
    echo=settings.DB_ECHO,
)

# 异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ========== ORM 基类 ==========
class Base(DeclarativeBase):
    """所有数据模型的基类"""
    pass


# ========== 依赖注入：获取数据库会话 ==========
async def get_db() -> AsyncSession:
    """
    FastAPI 依赖注入函数
    在请求处理期间提供数据库会话，请求结束后自动关闭
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
