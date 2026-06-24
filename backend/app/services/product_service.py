"""
商品业务逻辑服务层
使用 Mock 数据模拟数据库操作，后续可替换为真实数据库查询
"""

import json
import math
from pathlib import Path
from typing import Optional

from app.schemas.product import ProductListResponse, ProductQueryParams, ProductResponse

# ========== 加载 Mock 数据 ==========
_MOCK_DATA_PATH = Path(__file__).parent / "mock_products.json"


def _load_mock_data() -> list[dict]:
    """从 JSON 文件加载商品模拟数据"""
    with open(_MOCK_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# 模块加载时读取全部 Mock 数据到内存
_MOCK_PRODUCTS: list[dict] = _load_mock_data()


class ProductService:
    """商品业务逻辑服务（当前基于 Mock 数据）"""

    def get_product_list(
        self,
        params: ProductQueryParams,
        include_score: bool = False,
    ) -> ProductListResponse:
        """
        获取商品列表
        支持搜索、筛选、排序和分页

        参数:
            params: 查询参数
            include_score: 是否包含评分数据
        """
        products = list(_MOCK_PRODUCTS)  # 浅拷贝，避免修改原始数据

        # ========== 关键词搜索（匹配标题和类目） ==========
        if params.keyword:
            keyword_lower = params.keyword.lower()
            products = [
                p for p in products
                if keyword_lower in p["title"].lower()
                or keyword_lower in p["category"].lower()
            ]

        # ========== 按类目筛选 ==========
        if params.category:
            products = [
                p for p in products
                if p["category"] == params.category
            ]

        # ========== 按价格范围筛选 ==========
        if params.min_price is not None:
            products = [p for p in products if p["price"] >= params.min_price]
        if params.max_price is not None:
            products = [p for p in products if p["price"] <= params.max_price]

        # ========== 按最低评分筛选 ==========
        if params.min_rating is not None:
            products = [p for p in products if p["rating"] >= params.min_rating]

        # ========== 按平台筛选 ==========
        if params.platform:
            products = [
                p for p in products
                if p.get("platform", p.get("source_platform", "")) == params.platform
            ]

        # ========== 计算评分（如果需要） ==========
        score_map: dict[int, float] = {}
        tier_map: dict[int, str] = {}
        if include_score or params.sort_by == "score":
            from app.services.scoring_service import scoring_service
            all_scores = scoring_service.score_all_products(products)
            for s in all_scores:
                score_map[s.product_id] = s.composite_score
                tier_map[s.product_id] = s.tier

        # ========== 排序 ==========
        sort_field = params.sort_by or "created_at"
        reverse = params.sort_order == "desc"

        if sort_field == "score":
            products.sort(
                key=lambda x: score_map.get(x["id"], 0),
                reverse=reverse,
            )
        else:
            products.sort(
                key=lambda x: x.get(sort_field, 0) or 0,
                reverse=reverse,
            )

        # ========== 分页 ==========
        total = len(products)
        total_pages = math.ceil(total / params.page_size)
        start = (params.page - 1) * params.page_size
        end = start + params.page_size
        page_items = products[start:end]

        # 构建响应
        items = []
        for p in page_items:
            item = ProductResponse(**p)
            if include_score:
                item.composite_score = score_map.get(p["id"])
                item.score_tier = tier_map.get(p["id"])
            items.append(item)

        return ProductListResponse(
            items=items,
            total=total,
            page=params.page,
            page_size=params.page_size,
            total_pages=total_pages,
        )

    def get_product_by_id(self, product_id: int) -> Optional[ProductResponse]:
        """根据 ID 获取单个商品详情"""
        for p in _MOCK_PRODUCTS:
            if p["id"] == product_id:
                return ProductResponse(**p)
        return None

    def get_all_raw_products(self) -> list[dict]:
        """获取所有原始商品数据（评分服务使用）"""
        return list(_MOCK_PRODUCTS)

    def get_categories(self) -> list[str]:
        """获取所有类目列表"""
        return sorted({p["category"] for p in _MOCK_PRODUCTS})

    def get_platforms(self) -> list[str]:
        """获取所有平台列表（兼容新旧字段名）"""
        return sorted({
            p.get("platform", p.get("source_platform", ""))
            for p in _MOCK_PRODUCTS
            if p.get("platform") or p.get("source_platform")
        })


# 全局服务单例
product_service = ProductService()
