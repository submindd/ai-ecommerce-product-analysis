"""
AI 商品智能分析引擎（核心模块）
================================
调用 DeepSeek API，根据商品全维度数据自动生成结构化分析报告。

分析内容（10 个维度）：
  1. 商品优势
  2. 商品缺点
  3. 市场竞争程度
  4. 是否值得进入
  5. 适合的人群
  6. 风险提示
  7. 定价建议
  8. 利润建议
  9. 广告建议
  10. AI 推荐理由

缓存策略：
  - 分析结果存入 product_analysis.ai_analysis_json
  - 已缓存的商品直接返回，避免重复调用 API

注意：使用 Python 标准库 urllib（httpx/requests 在 Python 3.14 有 chunked encoding 兼容问题）
"""

import asyncio
import json
import re
import urllib.request
import urllib.error
from typing import Optional

from app.config import settings

# ========== DeepSeek API 配置 ==========
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_MODEL = "deepseek-chat"

# ========== 系统角色设定 ==========
SYSTEM_PROMPT = """你是一个顶级的跨境电商选品分析师，拥有 10 年 Amazon 运营经验。
你的分析精准、数据驱动、商业导向。

分析要求：
- 基于提供的数据事实分析，不编造信息
- 从卖家利润角度出发，关注 ROI 和市场竞争格局
- 语言简洁有力，每条 15-40 字
- 严格按 JSON 格式输出，不要输出任何其他内容
- 定价建议和利润建议要给出具体数字"""


# ========== 综合分析 Prompt 模板 ==========
FULL_ANALYSIS_PROMPT = """请对该商品进行全面分析：

【商品数据】
- 标题：{title}
- 类目：{category}
- 售价：${price}
- 原价：${original_price}
- 累计销量：{sales} 件
- 评分：{rating}/5（{reviews} 条评论）
- 店铺：{store}
- 利润率：{profit_margin}%
- ROI：{roi}%
- 类目均价：${category_avg_price}
- 价格区间：{price_tier}（低/中/高）
- 价格趋势：{price_trend}
- 入场建议：{entry_advice}
- 综合选品评分：{analysis_score}/100

请严格按以下 JSON 格式输出（不要输出 markdown 代码块，只输出纯 JSON）：

{{
  "advantages": ["优势1（15-30字）", "优势2", "优势3", "优势4"],
  "disadvantages": ["缺点1（15-30字）", "缺点2", "缺点3"],
  "competition": "激烈/中等/蓝海",
  "competition_detail": "市场竞争分析（30-50字）",
  "is_worth_entering": true/false,
  "worth_entering_reason": "是否值得进入的理由（30-50字）",
  "target_audience": ["适合人群1", "适合人群2", "适合人群3"],
  "risks": [
    {{"title": "风险1（10-20字）", "description": "描述（20-30字）", "level": "高/中/低"}},
    {{"title": "风险2", "description": "描述", "level": "中"}},
    {{"title": "风险3", "description": "描述", "level": "低"}}
  ],
  "pricing_advice": {{
    "current_rating": "偏高/合理/偏低",
    "suggested_range": "$XX.XX - $XX.XX",
    "detail": "定价建议说明（30-50字）"
  }},
  "profit_advice": {{
    "current_level": "优秀/良好/一般/需优化",
    "cost_optimization": "成本优化建议（20-30字）",
    "detail": "利润优化说明（30-50字）"
  }},
  "advertising_advice": {{
    "budget_suggestion": "建议日预算 $X - $X",
    "keywords_strategy": "关键词策略简析（20-30字）",
    "detail": "广告投放建议（30-50字）"
  }},
  "recommendation": "AI 综合推荐理由（60-100字）",
  "score": 0-100,
  "summary": "一句话总结（20-40字）"
}}"""


class AIAnalysisService:
    """AI 商品智能分析引擎"""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or settings.DEEPSEEK_API_KEY

    # ========== 核心方法：完整分析 ==========

    async def analyze(self, product_data: dict) -> dict:
        """
        对单商品执行完整 AI 分析（异步，使用线程池执行同步 urllib 请求）

        参数:
            product_data: 商品全维度数据
        返回:
            结构化分析结果 dict（10 个维度）
        """
        # 构建 Prompt
        prompt = FULL_ANALYSIS_PROMPT.format(
            title=product_data.get("title", ""),
            category=product_data.get("category", ""),
            price=product_data.get("price", 0),
            original_price=product_data.get("original_price") or "无",
            sales=product_data.get("sales", 0),
            rating=product_data.get("rating", 0),
            reviews=product_data.get("reviews", 0),
            store=product_data.get("store", ""),
            profit_margin=product_data.get("profit_margin", 0),
            roi=product_data.get("roi", 0),
            category_avg_price=product_data.get("category_avg_price", 0),
            price_tier=product_data.get("price_tier", "中"),
            price_trend=product_data.get("price_trend", "稳定"),
            entry_advice=product_data.get("entry_advice", "待评估"),
            analysis_score=product_data.get("analysis_score", 0),
        )

        # 在线程中调用同步 urllib（使用 asyncio.to_thread 避免阻塞）
        raw_response = await asyncio.to_thread(self._call_api_sync, prompt)
        parsed = self._extract_json(raw_response)

        # 容错：JSON 解析失败时返回降级结果
        if not parsed:
            return self._fallback_analysis(product_data)

        return parsed

    async def analyze_and_cache(self, product_id: int, product_data: dict) -> dict:
        """
        分析商品并缓存结果到数据库

        缓存逻辑：
          1. 先查 product_analysis 表是否有缓存
          2. 有缓存且未过期 → 直接返回
          3. 无缓存/已过期 → 调用 AI → 写入缓存 → 返回
        """
        # 检查缓存
        cached = await self._get_cached(product_id)
        if cached:
            return cached

        # 执行分析
        result = await self.analyze(product_data)

        # 写入缓存
        await self._save_cache(product_id, result)

        return result

    # ========== API 调用（使用标准库 urllib，避免 httpx 兼容问题） ==========

    def _call_api_sync(self, prompt: str, retries: int = 3) -> str:
        """同步调用 DeepSeek Chat API（含重试，递增等待）"""
        payload_data = {
            "model": DEEPSEEK_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.7,
            "max_tokens": 800,
            "stream": False,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json; charset=utf-8",
        }

        last_error = None
        for attempt in range(retries + 1):
            try:
                payload = json.dumps(payload_data).encode("utf-8")
                req = urllib.request.Request(DEEPSEEK_API_URL, data=payload, headers=headers, method="POST")
                with urllib.request.urlopen(req, timeout=120) as resp:
                    body = resp.read().decode("utf-8")
                    data = json.loads(body)
                    return data["choices"][0]["message"]["content"]
            except Exception as e:
                last_error = e
                if attempt < retries:
                    import time
                    wait = (attempt + 1) * 3  # 3s, 6s, 9s 递增
                    print(f"[AI] 请求失败，{wait}秒后重试 ({attempt + 1}/{retries}): {e}")
                    time.sleep(wait)

        print(f"[AI] 全部 {retries + 1} 次重试失败: {last_error}")
        raise last_error if last_error else Exception("AI API 调用失败")

    # ========== JSON 解析 ==========

    @staticmethod
    def _extract_json(text: str) -> Optional[dict]:
        """从 AI 返回文本中提取 JSON（兼容 markdown 代码块包裹）"""
        # 直接尝试解析
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # 从 markdown 代码块提取
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        # 匹配最外层花括号
        brace = re.search(r"\{[\s\S]*\}", text)
        if brace:
            try:
                return json.loads(brace.group(0))
            except json.JSONDecodeError:
                pass

        return None

    # ========== 数据库缓存 ==========

    async def _get_cached(self, product_id: int) -> Optional[dict]:
        """从数据库读取 AI 分析缓存"""
        try:
            from app.database import SyncSessionLocal
            from app.models.analysis import ProductAnalysis

            session = SyncSessionLocal()
            try:
                record = session.query(ProductAnalysis).filter(
                    ProductAnalysis.product_id == product_id
                ).first()
                if record and record.ai_analysis_json:
                    # 检查缓存时效（7 天内有效）
                    age_days = (__import__("datetime").datetime.now() - record.updated_at).days if record.updated_at else 999
                    if age_days < 7:
                        return record.ai_analysis_json
            finally:
                session.close()
        except Exception:
            pass
        return None

    async def _save_cache(self, product_id: int, result: dict) -> bool:
        """将 AI 分析结果写入数据库缓存"""
        try:
            from app.database import SyncSessionLocal
            from app.models.analysis import ProductAnalysis

            session = SyncSessionLocal()
            try:
                record = session.query(ProductAnalysis).filter(
                    ProductAnalysis.product_id == product_id
                ).first()

                if record:
                    record.ai_analysis_json = result
                else:
                    # 不存在则创建新记录
                    new_record = ProductAnalysis(
                        product_id=product_id,
                        ai_analysis_json=result,
                    )
                    session.add(new_record)

                session.commit()
                return True
            except Exception as e:
                session.rollback()
                print(f"[AI缓存] 写入失败: {e}")
                return False
            finally:
                session.close()
        except Exception:
            return False

    # ========== 降级方案 ==========

    @staticmethod
    def _fallback_analysis(data: dict) -> dict:
        """AI 不可用时的降级分析（基于规则）"""
        score = data.get("analysis_score", 50)
        margin = data.get("profit_margin", 0)
        return {
            "advantages": ["基于数据评分的自动分析"],
            "disadvantages": ["AI 详细分析暂不可用"],
            "competition": "待评估",
            "competition_detail": "请稍后重新请求 AI 分析",
            "is_worth_entering": score >= 50,
            "worth_entering_reason": f"综合评分 {score} 分，建议进一步评估",
            "target_audience": ["跨境电商卖家"],
            "risks": [{"title": "数据不足", "description": "AI 分析暂时不可用，请稍后重试", "level": "低"}],
            "pricing_advice": {
                "current_rating": "合理",
                "suggested_range": "N/A",
                "detail": "AI 分析暂不可用，建议稍后重试"
            },
            "profit_advice": {
                "current_level": "良好" if margin >= 20 else "一般",
                "cost_optimization": "AI 分析暂不可用",
                "detail": "请稍后重新请求 AI 分析"
            },
            "advertising_advice": {
                "budget_suggestion": "N/A",
                "keywords_strategy": "AI 分析暂不可用",
                "detail": "请稍后重新请求 AI 分析"
            },
            "recommendation": f"综合评分 {score}/100。AI 详细分析暂时不可用，请稍后重试。",
            "score": score,
            "summary": f"评分 {score} 分，AI 详细分析请稍后重试",
        }


# 全局单例
ai_analysis_service = AIAnalysisService()
