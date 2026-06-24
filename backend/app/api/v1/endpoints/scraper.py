"""
爬虫管理 API 端点
提供爬虫任务触发和状态查询功能
"""

from fastapi import APIRouter, BackgroundTasks, Query

from app.services.scraper import amazon_scraper

router = APIRouter()


# ========== 全局爬虫状态 ==========
_scraper_status = {
    "running": False,
    "keyword": "",
    "scraped": 0,
    "inserted": 0,
    "skipped": 0,
    "errors": 0,
}


@router.post("/run", summary="启动爬虫任务（Mock 模式）")
async def run_scraper(
    background_tasks: BackgroundTasks,
    keyword: str = Query(..., description="搜索关键词"),
    category: str = Query(..., description="商品类目"),
    count: int = Query(50, ge=10, le=200, description="抓取数量"),
):
    """
    启动 Mock 模式爬虫（后台异步执行）

    生成模拟商品数据并写入数据库，用于测试数据管道
    """
    if _scraper_status["running"]:
        return {"message": "爬虫任务正在运行中，请稍后再试", "status": _scraper_status}

    _scraper_status["running"] = True
    _scraper_status["keyword"] = keyword

    def run():
        try:
            count_inserted = amazon_scraper.scrape_mock_data(
                keyword=keyword, category=category, count=count
            )
            _scraper_status["scraped"] = amazon_scraper.stats["scraped"]
            _scraper_status["inserted"] = count_inserted
            _scraper_status["skipped"] = amazon_scraper.stats["skipped"]
            _scraper_status["errors"] = amazon_scraper.stats["errors"]
        finally:
            _scraper_status["running"] = False

    background_tasks.add_task(run)

    return {
        "message": f"爬虫任务已启动！关键词: {keyword}, 目标数量: {count}",
        "keyword": keyword,
        "category": category,
    }


@router.get("/status", summary="查询爬虫任务状态")
async def get_scraper_status():
    """获取当前爬虫任务的运行状态和统计"""
    return _scraper_status
