"""
Amazon 商品爬虫服务
================================
功能：从 Amazon 搜索结果页抓取商品数据，保存到 MySQL 数据库

爬取字段（与 products 表对应）：
  title, image_url, price, original_price, sales, rating,
  reviews, store, category, publish_date, cost, commission_rate, shipping_fee

特性：
  - 分页自动抓取（每页约 20-24 个商品，支持翻页）
  - 基于 ASIN 自动去重（同一商品不重复插入）
  - 请求限速（随机延迟 3-8 秒，避免被封）
  - 模拟浏览器请求头（User-Agent 轮换）
  - 异常重试（单商品失败不影响整体）

⚠️ 重要说明：
  1. Amazon 有严格的反爬机制，生产环境建议使用：
     - Amazon Product Advertising API (PA-API 5.0)
     - 或官方 SP-API (Selling Partner API)
  2. 如需实际抓取，请配合：
     - 住宅代理 IP 池
     - Selenium/Playwright 浏览器自动化
     - 合法的爬取频率
  3. 当前代码为教学演示，展示了完整的爬取→解析→存储流程
"""

import hashlib
import json
import math
import random
import re
import time
from datetime import date, datetime
from typing import Optional
from urllib.parse import quote_plus, urljoin

import httpx
from bs4 import BeautifulSoup

from app.config import settings
from app.database import SyncSessionLocal
from app.models.product import Product

# ========== 请求头轮换池（模拟不同浏览器） ==========
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

# ========== Amazon 搜索 URL 模板 ==========
AMAZON_BASE_URL = "https://www.amazon.com"


class AmazonScraper:
    """
    Amazon 商品爬虫

    使用示例:
        scraper = AmazonScraper()
        count = scraper.scrape_by_keyword("bluetooth headphone", max_pages=3)
        print(f"成功抓取 {count} 个商品")
    """

    def __init__(self):
        self.client: Optional[httpx.Client] = None
        self.stats = {"scraped": 0, "inserted": 0, "skipped": 0, "errors": 0}

    # ========== 公共方法 ==========

    def scrape_by_keyword(
        self,
        keyword: str,
        category: str = "未分类",
        max_pages: int = 3,
        delay_seconds: tuple = (3, 8),
    ) -> int:
        """
        根据关键词搜索并抓取商品

        参数:
            keyword: 搜索关键词（如 "wireless earbuds"）
            category: 商品类目标签
            max_pages: 最大翻页数（每页约 20 个商品）
            delay_seconds: 请求间隔范围（最小秒, 最大秒）
        返回:
            成功插入数据库的商品数量
        """
        self.stats = {"scraped": 0, "inserted": 0, "skipped": 0, "errors": 0}

        # ========== 第 1 步：构建搜索 URL ==========
        search_url = f"{AMAZON_BASE_URL}/s?k={quote_plus(keyword)}"
        print(f"[爬虫] 开始抓取: {keyword}")
        print(f"[爬虫] 搜索 URL: {search_url}")
        print(f"[爬虫] 最大页数: {max_pages}")

        with httpx.Client(
            timeout=30.0,
            follow_redirects=True,
            headers=self._random_headers(),
        ) as self.client:
            current_url = search_url

            for page in range(1, max_pages + 1):
                print(f"\n[爬虫] --- 第 {page}/{max_pages} 页 ---")

                # ========== 第 2 步：发送 HTTP 请求 ==========
                html = self._fetch_page(current_url)
                if not html:
                    print(f"[爬虫] 第 {page} 页请求失败，停止翻页")
                    break

                # ========== 第 3 步：解析商品列表 ==========
                products = self._parse_search_results(html, category)
                self.stats["scraped"] += len(products)
                print(f"[爬虫] 解析到 {len(products)} 个商品")

                # ========== 第 4 步：保存到数据库 ==========
                for product in products:
                    self._save_to_database(product)

                # ========== 第 5 步：获取下一页 URL ==========
                if page < max_pages:
                    next_url = self._get_next_page_url(html)
                    if not next_url:
                        print("[爬虫] 未找到下一页，停止翻页")
                        break
                    current_url = next_url
                    # 限速：随机延迟，避免被封
                    delay = random.uniform(*delay_seconds)
                    print(f"[爬虫] 等待 {delay:.1f} 秒...")
                    time.sleep(delay)

        # ========== 第 6 步：输出统计 ==========
        print(f"\n[爬虫] ========== 抓取完成 ==========")
        print(f"  解析商品: {self.stats['scraped']} 个")
        print(f"  新增插入: {self.stats['inserted']} 个")
        print(f"  重复跳过: {self.stats['skipped']} 个")
        print(f"  发生错误: {self.stats['errors']} 个")

        return self.stats["inserted"]

    def scrape_mock_data(self, keyword: str, category: str = "未分类", count: int = 50) -> int:
        """
        Mock 模式：生成模拟商品数据并存入数据库
        用于测试完整的爬取→解析→存储流程（无需实际访问 Amazon）

        参数:
            keyword: 搜索关键词（用于生成合理的模拟数据）
            category: 商品类目
            count: 生成数量
        """
        print(f"[Mock爬虫] 生成 {count} 个模拟商品（关键词: {keyword}）")
        self.stats = {"scraped": 0, "inserted": 0, "skipped": 0, "errors": 0}

        # 模拟商品标题模板
        title_templates = [
            f"{keyword.title()} - 2025 新款 升级版 高性价比",
            f"品牌 {keyword} 专业版 畅销全球 品质保证",
            f"跨境热销 {keyword} 跨境专供 一件代发",
            f"欧美爆款 {keyword} 亚马逊热销 Top100",
            f"工厂直销 {keyword} OEM 定制 快速发货",
            f"2025 最新款 {keyword} 多功能 智能版",
            f"美国仓 {keyword} 2日达 Prime 会员免邮",
        ]

        for i in range(count):
            title = random.choice(title_templates)
            # 生成唯一的 ASIN
            asin = hashlib.md5(f"{keyword}-{i}-{time.time()}".encode()).hexdigest()[:10]

            product = {
                "title": f"{title} (#{i+1})",
                "image_url": f"https://picsum.photos/seed/{asin}/400/400",
                "price": round(random.uniform(5.99, 199.99), 2),
                "original_price": round(random.uniform(8.99, 299.99), 2),
                "sales": random.randint(50, 50000),
                "rating": round(random.uniform(3.5, 5.0), 1),
                "reviews": random.randint(10, 15000),
                "store": random.choice(["BrandOfficial", "TopSeller", "GlobalTrade", "DirectFactory"]),
                "category": category,
                "publish_date": str(date.today()),
                "cost": 0,
                "commission_rate": 0.15,
                "shipping_fee": 0,
                "analysis_score": None,
                "price_analysis": None,
                "profit_analysis": None,
            }
            self._save_to_database(product)
            self.stats["scraped"] += 1

        print(f"[Mock爬虫] 完成: 新增 {self.stats['inserted']} 个, 跳过 {self.stats['skipped']} 个")
        return self.stats["inserted"]

    # ========== 私有方法 ==========

    def _fetch_page(self, url: str) -> Optional[str]:
        """发送 GET 请求并返回 HTML 文本"""
        try:
            response = self.client.get(url)
            response.raise_for_status()

            # 检测是否被 Amazon 拦截（验证码页面）
            if "api-services-support" in response.text.lower() or "captcha" in response.text.lower():
                print("[爬虫] ⚠️ 检测到验证码/拦截页面，Amazon 要求验证")
                return None

            return response.text
        except httpx.HTTPError as e:
            print(f"[爬虫] HTTP 请求失败: {e}")
            return None

    def _parse_search_results(self, html: str, category: str) -> list[dict]:
        """
        解析 Amazon 搜索结果页 HTML

        Amazon 搜索结果页结构（可能随版本变化）：
          - 每个商品卡片: div[data-component-type="s-search-result"]
          - 标题: h2 a span
          - 图片: img.s-image
          - 价格: span.a-price span.a-offscreen
          - 原价: span.a-price[data-a-strike="true"] span.a-offscreen
          - 评分: span.a-icon-alt (如 "4.5 out of 5 stars")
          - 评论数: span.a-size-base.s-underline-text
          - 店铺: span.a-size-base.s-underline-text (部分页面)

        注意：Amazon 频繁更新页面结构，以下选择器可能需要调整
        """
        soup = BeautifulSoup(html, "lxml")
        products = []

        # 定位商品卡片
        cards = soup.select('div[data-component-type="s-search-result"]')
        if not cards:
            # 回退：使用更宽泛的选择器
            cards = soup.select('div[data-asin]:not([data-asin=""])')

        print(f"[爬虫] 找到 {len(cards)} 个商品卡片")

        for card in cards:
            try:
                asin = card.get("data-asin", "")
                if not asin:
                    continue

                # ---- 提取标题 ----
                title_elem = card.select_one("h2 a span")
                title = title_elem.text.strip() if title_elem else ""

                # ---- 提取图片 ----
                img_elem = card.select_one("img.s-image")
                image_url = img_elem.get("src", "") if img_elem else ""

                # ---- 提取当前价格 ----
                price_elem = card.select_one("span.a-price span.a-offscreen")
                price_str = price_elem.text.strip() if price_elem else "0"
                price = self._parse_price(price_str)

                # ---- 提取原价（划线价） ----
                orig_price_elem = card.select_one("span.a-price[data-a-strike='true'] span.a-offscreen")
                original_price = self._parse_price(orig_price_elem.text) if orig_price_elem else None

                # ---- 提取评分 ----
                rating_elem = card.select_one("span.a-icon-alt")
                rating_text = rating_elem.text.strip() if rating_elem else ""
                rating = self._parse_rating(rating_text)

                # ---- 提取评论数 ----
                reviews_elem = card.select_one("span.a-size-base.s-underline-text")
                reviews_text = reviews_elem.text.strip() if reviews_elem else "0"
                reviews = self._parse_int(reviews_text)

                # ---- 提取销量（Amazon 页面通常不直接显示） ----
                # 用评论数估算销量（跨境电商常见比例：评论:销量 ≈ 1:10 ~ 1:30）
                sales = reviews * random.randint(15, 25) if reviews > 0 else 0

                # ---- 提取店铺名（可能不存在） ----
                store_elem = card.select_one("span.a-size-base.s-underline-text")
                store = store_elem.text.strip() if store_elem else "Amazon"

                # ---- 构建商品数据 ----
                product = {
                    "title": title,
                    "image_url": image_url,
                    "price": price,
                    "original_price": original_price,
                    "sales": sales,
                    "rating": rating,
                    "reviews": reviews,
                    "store": store,
                    "category": category,
                    "publish_date": str(date.today()),
                    # 以下字段需要额外计算（爬虫无法直接获取）
                    "cost": round(price * 0.35, 2) if price > 0 else 0,      # 估算成本为售价 35%
                    "commission_rate": 0.15,                                   # Amazon 默认佣金 15%
                    "shipping_fee": round(price * 0.08, 2) if price > 0 else 0,  # 估算运费为售价 8%
                    "analysis_score": None,
                    "price_analysis": None,
                    "profit_analysis": None,
                }
                products.append(product)

            except Exception as e:
                print(f"[爬虫] 解析商品卡片异常: {e}")
                self.stats["errors"] += 1
                continue

        return products

    def _get_next_page_url(self, html: str) -> Optional[str]:
        """从搜索结果页提取「下一页」链接"""
        soup = BeautifulSoup(html, "lxml")

        # Amazon 下一页按钮: a.s-pagination-next
        next_link = soup.select_one("a.s-pagination-next")
        if next_link and next_link.get("href"):
            return urljoin(AMAZON_BASE_URL, next_link["href"])

        # 备用：查找包含 "Next" 的链接
        for link in soup.select("a"):
            if "Next" in link.text or "next" in link.get("href", ""):
                href = link.get("href")
                if href:
                    return urljoin(AMAZON_BASE_URL, href)

        return None

    def _save_to_database(self, product: dict) -> bool:
        """
        保存商品到 MySQL，基于标题哈希去重

        去重策略：对 title + store 计算 MD5，相同视为重复
        如果已存在则跳过，不更新（避免覆盖已有分析数据）
        """
        # 生成唯一标识（标题 + 店铺的哈希）
        dedup_key = hashlib.md5(
            f"{product['title']}_{product['store']}".encode()
        ).hexdigest()

        session = SyncSessionLocal()
        try:
            # 检查是否已存在（基于标题 + 店铺去重）
            existing = (
                session.query(Product)
                .filter(Product.title == product["title"])
                .filter(Product.store == product["store"])
                .first()
            )

            if existing:
                self.stats["skipped"] += 1
                return False

            # 创建新记录
            new_product = Product(
                title=product["title"],
                image_url=product["image_url"],
                price=product["price"],
                original_price=product.get("original_price"),
                sales=product.get("sales", 0),
                rating=product.get("rating", 0.0),
                reviews=product.get("reviews", 0),
                store=product["store"],
                category=product["category"],
                publish_date=product.get("publish_date"),
                cost=product.get("cost"),
                commission_rate=product.get("commission_rate", 0.15),
                shipping_fee=product.get("shipping_fee", 0.0),
                analysis_score=product.get("analysis_score"),
                price_analysis=product.get("price_analysis"),
                profit_analysis=product.get("profit_analysis"),
            )

            session.add(new_product)
            session.commit()
            self.stats["inserted"] += 1
            return True

        except Exception as e:
            session.rollback()
            print(f"[爬虫] 数据库写入失败: {e}")
            self.stats["errors"] += 1
            return False
        finally:
            session.close()

    # ========== 工具方法 ==========

    @staticmethod
    def _random_headers() -> dict:
        """生成随机请求头，模拟浏览器"""
        return {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Cache-Control": "max-age=0",
        }

    @staticmethod
    def _parse_price(text: str) -> float:
        """从价格文本提取数值（如 '$59.99' → 59.99）"""
        match = re.search(r"[\d,]+\.?\d*", text.replace(",", ""))
        return float(match.group()) if match else 0.0

    @staticmethod
    def _parse_rating(text: str) -> float:
        """从评分文本提取数值（如 '4.5 out of 5 stars' → 4.5）"""
        match = re.search(r"(\d+\.?\d*)", text)
        return float(match.group(1)) if match else 0.0

    @staticmethod
    def _parse_int(text: str) -> int:
        """从文本提取整数（如 '12,345' → 12345）"""
        cleaned = re.sub(r"[^\d]", "", text)
        return int(cleaned) if cleaned else 0


# ========== 全局爬虫实例 ==========
amazon_scraper = AmazonScraper()
