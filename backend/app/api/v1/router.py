"""
API v1 主路由聚合模块
在此处集中注册所有子路由
"""

from fastapi import APIRouter

from app.api.v1.endpoints import analysis, analyzer, dashboard, export, products, profit, scraper, scoring, shopee

# 创建 v1 版本的主路由
api_router = APIRouter()

# ========== 注册子路由 ==========
api_router.include_router(
    products.router, prefix="/products", tags=["商品管理"]
)
api_router.include_router(
    scoring.router, prefix="/scoring", tags=["智能评分"]
)
api_router.include_router(
    analysis.router, prefix="/analysis", tags=["AI智能分析"]
)
api_router.include_router(
    dashboard.router, prefix="/dashboard", tags=["数据可视化"]
)
api_router.include_router(
    profit.router, prefix="/profit", tags=["利润预测"]
)
api_router.include_router(
    export.router, prefix="/export", tags=["Excel导出"]
)
api_router.include_router(
    scraper.router, prefix="/scraper", tags=["商品爬虫"]
)
api_router.include_router(
    analyzer.router, prefix="/analyzer", tags=["商品分析"]
)
api_router.include_router(
    shopee.router, prefix="/shopee", tags=["Shopee"]
)
# 后续阶段逐步添加：
# api_router.include_router(auth.router, prefix="/auth", tags=["用户认证"])


# ========== 连通性测试端点 ==========
@api_router.get("/ping", tags=["系统"])
async def ping():
    """API 连通性测试"""
    return {"message": "pong", "version": "v1"}
