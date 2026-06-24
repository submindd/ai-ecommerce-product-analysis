"""
Excel 导出 API 端点
使用 FastAPI StreamingResponse 返回 .xlsx 文件供前端下载
"""

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.services.export_service import export_service

router = APIRouter()


@router.get(
    "/products",
    summary="导出商品列表 Excel",
)
async def export_products():
    """
    导出全部商品数据为 .xlsx 文件

    包含字段：ID、标题、类目、价格、销量、评分、评论数、店铺、平台、描述
    """
    buffer = export_service.export_products()
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=商品列表.xlsx"
        },
    )


@router.get(
    "/analysis-report",
    summary="导出分析报告 Excel",
)
async def export_analysis_report():
    """
    导出智能评分排名 + 类目汇总分析报告

    Sheet 1：评分排名（排名、ID、标题、综合得分、等级、各维度得分）
    Sheet 2：类目汇总（类目、数量、均价、均分、总销量、预估收入）
    """
    buffer = export_service.export_analysis_report()
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=分析报告.xlsx"
        },
    )


@router.get(
    "/profit-report",
    summary="导出利润报表 Excel",
)
async def export_profit_report(
    product_cost: float = Query(15, ge=0, description="商品成本"),
    shipping: float = Query(5, ge=0, description="运费"),
    commission_rate: float = Query(0.15, ge=0, le=1, description="佣金率"),
    advertising_cost: float = Query(3, ge=0, description="广告费用"),
):
    """
    导出多场景利润预测报表

    包含保守/市场/进取/高端四种定价场景的利润率、ROI 分析
    """
    buffer = export_service.export_profit_report(
        product_cost=product_cost,
        shipping=shipping,
        commission_rate=commission_rate,
        advertising_cost=advertising_cost,
    )
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=利润报表.xlsx"
        },
    )
