"""
利润预测请求/响应 Schema
"""

from pydantic import BaseModel, Field


class ProfitCalculateRequest(BaseModel):
    """利润计算请求参数"""

    product_cost: float = Field(..., ge=0, description="商品成本（美元）")
    shipping: float = Field(..., ge=0, description="运费（美元）")
    commission_rate: float = Field(
        ..., ge=0, le=1, description="平台佣金率（0-1），如 0.15 表示 15%"
    )
    advertising_cost: float = Field(..., ge=0, description="广告费用（美元/件）")
    selling_price: float = Field(..., ge=0, description="售价（美元）")


class ProfitCalculateResponse(BaseModel):
    """利润计算响应"""

    # 输入回显
    product_cost: float
    shipping: float
    commission_rate: float
    advertising_cost: float
    selling_price: float

    # 中间计算
    commission_amount: float = Field(..., description="平台佣金金额")
    total_cost: float = Field(..., description="总成本")
    gross_profit: float = Field(..., description="毛利润")

    # 核心指标
    profit_margin: float = Field(..., description="利润率（%）")
    roi: float = Field(..., description="投资回报率（%）")

    # 分析
    break_even_price: float = Field(..., description="盈亏平衡售价")
    suggested_price_20: float = Field(..., description="建议售价（目标利润率20%）")
    suggested_price_30: float = Field(..., description="建议售价（目标利润率30%）")
    suggested_price_40: float = Field(..., description="建议售价（目标利润率40%）")

    # 等级评定
    profit_level: str = Field(..., description="利润率等级（优秀/良好/一般/亏损）")
    roi_level: str = Field(..., description="ROI 等级（优秀/良好/一般/亏损）")
    is_profitable: bool = Field(..., description="是否盈利")
