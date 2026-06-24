"""
数据可视化仪表盘 API
提供销量趋势、评分分布、类目分析、利润分析等图表数据
"""

import math
from datetime import datetime, timedelta

from fastapi import APIRouter

from app.schemas.dashboard import (
    CategoryAnalysisResponse,
    ProfitAnalysisResponse,
    RatingDistributionResponse,
    SalesTrendResponse,
)
from app.services.product_service import product_service

router = APIRouter()

# ========== 配色方案 ==========
CHART_COLORS = [
    "#6366f1", "#8b5cf6", "#d946ef", "#ec4899",
    "#f43f5e", "#f97316", "#eab308", "#22c55e",
    "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1",
]


@router.get(
    "/sales-trend",
    response_model=SalesTrendResponse,
    summary="销量趋势数据",
)
async def get_sales_trend():
    """
    获取近 12 个月的销量趋势数据

    返回月度销量、环比增长率，供面积图/折线图使用
    """
    products = product_service.get_all_raw_products()

    # 生成近 12 个月的数据
    months = []
    now = datetime.now()
    for i in range(11, -1, -1):
        month_date = now - timedelta(days=30 * i)
        months.append(month_date.strftime("%Y-%m"))

    # 按月份聚合销量（模拟数据分布到各月）
    total_sales = sum(p["sales"] for p in products)
    monthly_values = []
    prev_value = None

    # 使用正弦波模拟季节性波动
    for idx, month in enumerate(months):
        # 基础销量 + 季节性波动 + 增长趋势
        base = total_sales / 12
        seasonal = math.sin((idx / 12) * 2 * math.pi) * base * 0.3
        trend = idx * base * 0.04
        # 添加随机噪声
        noise = (hash(month) % 100 - 50) / 50 * base * 0.1
        value = int(base + seasonal + trend + noise)
        value = max(value, int(base * 0.5))

        growth_rate = None
        if prev_value and prev_value > 0:
            growth_rate = round((value - prev_value) / prev_value * 100, 1)

        monthly_values.append({
            "month": month,
            "sales": value,
            "growth_rate": growth_rate,
        })
        prev_value = value

    return SalesTrendResponse(
        months=[m["month"] for m in monthly_values],
        sales=[m["sales"] for m in monthly_values],
        growth_rates=[m["growth_rate"] for m in monthly_values],
    )


@router.get(
    "/rating-distribution",
    response_model=RatingDistributionResponse,
    summary="评分分布数据",
)
async def get_rating_distribution():
    """
    获取商品评分分布数据

    返回各评分区间（0-1, 1-2, 2-3, 3-4, 4-5）的商品数量
    """
    products = product_service.get_all_raw_products()
    distribution = [0, 0, 0, 0, 0]  # 0-1, 1-2, 2-3, 3-4, 4-5

    for p in products:
        rating = p["rating"]
        if rating < 1:
            distribution[0] += 1
        elif rating < 2:
            distribution[1] += 1
        elif rating < 3:
            distribution[2] += 1
        elif rating < 4:
            distribution[3] += 1
        else:
            distribution[4] += 1

    labels = ["0-1 分", "1-2 分", "2-3 分", "3-4 分", "4-5 分"]

    return RatingDistributionResponse(
        labels=labels,
        counts=distribution,
    )


@router.get(
    "/category-analysis",
    response_model=CategoryAnalysisResponse,
    summary="类目分析数据",
)
async def get_category_analysis():
    """
    获取商品类目分析数据

    返回各类目的商品数量、平均价格、平均评分，供饼图和柱状图使用
    """
    products = product_service.get_all_raw_products()

    # 按类目聚合
    by_category: dict[str, list[dict]] = {}
    for p in products:
        cat = p["category"]
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(p)

    categories = []
    counts = []
    avg_prices = []
    avg_ratings = []
    total_sales_list = []

    for cat, cat_products in sorted(by_category.items()):
        categories.append(cat)
        counts.append(len(cat_products))
        avg_prices.append(round(sum(p["price"] for p in cat_products) / len(cat_products), 2))
        avg_ratings.append(round(sum(p["rating"] for p in cat_products) / len(cat_products), 2))
        total_sales_list.append(sum(p["sales"] for p in cat_products))

    return CategoryAnalysisResponse(
        categories=categories,
        counts=counts,
        avg_prices=avg_prices,
        avg_ratings=avg_ratings,
        total_sales=total_sales_list,
        colors=CHART_COLORS[:len(categories)],
    )


@router.get(
    "/profit-analysis",
    response_model=ProfitAnalysisResponse,
    summary="利润分析数据",
)
async def get_profit_analysis():
    """
    获取利润分析数据

    按类目估算收入、成本、利润和利润率，供组合图使用
    """
    products = product_service.get_all_raw_products()

    # 按类目聚合
    by_category: dict[str, list[dict]] = {}
    for p in products:
        cat = p["category"]
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(p)

    categories = []
    revenues = []
    costs = []
    profits = []
    profit_margins = []

    for cat, cat_products in sorted(by_category.items()):
        categories.append(cat)
        # 收入 = 价格 × 销量
        revenue = sum(p["price"] * p["sales"] for p in cat_products)
        # 假设成本率为 40%-60%（模拟不同类目差异）
        cost_rate = 0.4 + (hash(cat) % 20) / 100
        cost = revenue * cost_rate
        profit = revenue - cost
        margin = round(profit / revenue * 100, 1) if revenue > 0 else 0

        revenues.append(round(revenue, 2))
        costs.append(round(cost, 2))
        profits.append(round(profit, 2))
        profit_margins.append(margin)

    return ProfitAnalysisResponse(
        categories=categories,
        revenues=revenues,
        costs=costs,
        profits=profits,
        profit_margins=profit_margins,
        colors=CHART_COLORS[:len(categories)],
    )
