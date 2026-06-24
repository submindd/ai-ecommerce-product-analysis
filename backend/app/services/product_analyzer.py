"""
单商品智能分析服务
====================
对单个商品执行完整的选品分析，包括：

  1. 智能选品评分（4 维度加权）
  2. 价格分析 JSON（折扣率、价格区间、建议售价）
  3. 利润分析 JSON（成本、利润率、ROI）

分析结果更新到数据库 products 表的：
  - analysis_score  (DECIMAL)
  - price_analysis  (JSON)
  - profit_analysis (JSON)
"""

import json
from dataclasses import dataclass, field
from typing import Optional

from sqlalchemy.orm import Session

from app.database import SyncSessionLocal
from app.models.product import Product
from app.services.scoring_service import ScoringService, DimensionScores


@dataclass
class PriceAnalysis:
    """价格分析结果"""
    original_price: Optional[float] = None   # 原价
    selling_price: float = 0.0              # 当前售价
    discount_rate: float = 0.0              # 折扣率（%）
    price_tier: str = "中"                   # 价格区间：低/中/高
    category_avg_price: float = 0.0          # 类目均价
    break_even_price: float = 0.0            # 盈亏平衡售价
    suggested_price_20: float = 0.0          # 建议售价（20%利润率）
    suggested_price_30: float = 0.0          # 建议售价（30%利润率）

    def to_dict(self) -> dict:
        return {
            "original_price": self.original_price,
            "selling_price": self.selling_price,
            "discount_rate": round(self.discount_rate, 1),
            "price_tier": self.price_tier,
            "category_avg_price": self.category_avg_price,
            "break_even_price": round(self.break_even_price, 2),
            "suggested_price_20": round(self.suggested_price_20, 2),
            "suggested_price_30": round(self.suggested_price_30, 2),
        }


@dataclass
class ProfitAnalysis:
    """利润分析结果"""
    product_cost: float = 0.0               # 商品成本
    shipping_fee: float = 0.0               # 运费
    commission_rate: float = 0.15            # 平台佣金率
    commission_amount: float = 0.0           # 佣金金额
    advertising_cost: float = 0.0            # 广告费
    total_cost: float = 0.0                 # 总成本
    gross_profit: float = 0.0               # 毛利润
    profit_margin: float = 0.0              # 利润率（%）
    roi: float = 0.0                        # 投资回报率（%）
    profit_level: str = "一般"               # 利润等级
    is_profitable: bool = False             # 是否盈利

    def to_dict(self) -> dict:
        return {
            "product_cost": self.product_cost,
            "shipping_fee": self.shipping_fee,
            "commission_rate": self.commission_rate,
            "commission_amount": round(self.commission_amount, 2),
            "advertising_cost": self.advertising_cost,
            "total_cost": round(self.total_cost, 2),
            "gross_profit": round(self.gross_profit, 2),
            "profit_margin": round(self.profit_margin, 1),
            "roi": round(self.roi, 1),
            "profit_level": self.profit_level,
            "is_profitable": self.is_profitable,
        }


class ProductAnalyzer:
    """
    单商品综合分析器

    使用示例：
        analyzer = ProductAnalyzer()
        result = analyzer.analyze_product(product, all_products, ad_cost=5.0)
        analyzer.save_to_db(product_id, result)
    """

    def __init__(self):
        self.scoring = ScoringService()

    def analyze_product(
        self,
        product: dict,
        all_products: list[dict],
        advertising_cost: float = 3.0,
    ) -> dict:
        """
        对单个商品执行完整分析

        参数：
            product: 目标商品数据（dict，需包含 products 表所有字段）
            all_products: 全量商品列表（用于类目内归一化评分）
            advertising_cost: 估算广告费用（美元/件，默认 $3）
        返回：
            {"analysis_score": float, "price_analysis": dict, "profit_analysis": dict}
        """
        price = product.get("price", 0)
        original_price = product.get("original_price")
        cost = product.get("cost") or round(price * 0.35, 2)
        shipping = product.get("shipping_fee", 0)
        commission_rate = product.get("commission_rate", 0.15)
        category = product.get("category", "未分类")

        # ========== 1. 智能选品评分 ==========
        cat_products = [p for p in all_products if p.get("category") == category]
        if not cat_products:
            cat_products = [product]  # 类目内无其他商品时使用自身

        score_result = self.scoring.score_product(product, cat_products)

        # ========== 2. 价格分析 ==========
        price_analysis = self._analyze_price(
            product=product,
            cat_products=cat_products,
            cost=cost,
            shipping=shipping,
            commission_rate=commission_rate,
        )

        # ========== 3. 利润分析 ==========
        profit_analysis = self._analyze_profit(
            price=price,
            cost=cost,
            shipping=shipping,
            commission_rate=commission_rate,
            advertising_cost=advertising_cost,
        )

        return {
            "analysis_score": score_result.composite_score,
            "price_analysis": price_analysis.to_dict(),
            "profit_analysis": profit_analysis.to_dict(),
        }

    def save_to_db(self, product_id: int, analysis_result: dict) -> bool:
        """
        将分析结果保存到数据库

        更新 products 表的三个字段：
          - analysis_score
          - price_analysis
          - profit_analysis
        """
        session = SyncSessionLocal()
        try:
            product = session.query(Product).filter(Product.id == product_id).first()
            if not product:
                print(f"[分析器] 商品 ID={product_id} 不存在")
                return False

            # 更新字段
            product.analysis_score = analysis_result["analysis_score"]
            product.price_analysis = analysis_result["price_analysis"]
            product.profit_analysis = analysis_result["profit_analysis"]

            session.commit()
            print(f"[分析器] 商品 ID={product_id} 分析结果已保存 "
                  f"(评分: {analysis_result['analysis_score']})")
            return True

        except Exception as e:
            session.rollback()
            print(f"[分析器] 保存失败: {e}")
            return False
        finally:
            session.close()

    def analyze_and_save(
        self,
        product: dict,
        all_products: list[dict],
        advertising_cost: float = 3.0,
    ) -> Optional[dict]:
        """
        分析并直接保存到数据库（便捷方法）
        """
        result = self.analyze_product(product, all_products, advertising_cost)
        success = self.save_to_db(product["id"], result)
        return result if success else None

    def batch_analyze(
        self,
        products: list[dict],
        advertising_cost: float = 3.0,
    ) -> dict:
        """
        批量分析所有商品并保存到数据库

        返回：{"total": int, "success": int, "failed": int}
        """
        stats = {"total": len(products), "success": 0, "failed": 0}

        print(f"[分析器] 开始批量分析 {len(products)} 个商品...")

        for i, product in enumerate(products):
            try:
                result = self.analyze_product(product, products, advertising_cost)
                if self.save_to_db(product["id"], result):
                    stats["success"] += 1
                else:
                    stats["failed"] += 1
            except Exception as e:
                print(f"[分析器] 商品 ID={product.get('id')} 分析异常: {e}")
                stats["failed"] += 1

            # 每 10 个输出一次进度
            if (i + 1) % 10 == 0:
                print(f"[分析器] 进度: {i + 1}/{len(products)}")

        print(f"[分析器] 批量分析完成: 成功 {stats['success']}, 失败 {stats['failed']}")
        return stats

    # ========== 私有分析方法 ==========

    def _analyze_price(
        self,
        product: dict,
        cat_products: list[dict],
        cost: float,
        shipping: float,
        commission_rate: float,
    ) -> PriceAnalysis:
        """生成价格分析数据"""
        price = product.get("price", 0)
        original_price = product.get("original_price")

        # ---- 折扣率 ----
        if original_price and original_price > 0:
            discount_rate = ((original_price - price) / original_price) * 100
        else:
            discount_rate = 0.0
            original_price = None

        # ---- 类目均价 ----
        cat_prices = [p.get("price", 0) for p in cat_products if p.get("price", 0) > 0]
        cat_avg = sum(cat_prices) / len(cat_prices) if cat_prices else price

        # ---- 价格区间判定 ----
        if price <= cat_avg * 0.7:
            price_tier = "低"
        elif price >= cat_avg * 1.3:
            price_tier = "高"
        else:
            price_tier = "中"

        # ---- 盈亏平衡售价 + 建议售价 ----
        base = cost + shipping  # 不含佣金的基础成本
        denom = 1 - commission_rate
        break_even = base / denom if denom > 0 else float("inf")

        def suggested(target_margin: float) -> float:
            d = 1 - commission_rate - target_margin
            return base / d if d > 0 else float("inf")

        return PriceAnalysis(
            original_price=original_price,
            selling_price=price,
            discount_rate=discount_rate,
            price_tier=price_tier,
            category_avg_price=round(cat_avg, 2),
            break_even_price=break_even if break_even != float("inf") else 0,
            suggested_price_20=suggested(0.20) if suggested(0.20) != float("inf") else 0,
            suggested_price_30=suggested(0.30) if suggested(0.30) != float("inf") else 0,
        )

    def _analyze_profit(
        self,
        price: float,
        cost: float,
        shipping: float,
        commission_rate: float,
        advertising_cost: float,
    ) -> ProfitAnalysis:
        """生成利润分析数据"""
        # 佣金金额
        commission_amount = price * commission_rate
        # 总成本 = 商品成本 + 运费 + 广告费 + 佣金
        total_cost = cost + shipping + advertising_cost + commission_amount
        # 毛利润
        gross_profit = price - total_cost
        # 利润率
        profit_margin = (gross_profit / price * 100) if price > 0 else 0
        # ROI
        roi = (gross_profit / total_cost * 100) if total_cost > 0 else 0
        # 利润等级
        profit_level = self._evaluate_profit(profit_margin)
        # 是否盈利
        is_profitable = gross_profit > 0

        return ProfitAnalysis(
            product_cost=cost,
            shipping_fee=shipping,
            commission_rate=commission_rate,
            commission_amount=commission_amount,
            advertising_cost=advertising_cost,
            total_cost=total_cost,
            gross_profit=gross_profit,
            profit_margin=profit_margin,
            roi=roi,
            profit_level=profit_level,
            is_profitable=is_profitable,
        )

    @staticmethod
    def _evaluate_profit(margin: float) -> str:
        """利润率等级评定"""
        if margin >= 35:
            return "优秀"
        elif margin >= 20:
            return "良好"
        elif margin > 0:
            return "一般"
        else:
            return "亏损"


# ========== 全局分析器单例 ==========
product_analyzer = ProductAnalyzer()
