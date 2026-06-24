"""
仪表盘数据 Schema
定义图表数据的 API 响应结构
"""

from typing import Optional

from pydantic import BaseModel, Field


class SalesTrendResponse(BaseModel):
    """销量趋势响应"""

    months: list[str] = Field(..., description="月份列表（YYYY-MM）")
    sales: list[int] = Field(..., description="月度销量列表")
    growth_rates: list[Optional[float]] = Field(..., description="环比增长率（%）")


class RatingDistributionResponse(BaseModel):
    """评分分布响应"""

    labels: list[str] = Field(..., description="评分区间标签")
    counts: list[int] = Field(..., description="各区间商品数量")


class CategoryAnalysisResponse(BaseModel):
    """类目分析响应"""

    categories: list[str] = Field(..., description="类目名称列表")
    counts: list[int] = Field(..., description="各类目商品数量")
    avg_prices: list[float] = Field(..., description="各类目平均价格")
    avg_ratings: list[float] = Field(..., description="各类目平均评分")
    total_sales: list[int] = Field(..., description="各类目总销量")
    colors: list[str] = Field(..., description="图表配色")


class ProfitAnalysisResponse(BaseModel):
    """利润分析响应"""

    categories: list[str] = Field(..., description="类目名称列表")
    revenues: list[float] = Field(..., description="各类目收入")
    costs: list[float] = Field(..., description="各类目成本")
    profits: list[float] = Field(..., description="各类目利润")
    profit_margins: list[float] = Field(..., description="各类目利润率（%）")
    colors: list[str] = Field(..., description="图表配色")
