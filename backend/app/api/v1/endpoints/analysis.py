"""
AI 智能分析 API 端点
提供商品标签生成、推荐理由、卖点分析和风险提示功能
"""

from fastapi import APIRouter, HTTPException, Query

from app.schemas.analysis import (
    FullAnalysisResponse,
    RecommendationResponse,
    RiskAnalysisResponse,
    SellingPointsResponse,
    TagGenerationResponse,
)
from app.services.ai_service import ai_service
from app.services.product_service import product_service

router = APIRouter()


def _get_product_dict(product_id: int) -> dict:
    """获取商品原始数据字典"""
    for p in product_service.get_all_raw_products():
        if p["id"] == product_id:
            return p
    raise HTTPException(status_code=404, detail=f"商品 ID {product_id} 不存在")


@router.get(
    "/{product_id}/tags",
    response_model=TagGenerationResponse,
    summary="AI 生成商品标签",
)
async def generate_tags(product_id: int):
    """
    根据商品信息，AI 自动生成多维度标签

    标签覆盖：功能特性、适用场景、目标人群、价格定位、品质特征
    """
    product = _get_product_dict(product_id)
    result = await ai_service.generate_tags(product)
    tags = result.get("tags", [])
    return TagGenerationResponse(product_id=product_id, tags=tags)


@router.get(
    "/{product_id}/recommendation",
    response_model=RecommendationResponse,
    summary="AI 生成推荐理由",
)
async def generate_recommendation(product_id: int):
    """
    AI 从选品角度生成 80-120 字的推荐理由

    分析维度：市场表现、利润空间、消费者认可度、适合卖家类型
    """
    product = _get_product_dict(product_id)
    result = await ai_service.generate_recommendation(product)
    return RecommendationResponse(
        product_id=product_id,
        recommendation=result.get("recommendation", ""),
    )


@router.get(
    "/{product_id}/selling-points",
    response_model=SellingPointsResponse,
    summary="AI 分析商品卖点",
)
async def analyze_selling_points(product_id: int):
    """
    AI 识别商品 3-5 个核心卖点

    每个卖点包含标题、详细说明和竞争力评级（强/中/弱）
    """
    product = _get_product_dict(product_id)
    result = await ai_service.analyze_selling_points(product)
    selling_points = result.get("selling_points", [])
    return SellingPointsResponse(
        product_id=product_id, selling_points=selling_points
    )


@router.get(
    "/{product_id}/risks",
    response_model=RiskAnalysisResponse,
    summary="AI 分析选品风险",
)
async def analyze_risks(product_id: int):
    """
    AI 分析 3-5 个潜在选品风险点

    分析维度：市场竞争、价格波动、品控风险、供应链风险、季节性风险
    每个风险点包含标题、描述和风险等级（高/中/低）
    """
    product = _get_product_dict(product_id)
    result = await ai_service.analyze_risks(product)
    risks = result.get("risks", [])
    return RiskAnalysisResponse(product_id=product_id, risks=risks)


@router.get(
    "/{product_id}/full",
    response_model=FullAnalysisResponse,
    summary="AI 综合分析（一次性返回全部）",
)
async def full_analysis(product_id: int):
    """
    AI 综合分析：一次请求返回标签、推荐理由、卖点和风险提示

    推荐使用此接口以减少 API 调用次数
    """
    product = _get_product_dict(product_id)
    result = await ai_service.full_analysis(product)

    return FullAnalysisResponse(
        product_id=product_id,
        tags=result.get("tags", []),
        recommendation=result.get("recommendation", ""),
        selling_points=result.get("selling_points", []),
        risks=result.get("risks", []),
    )
