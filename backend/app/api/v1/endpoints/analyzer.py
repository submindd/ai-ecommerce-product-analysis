"""
单商品分析 API 端点
提供单个商品分析、批量分析、分析结果查询功能
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query

from app.schemas.product import (
    ProductResponse,
    ProductWithScoreResponse,
)
from app.services.product_analyzer import product_analyzer
from app.services.product_service import product_service

router = APIRouter()


@router.post(
    "/product/{product_id}",
    summary="分析单个商品并保存到数据库",
)
async def analyze_single_product(
    product_id: int,
    advertising_cost: float = Query(3.0, ge=0, description="广告费用（美元/件）"),
):
    """
    对指定商品执行完整分析并更新数据库：

    1. 计算智能选品评分（4 维度加权）→ 写入 analysis_score
    2. 生成价格分析 JSON → 写入 price_analysis
    3. 生成利润分析 JSON → 写入 profit_analysis

    需要先运行爬虫填充商品基础数据
    """
    # 获取商品原始数据
    all_products = product_service.get_all_raw_products()
    target = None
    for p in all_products:
        if p["id"] == product_id:
            target = p
            break

    if not target:
        raise HTTPException(status_code=404, detail=f"商品 ID={product_id} 不存在")

    # 执行分析
    result = product_analyzer.analyze_product(
        product=target,
        all_products=all_products,
        advertising_cost=advertising_cost,
    )

    # 保存到数据库
    saved = product_analyzer.save_to_db(product_id, result)

    return {
        "product_id": product_id,
        "saved": saved,
        "analysis_score": result["analysis_score"],
        "price_analysis": result["price_analysis"],
        "profit_analysis": result["profit_analysis"],
    }


@router.post(
    "/batch",
    summary="批量分析所有商品",
)
async def analyze_all_products(
    background_tasks: BackgroundTasks,
    advertising_cost: float = Query(3.0, ge=0, description="广告费用（美元/件）"),
):
    """
    异步批量分析所有商品并更新数据库

    注意：大批量分析可能需要几分钟，使用后台任务执行
    """
    all_products = product_service.get_all_raw_products()

    # 后台执行批量分析
    def run_batch():
        product_analyzer.batch_analyze(all_products, advertising_cost)

    background_tasks.add_task(run_batch)

    return {
        "message": f"批量分析已启动！共 {len(all_products)} 个商品，正在后台执行...",
        "total": len(all_products),
    }


@router.get(
    "/product/{product_id}/report",
    summary="获取单个商品的分析报告",
)
async def get_product_analysis_report(product_id: int):
    """
    查询指定商品已保存的分析结果

    返回：评分 + 价格分析 + 利润分析
    """
    all_products = product_service.get_all_raw_products()
    target = None
    for p in all_products:
        if p["id"] == product_id:
            target = p
            break

    if not target:
        raise HTTPException(status_code=404, detail=f"商品 ID={product_id} 不存在")

    # 如果尚未分析则当场计算
    result = product_analyzer.analyze_product(
        product=target,
        all_products=all_products,
    )

    return {
        "product_id": product_id,
        "title": target.get("title", ""),
        "category": target.get("category", ""),
        "analysis_score": result["analysis_score"],
        "price_analysis": result["price_analysis"],
        "profit_analysis": result["profit_analysis"],
    }
