"""
FastAPI 应用入口
负责创建应用实例、注册中间件和路由
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1.router import api_router
from app.api.unified import router as unified_router


# ========== 应用生命周期管理 ==========
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用启动和关闭时的回调"""
    # 启动时：初始化数据库连接池
    print(f"[Startup] {settings.APP_NAME} v{settings.APP_VERSION} is starting...")
    yield
    # 关闭时：释放数据库连接池
    print("[Shutdown] Application has been closed")


# ========== 创建 FastAPI 应用 ==========
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI 驱动的跨境电商智能选品分析平台",
    lifespan=lifespan,
)


# ========== 跨域中间件 ==========
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有 HTTP 方法
    allow_headers=["*"],  # 允许所有请求头
)


# ========== 注册 API 路由 ==========
# 统一 API（对外暴露的核心接口）
app.include_router(unified_router, prefix="/api")
# v1 版本路由（完整功能集）
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# ========== 健康检查端点 ==========
@app.get("/health", tags=["系统"])
async def health_check():
    """健康检查接口，用于监控服务状态"""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
