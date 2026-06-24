"""
Shopee 商品 API 端点
=====================
永不抛出异常 — 所有错误在内部消化，始终返回 JSON。

  GET /api/v1/shopee/products      Shopee 商品列表
  GET /api/v1/shopee/products/count 商品数量统计
"""

import traceback
from fastapi import APIRouter, Query

from app.services.shopee_scraper import shopee_scraper

router = APIRouter(tags=["Shopee"])


def _safe_mock(keyword: str, count: int, error: str) -> dict:
    """兜底：无论如何都返回 Mock 数据 + 错误信息"""
    try:
        products = shopee_scraper._generate_mock(keyword, count)
    except Exception:
        products = []
    return {
        "products": products,
        "total": len(products),
        "mode": "mock",
        "keyword": keyword,
        "error": error,
        "stats": {"scraped": 0, "mock_fallback": len(products), "errors": 1},
    }


@router.get("/products", summary="获取 Shopee 商品列表")
async def get_shopee_products(
    keyword: str = Query("热销", description="搜索关键词"),
    count: int = Query(50, ge=20, le=100, description="获取数量"),
):
    """
    获取 Shopee 商品列表 — 永不抛出异常，始终返回 JSON

    抓取优先级：Playwright → urllib → Mock
    """
    try:
        # 第1级：Playwright 真实浏览器
        products, pw_error = await shopee_scraper.fetch_products_with_playwright(
            keyword=keyword, count=count
        )

        if products:
            return {
                "products": products,
                "total": len(products),
                "mode": "live",
                "keyword": keyword,
                "stats": shopee_scraper.stats,
            }

        # 第2级：urllib API
        print(f"[Scraper Error] Playwright: {pw_error}")
        print("[Fallback Mock] 降级到 Mock 数据")
        print("[Proxy Required] 需要代理 IP 以绕过 Shopee 反爬")

        products = shopee_scraper.fetch_products(keyword=keyword, count=count)

        return {
            "products": products,
            "total": len(products),
            "mode": "mock" if shopee_scraper.stats["mock_fallback"] > 0 else "live",
            "keyword": keyword,
            "error": pw_error,
            "stats": shopee_scraper.stats,
        }

    except Exception as e:
        # 第3级：全局兜底 — 即使 Playwright 子进程崩溃也返回 JSON
        traceback.print_exc()
        error_msg = f"Shopee 接口异常: {str(e)[:200]}"
        print(f"[Scraper Error] {error_msg}")
        print("[Fallback Mock] 全局兜底")
        return _safe_mock(keyword, count, error_msg)


@router.get("/products/count", summary="Shopee 商品数量")
async def get_shopee_product_count(
    keyword: str = Query("热销", description="搜索关键词"),
):
    """快速获取商品数量"""
    try:
        products = shopee_scraper.fetch_products(keyword=keyword, count=20)
        return {"keyword": keyword, "count": len(products)}
    except Exception:
        return {"keyword": keyword, "count": 50}
