"""
商品数据模型
使用 SQLAlchemy ORM 映射到 MySQL crossborder_ai.products 表
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Date, DateTime, DECIMAL, Float, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Product(Base):
    """跨境商品数据模型"""

    __tablename__ = "products"

    # ========== 主键 ==========
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True,
        comment="商品ID（主键，自增）"
    )

    # ========== 基础信息 ==========
    title: Mapped[str] = mapped_column(
        String(500), nullable=False,
        comment="商品标题"
    )
    image_url: Mapped[str] = mapped_column(
        String(1000), nullable=False,
        comment="商品图片URL"
    )
    category: Mapped[str] = mapped_column(
        String(100), nullable=False,
        comment="商品类目"
    )
    store: Mapped[str] = mapped_column(
        String(200), nullable=False,
        comment="店铺名称"
    )
    publish_date: Mapped[Optional[date]] = mapped_column(
        Date, nullable=True,
        comment="发布日期"
    )

    # ========== 价格信息 ==========
    price: Mapped[float] = mapped_column(
        Float, nullable=False,
        comment="当前售价（美元）"
    )
    original_price: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True,
        comment="原价（美元），用于计算折扣幅度"
    )
    cost: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True,
        comment="商品成本（美元），用户手动填写"
    )
    shipping_fee: Mapped[float] = mapped_column(
        Float, default=0.0,
        comment="运费（美元/件）"
    )
    commission_rate: Mapped[float] = mapped_column(
        Float, default=0.15,
        comment="平台佣金比例（0-1），默认15%"
    )

    # ========== 市场表现 ==========
    sales: Mapped[int] = mapped_column(
        Integer, default=0,
        comment="累计销量"
    )
    rating: Mapped[float] = mapped_column(
        Float, default=0.0,
        comment="商品评分（1.00-5.00）"
    )
    reviews: Mapped[int] = mapped_column(
        Integer, default=0,
        comment="评论数量"
    )

    # ========== 智能分析数据 ==========
    analysis_score: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True,
        comment="智能选品综合评分（0-100）"
    )
    price_analysis: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True,
        comment="价格分析数据（JSON）：{suggested_price, profit_margin, roi, ...}"
    )
    profit_analysis: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True,
        comment="利润分析数据（JSON）：{revenue, cost, profit, scenarios, ...}"
    )

    # ========== 时间戳 ==========
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(),
        comment="创建时间"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(),
        comment="更新时间（自动更新）"
    )

    def __repr__(self) -> str:
        return f"<Product(id={self.id}, title={self.title[:30]}..., price={self.price})>"
