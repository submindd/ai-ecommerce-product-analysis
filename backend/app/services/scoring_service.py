"""
智能选品评分服务
基于多维度指标对商品进行综合评分，辅助选品决策

评分模型（4 个维度）：
  1. 销量得分    - 权重 30%：类目内归一化，销量越高得分越高
  2. 评分得分    - 权重 25%：基于 5 分制星级，直接归一化
  3. 评论得分    - 权重 20%：类目内归一化，评论越多社交验证越强
  4. 价格竞争力   - 权重 25%：类目内归一化，价格越低竞争力越强

综合得分 = Σ(维度得分 × 权重)，范围 0-100
"""

from dataclasses import dataclass, field
from typing import Optional

# ========== 评分维度权重配置 ==========
SCORING_WEIGHTS = {
    "sales": 0.30,     # 销量权重
    "rating": 0.25,    # 评分权重
    "reviews": 0.20,   # 评论数权重
    "price": 0.25,     # 价格竞争力权重
}

# ========== 评分等级阈值 ==========
SCORE_TIERS = [
    (80, "强烈推荐", "text-green-600", "bg-green-50"),
    (65, "值得考虑", "text-blue-600", "bg-blue-50"),
    (50, "一般", "text-yellow-600", "bg-yellow-50"),
    (0, "观望", "text-muted-foreground", "bg-muted"),
]


@dataclass
class DimensionScores:
    """各维度得分明细"""

    sales_score: float = 0.0      # 销量得分 0-100
    rating_score: float = 0.0     # 评分得分 0-100
    reviews_score: float = 0.0    # 评论得分 0-100
    price_score: float = 0.0      # 价格竞争力得分 0-100


@dataclass
class ProductScore:
    """商品综合评分结果"""

    product_id: int
    composite_score: float                    # 综合得分 0-100
    tier: str = "观望"                         # 评分等级（强烈推荐/值得考虑/一般/观望）
    tier_color: str = "text-muted-foreground" # 等级文字颜色
    tier_bg: str = "bg-muted"                  # 等级背景色
    dimensions: DimensionScores = field(default_factory=DimensionScores)


class ScoringService:
    """智能选品评分引擎"""

    def score_product(
        self,
        product: dict,
        category_products: list[dict],
    ) -> ProductScore:
        """
        对单个商品进行综合评分

        参数:
            product: 目标商品数据
            category_products: 同品类所有商品（用于归一化计算）
        """
        # 如果同品类商品数为 0，使用自身
        if not category_products:
            category_products = [product]

        # ========== 计算各类目统计值（用于归一化） ==========
        sales_list = [p["sales"] for p in category_products]
        reviews_list = [p["reviews"] for p in category_products]
        price_list = [p["price"] for p in category_products]

        min_sales, max_sales = min(sales_list), max(sales_list)
        min_reviews, max_reviews = min(reviews_list), max(reviews_list)
        min_price, max_price = min(price_list), max(price_list)

        # ========== 维度 1: 销量得分（越高越好） ==========
        sales_score = self._normalize_positive(
            product["sales"], min_sales, max_sales
        )

        # ========== 维度 2: 评分得分（越高越好，5 分制直接归一化） ==========
        rating_score = (product["rating"] / 5.0) * 100

        # ========== 维度 3: 评论数得分（越多越好，社交验证） ==========
        reviews_score = self._normalize_positive(
            product["reviews"], min_reviews, max_reviews
        )

        # ========== 维度 4: 价格竞争力得分（越低越好 = 竞争力越强） ==========
        price_score = self._normalize_negative(
            product["price"], min_price, max_price
        )

        # ========== 加权计算综合得分 ==========
        composite = (
            sales_score * SCORING_WEIGHTS["sales"]
            + rating_score * SCORING_WEIGHTS["rating"]
            + reviews_score * SCORING_WEIGHTS["reviews"]
            + price_score * SCORING_WEIGHTS["price"]
        )

        # 确定评分等级
        tier, tier_color, tier_bg = self._get_tier(composite)

        return ProductScore(
            product_id=product["id"],
            composite_score=round(composite, 1),
            tier=tier,
            tier_color=tier_color,
            tier_bg=tier_bg,
            dimensions=DimensionScores(
                sales_score=round(sales_score, 1),
                rating_score=round(rating_score, 1),
                reviews_score=round(reviews_score, 1),
                price_score=round(price_score, 1),
            ),
        )

    def score_all_products(
        self, products: list[dict]
    ) -> list[ProductScore]:
        """
        对所有商品进行评分

        商品按类目分组后，类目内进行归一化计算
        """
        # 按类目分组
        by_category: dict[str, list[dict]] = {}
        for p in products:
            category = p.get("category", "其他")
            if category not in by_category:
                by_category[category] = []
            by_category[category].append(p)

        # 为每个商品计算评分
        scores: list[ProductScore] = []
        for p in products:
            category = p.get("category", "其他")
            score = self.score_product(p, by_category.get(category, [p]))
            scores.append(score)

        # 按综合得分降序排列
        scores.sort(key=lambda s: s.composite_score, reverse=True)
        return scores

    def get_top_recommendations(
        self, products: list[dict], top_n: int = 10
    ) -> list[ProductScore]:
        """
        获取 Top N 推荐商品

        先评分，再按综合得分降序取前 N 个
        """
        scores = self.score_all_products(products)
        return scores[:top_n]

    def get_recommendations_by_category(
        self, products: list[dict], top_n: int = 5
    ) -> dict[str, list[ProductScore]]:
        """
        按类目分组获取推荐商品

        返回: {类目: [Top N 评分结果]}
        """
        by_category: dict[str, list[dict]] = {}
        for p in products:
            category = p.get("category", "其他")
            if category not in by_category:
                by_category[category] = []
            by_category[category].append(p)

        result: dict[str, list[ProductScore]] = {}
        for category, cat_products in by_category.items():
            scores = self.score_all_products(cat_products)
            result[category] = scores[:top_n]

        return result

    # ========== 私有工具方法 ==========

    @staticmethod
    def _normalize_positive(value: float, min_val: float, max_val: float) -> float:
        """
        正向归一化（值越大得分越高）

        公式: (value - min) / (max - min) * 100
        """
        if max_val == min_val:
            return 50.0  # 所有商品值相同时，给中等分
        return ((value - min_val) / (max_val - min_val)) * 100

    @staticmethod
    def _normalize_negative(value: float, min_val: float, max_val: float) -> float:
        """
        反向归一化（值越小得分越高，用于价格等指标）

        公式: (max - value) / (max - min) * 100
        """
        if max_val == min_val:
            return 50.0
        return ((max_val - value) / (max_val - min_val)) * 100

    @staticmethod
    def _get_tier(score: float) -> tuple[str, str, str]:
        """根据综合得分返回评分等级和样式"""
        for threshold, tier, color, bg in SCORE_TIERS:
            if score >= threshold:
                return tier, color, bg
        return "观望", "text-muted-foreground", "bg-muted"


# 全局评分服务单例
scoring_service = ScoringService()
