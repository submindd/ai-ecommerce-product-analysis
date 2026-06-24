"""
智能选品评分 API 端点
提供商品评分计算、推荐列表、按评分排序等功能
"""

from fastapi import APIRouter, Query

from app.schemas.product import (
    DimensionScoresResponse,
    ProductScoreResponse,
    ProductWithScoreResponse,
    RecommendationResponse,
)
from app.services.product_service import product_service

# 延迟导入，避免循环依赖
def _get_scoring_service():
    from app.services.scoring_service import scoring_service
    return scoring_service


router = APIRouter()


def _build_product_with_score(product: dict, score) -> ProductWithScoreResponse:
    """构建带评分的商品响应对象"""
    return ProductWithScoreResponse(
        product_id=product["id"],
        title=product["title"],
        image=product.get("image_url", product.get("image", "")),
        price=product["price"],
        sales=product["sales"],
        rating=product["rating"],
        reviews=product["reviews"],
        store=product.get("store", product.get("shop_name", "")),
        category=product["category"],
        composite_score=score.composite_score,
        tier=score.tier,
        dimensions=DimensionScoresResponse(
            sales_score=score.dimensions.sales_score,
            rating_score=score.dimensions.rating_score,
            reviews_score=score.dimensions.reviews_score,
            price_score=score.dimensions.price_score,
        ),
    )


@router.get(
    "/top-recommendations",
    response_model=RecommendationResponse,
    summary="获取 Top N 推荐商品",
)
async def get_top_recommendations(
    n: int = Query(10, ge=1, le=50, description="推荐数量"),
):
    """
    获取综合评分最高的 Top N 商品推荐

    评分模型考虑四个维度：
    - 📊 销量（权重 30%）
    - ⭐ 商品评分（权重 25%）
    - 💬 评论数量（权重 20%）
    - 💰 价格竞争力（权重 25%）
    """
    scoring = _get_scoring_service()
    # 获取所有商品原始数据
    all_products = product_service.get_all_raw_products()
    # 计算评分并取 Top N
    top_scores = scoring.get_top_recommendations(all_products, top_n=n)

    items = []
    product_map = {p["id"]: p for p in all_products}
    for score in top_scores:
        product = product_map.get(score.product_id)
        if product:
            items.append(_build_product_with_score(product, score))

    return RecommendationResponse(
        recommendations=items,
        total_scored=len(all_products),
    )


@router.get(
    "/by-category",
    response_model=dict[str, list[ProductWithScoreResponse]],
    summary="按类目分组获取推荐",
)
async def get_recommendations_by_category(
    top_n: int = Query(5, ge=1, le=20, description="每个类目的推荐数量"),
):
    """
    按商品类目分组，返回每个类目内的 Top N 评分商品
    """
    scoring = _get_scoring_service()
    all_products = product_service.get_all_raw_products()
    grouped = scoring.get_recommendations_by_category(all_products, top_n=top_n)

    product_map = {p["id"]: p for p in all_products}
    result: dict[str, list[ProductWithScoreResponse]] = {}
    for category, scores in grouped.items():
        items = []
        for score in scores:
            product = product_map.get(score.product_id)
            if product:
                items.append(_build_product_with_score(product, score))
        result[category] = items

    return result


@router.get(
    "/product/{product_id}",
    response_model=ProductScoreResponse,
    summary="获取单个商品的评分详情",
)
async def get_product_score(product_id: int):
    """
    获取指定商品的各维度评分明细和综合得分
    """
    from fastapi import HTTPException
    scoring = _get_scoring_service()
    all_products = product_service.get_all_raw_products()

    target = None
    category_products = []
    for p in all_products:
        if p["id"] == product_id:
            target = p
        if target is None:
            category_products.append(p)

    if not target:
        raise HTTPException(status_code=404, detail=f"商品 ID {product_id} 不存在")

    # 获取同品类商品
    category_products = [
        p for p in all_products
        if p["category"] == target["category"]
    ]

    score = scoring.score_product(target, category_products)
    return ProductScoreResponse(
        product_id=score.product_id,
        composite_score=score.composite_score,
        tier=score.tier,
        dimensions=DimensionScoresResponse(
            sales_score=score.dimensions.sales_score,
            rating_score=score.dimensions.rating_score,
            reviews_score=score.dimensions.reviews_score,
            price_score=score.dimensions.price_score,
        ),
    )
