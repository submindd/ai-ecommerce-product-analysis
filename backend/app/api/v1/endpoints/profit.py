"""
利润预测 API 端点
提供利润计算和建议售价功能
"""

from fastapi import APIRouter

from app.schemas.profit import ProfitCalculateRequest, ProfitCalculateResponse
from app.services.profit_service import ProfitInput, profit_calculator

router = APIRouter()


@router.post(
    "/calculate",
    response_model=ProfitCalculateResponse,
    summary="计算利润和 ROI",
)
async def calculate_profit(request: ProfitCalculateRequest):
    """
    根据商品成本、运费、平台佣金、广告费用和售价计算：

    - 💰 毛利润、利润率
    - 📈 ROI（投资回报率）
    - 🎯 盈亏平衡售价
    - 💡 建议售价（20%/30%/40% 目标利润率）

    支持实时计算：前端可根据用户输入即时调用此接口
    """
    input_data = ProfitInput(
        product_cost=request.product_cost,
        shipping=request.shipping,
        commission_rate=request.commission_rate,
        advertising_cost=request.advertising_cost,
        selling_price=request.selling_price,
    )

    result = profit_calculator.calculate(input_data)

    return ProfitCalculateResponse(
        product_cost=result.product_cost,
        shipping=result.shipping,
        commission_rate=result.commission_rate,
        advertising_cost=result.advertising_cost,
        selling_price=result.selling_price,
        commission_amount=result.commission_amount,
        total_cost=result.total_cost,
        gross_profit=result.gross_profit,
        profit_margin=result.profit_margin,
        roi=result.roi,
        break_even_price=result.break_even_price,
        suggested_price_20=result.suggested_price_20,
        suggested_price_30=result.suggested_price_30,
        suggested_price_40=result.suggested_price_40,
        profit_level=result.profit_level,
        roi_level=result.roi_level,
        is_profitable=result.is_profitable,
    )
