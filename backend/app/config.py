"""
应用配置管理模块
使用 pydantic-settings 从环境变量加载配置
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用全局配置"""

    # ========== 应用基础配置 ==========
    APP_NAME: str = "AI跨境电商智能选品分析平台"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # ========== 数据库配置 ==========
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "crossborder_ai"

    # ========== 数据库连接池配置 ==========
    DB_POOL_SIZE: int = 10
    DB_POOL_RECYCLE: int = 3600
    DB_ECHO: bool = False  # 是否打印 SQL 日志

    # ========== AI 服务配置 ==========
    DEEPSEEK_API_KEY: str = "sk-5becd02f10d043d7a984203d837cafc6"
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com/v1"

    # ========== 跨域配置 ==========
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",  # Next.js 开发服务器
        "http://127.0.0.1:3000",
    ]

    @property
    def database_url(self) -> str:
        """构建 MySQL 连接 URL（同步）"""
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            f"?charset=utf8mb4"
        )

    @property
    def async_database_url(self) -> str:
        """构建 MySQL 连接 URL（异步）"""
        return (
            f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            f"?charset=utf8mb4"
        )

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


# 全局配置单例
settings = Settings()
