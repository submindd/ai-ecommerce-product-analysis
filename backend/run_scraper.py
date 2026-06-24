"""
Amazon 商品爬虫 - 命令行入口
============================

用法（Mock 模式，推荐用于测试）：
  python run_scraper.py --mock --keyword "wireless earbuds" --category "电子产品" --count 50

用法（真实模式，需要代理/浏览器）：
  python run_scraper.py --keyword "bluetooth speaker" --category "电子产品" --pages 3

参数说明：
  --keyword   搜索关键词（必填）
  --category  商品类目（必填）
  --pages     最大翻页数（真实模式，默认 3）
  --count     Mock 模式生成数量（默认 50）
  --mock      使用 Mock 模式（生成模拟数据，无需联网）
  --delay-min 请求最小间隔秒数（默认 3）
  --delay-max 请求最大间隔秒数（默认 8）
"""

import argparse
import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(__file__))

from app.services.scraper import amazon_scraper


def main():
    parser = argparse.ArgumentParser(
        description="Amazon 商品爬虫 - AI 跨境电商智能选品分析平台",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用示例:
  # Mock 模式（生成模拟数据，测试流程）
  python run_scraper.py --mock --keyword "蓝牙耳机" --category "电子产品" --count 50

  # 真实模式（需要确保网络可访问 Amazon）
  python run_scraper.py --keyword "yoga pants" --category "运动户外" --pages 2
        """,
    )

    parser.add_argument("--keyword", type=str, required=True, help="搜索关键词")
    parser.add_argument("--category", type=str, required=True, help="商品类目")
    parser.add_argument("--pages", type=int, default=3, help="最大翻页数（默认 3）")
    parser.add_argument("--count", type=int, default=50, help="Mock 模式生成数量（默认 50）")
    parser.add_argument("--mock", action="store_true", help="使用 Mock 模式")
    parser.add_argument("--delay-min", type=float, default=3, help="请求最小间隔（秒）")
    parser.add_argument("--delay-max", type=float, default=8, help="请求最大间隔（秒）")

    args = parser.parse_args()

    print("=" * 60)
    print("  AI 跨境电商智能选品分析平台 - Amazon 商品爬虫")
    print("=" * 60)

    if args.mock:
        # ========== Mock 模式 ==========
        count = amazon_scraper.scrape_mock_data(
            keyword=args.keyword,
            category=args.category,
            count=args.count,
        )
        print(f"\n✅ Mock 模式完成！成功插入 {count} 个商品到数据库")
    else:
        # ========== 真实模式 ==========
        print("\n⚠️  真实模式需要 Amazon 可访问（建议使用代理/VPN）")
        confirm = input("确认开始抓取？(y/N): ")
        if confirm.lower() != "y":
            print("已取消")
            return

        count = amazon_scraper.scrape_by_keyword(
            keyword=args.keyword,
            category=args.category,
            max_pages=args.pages,
            delay_seconds=(args.delay_min, args.delay_max),
        )
        print(f"\n✅ 抓取完成！成功插入 {count} 个商品到数据库")


if __name__ == "__main__":
    main()
