"""
商品管理 API 端点
提供商品列表、详情、搜索、筛选、排序和分页功能
"""

from fastapi import APIRouter, HTTPException, Query

from app.schemas.product import (
    ProductListResponse,
    ProductQueryParams,
    ProductResponse,
)
from app.services.product_service import product_service

# 创建商品路由
router = APIRouter()


@router.get("/", response_model=ProductListResponse, summary="获取商品列表")
async def list_products(
    # ========== 搜索参数 ==========
    keyword: str | None = Query(None, description="搜索关键词（匹配标题和类目）"),
    # ========== 筛选参数 ==========
    category: str | None = Query(None, description="商品类目筛选"),
    min_price: float | None = Query(None, ge=0, description="最低价格"),
    max_price: float | None = Query(None, ge=0, description="最高价格"),
    min_rating: float | None = Query(None, ge=0, le=5, description="最低评分"),
    platform: str | None = Query(None, description="来源平台"),
    # ========== 排序参数 ==========
    sort_by: str = Query(
        "created_at",
        description="排序字段：price / sales / rating / reviews / created_at / score",
    ),
    sort_order: str = Query("desc", description="排序方向：asc（升序）/ desc（降序）"),
    # ========== 评分选项 ==========
    include_score: bool = Query(
        False, description="是否在响应中附带智能评分数据"
    ),
    # ========== 分页参数 ==========
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(12, ge=1, le=100, description="每页数量"),
):
    """
    获取商品列表

    支持功能：
    - 🔍 关键词搜索（匹配标题和类目名称）
    - 🏷️ 按类目、价格区间、评分、平台筛选
    - 📊 按价格、销量、评分、评论数、时间、综合评分排序
    - 🤖 可选附带智能选品评分
    - 📄 分页返回
    """
    params = ProductQueryParams(
        keyword=keyword,
        category=category,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        platform=platform,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )
    return product_service.get_product_list(params, include_score=include_score)


@router.get("/categories", summary="获取所有商品类目")
async def list_categories():
    """获取所有商品类目列表（用于筛选栏下拉菜单）"""
    return {"categories": product_service.get_categories()}


@router.get("/platforms", summary="获取所有来源平台")
async def list_platforms():
    """获取所有来源平台列表（用于筛选栏下拉菜单）"""
    return {"platforms": product_service.get_platforms()}


@router.get("/{product_id}", response_model=ProductResponse, summary="获取商品详情")
async def get_product(product_id: int):
    """
    根据商品 ID 获取商品详细信息

    - **product_id**: 商品唯一标识
    """
    product = product_service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"商品 ID {product_id} 不存在")
    return product
