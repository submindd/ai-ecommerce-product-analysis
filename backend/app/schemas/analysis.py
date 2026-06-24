"""
AI 分析响应数据模式
定义四种分析场景的 API 响应结构
"""

from typing import Optional

from pydantic import BaseModel, Field


# ========== 卖点单项 ==========
class SellingPoint(BaseModel):
    """商品卖点"""

    title: str = Field(..., description="卖点标题（8-15字）")
    description: str = Field(..., description="卖点描述（20-40字）")
    level: str = Field(..., description="竞争力评级：强/中/弱")


# ========== 风险单项 ==========
class Risk(BaseModel):
    """选品风险点"""

    title: str = Field(..., description="风险标题（8-15字）")
    description: str = Field(..., description="风险描述（20-40字）")
    level: str = Field(..., description="风险等级：高/中/低")


# ========== 单项分析响应 ==========

class TagGenerationResponse(BaseModel):
    """商品标签生成响应"""

    product_id: int = Field(..., description="商品ID")
    tags: list[str] = Field(..., description="AI 生成的商品标签")


class RecommendationResponse(BaseModel):
    """推荐理由响应"""

    product_id: int = Field(..., description="商品ID")
    recommendation: str = Field(..., description="AI 生成的推荐理由")


class SellingPointsResponse(BaseModel):
    """卖点分析响应"""

    product_id: int = Field(..., description="商品ID")
    selling_points: list[SellingPoint] = Field(..., description="卖点列表")


class RiskAnalysisResponse(BaseModel):
    """风险分析响应"""

    product_id: int = Field(..., description="商品ID")
    risks: list[Risk] = Field(..., description="风险列表")


# ========== 综合分析响应 ==========

class FullAnalysisResponse(BaseModel):
    """综合分析响应（一次性返回所有分析结果）"""

    product_id: int = Field(..., description="商品ID")
    tags: list[str] = Field(..., description="AI 生成的商品标签")
    recommendation: str = Field(..., description="AI 生成的推荐理由")
    selling_points: list[SellingPoint] = Field(..., description="卖点列表")
    risks: list[Risk] = Field(..., description="风险列表")
