"""
AI 分析服务
基于 DeepSeek API 提供商品智能分析能力

支持的分析类型：
  1. 商品标签生成   - 自动生成多维度商品标签
  2. 推荐理由生成   - AI 撰写选品推荐理由
  3. 卖点分析       - 识别商品核心卖点和竞争力
  4. 风险提示       - 分析潜在选品风险
  5. 综合分析       - 一次性返回全部分析结果
"""

import json
import re
from typing import Optional

import httpx

from app.config import settings
from app.services.prompt_templates import (
    FULL_ANALYSIS_PROMPT,
    RECOMMENDATION_PROMPT,
    RISK_ANALYSIS_PROMPT,
    SELLING_POINTS_PROMPT,
    SYSTEM_PROMPT,
    TAG_GENERATION_PROMPT,
)

# ========== DeepSeek API 配置 ==========
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_MODEL = "deepseek-chat"


class AIService:
    """DeepSeek AI 分析服务封装"""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or settings.DEEPSEEK_API_KEY
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        """获取或创建异步 HTTP 客户端"""
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=60.0)
        return self._client

    async def close(self):
        """关闭 HTTP 客户端"""
        if self._client:
            await self._client.aclose()
            self._client = None

    # ========== 核心 API 调用 ==========

    async def _chat_completion(
        self,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        """
        调用 DeepSeek Chat API

        参数:
            user_prompt: 用户提示词
            temperature: 生成温度（0-1，越高越随机）
            max_tokens: 最大输出 token 数
        返回:
            AI 生成的文本内容
        """
        client = await self._get_client()

        payload = {
            "model": DEEPSEEK_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        response = await client.post(DEEPSEEK_API_URL, json=payload, headers=headers)
        response.raise_for_status()

        data = response.json()
        return data["choices"][0]["message"]["content"]

    @staticmethod
    def _extract_json(text: str) -> dict:
        """
        从 AI 返回的文本中提取 JSON 对象
        兼容 AI 偶尔在 JSON 外包裹 markdown 代码块的情况
        """
        # 尝试直接解析
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # 尝试从 markdown 代码块中提取
        json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        # 尝试匹配最外层花括号
        brace_match = re.search(r"\{[\s\S]*\}", text)
        if brace_match:
            try:
                return json.loads(brace_match.group(0))
            except json.JSONDecodeError:
                pass

        # 返回空字典作为降级
        return {}

    # ========== 分析方法 ==========

    async def generate_tags(self, product: dict) -> dict:
        """AI 生成商品标签"""
        prompt = TAG_GENERATION_PROMPT.format(
            title=product.get("title", ""),
            category=product.get("category", ""),
            price=product.get("price", 0),
            rating=product.get("rating", 0),
            reviews=product.get("reviews", 0),
            sales=product.get("sales", 0),
            platform=product.get("source_platform", ""),
        )
        result = await self._chat_completion(prompt, temperature=0.7, max_tokens=256)
        return self._extract_json(result)

    async def generate_recommendation(self, product: dict) -> dict:
        """AI 生成推荐理由"""
        prompt = RECOMMENDATION_PROMPT.format(
            title=product.get("title", ""),
            category=product.get("category", ""),
            price=product.get("price", 0),
            rating=product.get("rating", 0),
            reviews=product.get("reviews", 0),
            sales=product.get("sales", 0),
            platform=product.get("source_platform", ""),
            shop_name=product.get("store", ""),
        )
        result = await self._chat_completion(prompt, temperature=0.8, max_tokens=300)
        return self._extract_json(result)

    async def analyze_selling_points(self, product: dict) -> dict:
        """AI 分析商品卖点"""
        prompt = SELLING_POINTS_PROMPT.format(
            title=product.get("title", ""),
            category=product.get("category", ""),
            price=product.get("price", 0),
            rating=product.get("rating", 0),
            reviews=product.get("reviews", 0),
            sales=product.get("sales", 0),
            platform=product.get("source_platform", ""),
            description=product.get("description", ""),
        )
        result = await self._chat_completion(prompt, temperature=0.7, max_tokens=512)
        return self._extract_json(result)

    async def analyze_risks(self, product: dict) -> dict:
        """AI 分析选品风险"""
        prompt = RISK_ANALYSIS_PROMPT.format(
            title=product.get("title", ""),
            category=product.get("category", ""),
            price=product.get("price", 0),
            rating=product.get("rating", 0),
            reviews=product.get("reviews", 0),
            sales=product.get("sales", 0),
            platform=product.get("source_platform", ""),
        )
        result = await self._chat_completion(prompt, temperature=0.6, max_tokens=512)
        return self._extract_json(result)

    async def full_analysis(self, product: dict) -> dict:
        """AI 综合分析（一次性获取所有分析结果）"""
        prompt = FULL_ANALYSIS_PROMPT.format(
            title=product.get("title", ""),
            category=product.get("category", ""),
            price=product.get("price", 0),
            rating=product.get("rating", 0),
            reviews=product.get("reviews", 0),
            sales=product.get("sales", 0),
            platform=product.get("source_platform", ""),
            shop_name=product.get("store", ""),
            description=product.get("description", ""),
        )
        result = await self._chat_completion(prompt, temperature=0.7, max_tokens=1024)
        return self._extract_json(result)


# 全局 AI 服务单例
ai_service = AIService()
