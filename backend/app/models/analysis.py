"""
商品分析相关数据模型
- ProductPriceHistory: 历史价格记录
- ProductAnalysis: 商品综合分析结果（一对一）
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Boolean, Date, DateTime, DECIMAL, Float, Integer, JSON, String, Text, func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ProductPriceHistory(Base):
    """商品价格历史记录表"""

    __tablename__ = "product_price_history"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True,
        comment="记录ID"
    )
    product_id: Mapped[int] = mapped_column(
        Integer, nullable=False, index=True,
        comment="关联商品ID"
    )
    price: Mapped[float] = mapped_column(
        Float, nullable=False,
        comment="历史价格（美元）"
    )
    recorded_date: Mapped[date] = mapped_column(
        Date, nullable=False,
        comment="价格记录日期"
    )
    source: Mapped[str] = mapped_column(
        String(50), default="mock",
        comment="数据来源"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(),
        comment="创建时间"
    )


class ProductAnalysis(Base):
    """商品综合分析结果表（与商品一对一）"""

    __tablename__ = "product_analysis"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True,
        comment="记录ID"
    )
    product_id: Mapped[int] = mapped_column(
        Integer, nullable=False, unique=True, index=True,
        comment="关联商品ID"
    )

    # ---- 智能评分 ----
    analysis_score: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True,
        comment="综合评分（0-100）"
    )

    # ---- 价格分析 ----
    price_tier: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True,
        comment="价格区间（低/中/高）"
    )
    category_avg_price: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True,
        comment="类目均价"
    )
    price_competitiveness: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True,
        comment="价格竞争力得分"
    )
    is_good_time_to_enter: Mapped[Optional[bool]] = mapped_column(
        Boolean, nullable=True,
        comment="是否适合入场"
    )

    # ---- 利润分析 ----
    estimated_cost: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True,
        comment="估算成本"
    )
    estimated_profit: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True,
        comment="预估利润"
    )
    profit_margin: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True,
        comment="利润率（%）"
    )
    roi: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True,
        comment="ROI（%）"
    )

    # ---- 评论质量 ----
    review_quality_score: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True,
        comment="评论质量得分"
    )
    review_sentiment: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True,
        comment="评论情感倾向"
    )

    # ---- AI 分析 ----
    ai_tags: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ai_advantages: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ai_disadvantages: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ai_competition_level: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True,
        comment="市场竞争程度"
    )
    ai_worth_it: Mapped[Optional[bool]] = mapped_column(
        Boolean, nullable=True,
        comment="是否值得做"
    )
    ai_recommendation: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True,
        comment="AI 推荐理由"
    )
    ai_risks: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ai_summary: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True,
        comment="AI 综合分析总结"
    )
    ai_analysis_json: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True,
        comment="AI 完整分析结果缓存（JSON，7天有效期）"
    )

    # ---- JSON 快照 ----
    price_analysis_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    profit_analysis_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # ---- 统计 ----
    price_history_lowest: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True,
        comment="历史最低价"
    )
    price_history_highest: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True,
        comment="历史最高价"
    )

    # ---- 时间 ----
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
