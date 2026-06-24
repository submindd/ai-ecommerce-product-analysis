"""
商品数据校验和响应模式
定义 API 请求和响应的数据结构
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ========== 商品基础 Schema ==========
class ProductBase(BaseModel):
    """商品基础字段"""

    title: str = Field(..., description="商品标题", max_length=500)
    image_url: str = Field(..., description="商品图片URL")
    price: float = Field(..., description="当前售价（美元）", ge=0)
    original_price: Optional[float] = Field(default=None, description="原价（美元）")
    cost: Optional[float] = Field(default=None, description="商品成本（美元）")
    shipping_fee: float = Field(default=0.0, description="运费（美元/件）")
    commission_rate: float = Field(default=0.15, description="平台佣金比例（0-1）")
    sales: int = Field(default=0, description="累计销量", ge=0)
    rating: float = Field(default=0.0, description="商品评分（1-5）", ge=0, le=5)
    reviews: int = Field(default=0, description="评论数量", ge=0)
    store: str = Field(..., description="店铺名称", max_length=200)
    category: str = Field(..., description="商品类目", max_length=100)
    platform: str = Field(default="shopee", description="所属平台: shopee/amazon/tiktok/aliexpress")
    publish_date: Optional[str] = Field(default=None, description="发布日期")


# ========== 商品响应 Schema ==========
class ProductResponse(ProductBase):
    """商品详情响应"""

    id: int = Field(..., description="商品ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: Optional[datetime] = Field(default=None, description="更新时间")
    # 评分字段（可选，由 include_score 参数控制）
    composite_score: Optional[float] = Field(default=None, description="综合评分")
    score_tier: Optional[str] = Field(default=None, description="评分等级")
    # JSON 分析字段
    price_analysis: Optional[dict] = Field(default=None, description="价格分析数据")
    profit_analysis: Optional[dict] = Field(default=None, description="利润分析数据")

    model_config = {"from_attributes": True}


# ========== 商品列表响应 Schema ==========
class ProductListResponse(BaseModel):
    """商品列表响应（含分页信息）"""

    items: list[ProductResponse] = Field(..., description="商品列表")
    total: int = Field(..., description="符合条件的总数量")
    page: int = Field(..., description="当前页码")
    page_size: int = Field(..., description="每页数量")
    total_pages: int = Field(..., description="总页数")


# ========== 商品搜索/筛选请求 Schema ==========
class ProductQueryParams(BaseModel):
    """商品查询参数（搜索 + 筛选 + 排序 + 分页）"""

    keyword: Optional[str] = Field(default=None, description="搜索关键词")
    category: Optional[str] = Field(default=None, description="类目筛选")
    min_price: Optional[float] = Field(default=None, description="最低价格", ge=0)
    max_price: Optional[float] = Field(default=None, description="最高价格", ge=0)
    min_rating: Optional[float] = Field(default=None, description="最低评分", ge=0, le=5)
    platform: Optional[str] = Field(default=None, description="来源平台")
    sort_by: Optional[str] = Field(
        default="created_at",
        description="排序字段: price, sales, rating, reviews, created_at, score",
    )
    sort_order: Optional[str] = Field(
        default="desc",
        description="排序方向: asc（升序）, desc（降序）",
    )
    page: int = Field(default=1, description="页码", ge=1)
    page_size: int = Field(default=12, description="每页数量", ge=1, le=100)


# ========== 评分维度明细 Schema ==========
class DimensionScoresResponse(BaseModel):
    """各维度评分明细"""

    sales_score: float = Field(..., description="销量得分 (0-100)")
    rating_score: float = Field(..., description="评分得分 (0-100)")
    reviews_score: float = Field(..., description="评论得分 (0-100)")
    price_score: float = Field(..., description="价格竞争力得分 (0-100)")


# ========== 商品综合评分响应 ==========
class ProductScoreResponse(BaseModel):
    """商品综合评分结果"""

    product_id: int = Field(..., description="商品ID")
    composite_score: float = Field(..., description="综合得分 (0-100)")
    tier: str = Field(..., description="评分等级（强烈推荐/值得考虑/一般/观望）")
    dimensions: DimensionScoresResponse = Field(..., description="各维度得分明细")


# ========== 带评分的商品响应 ==========
class ProductWithScoreResponse(BaseModel):
    """商品详情 + 评分的组合响应"""

    product_id: int = Field(..., description="商品ID")
    title: str = Field(..., description="商品标题")
    image_url: str = Field(..., description="商品图片URL")
    price: float = Field(..., description="商品价格")
    sales: int = Field(..., description="累计销量")
    rating: float = Field(..., description="商品评分")
    reviews: int = Field(..., description="评论数量")
    store: str = Field(..., description="店铺名称")
    category: str = Field(..., description="商品类目")
    composite_score: float = Field(..., description="综合得分")
    tier: str = Field(..., description="评分等级")
    dimensions: DimensionScoresResponse = Field(..., description="各维度得分明细")


# ========== 推荐商品响应 ==========
class RecommendationResponse(BaseModel):
    """推荐商品列表响应"""

    recommendations: list[ProductWithScoreResponse] = Field(..., description="推荐商品列表")
    total_scored: int = Field(..., description="参与评分的商品总数")
