/**
 * API 请求客户端
 * 封装与后端 FastAPI 的通信逻辑
 */

import type { FullAnalysis } from "@/types/analysis";
import type {
  SalesTrend,
  RatingDistribution,
  CategoryAnalysis,
  ProfitAnalysis,
} from "@/types/dashboard";
import type { ProfitCalculateRequest, ProfitCalculateResponse } from "@/types/profit";
import type { ProductFullDetail } from "@/types/product-detail";
import type {
  Product,
  ProductListResponse,
  ProductQueryParams,
  ProductScore,
  ProductWithScore,
  RecommendationResponse,
} from "@/types/product";

/** 后端 API 基础地址 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/** API 版本前缀 */
const API_V1 = `${API_BASE_URL}/api/v1`;

/**
 * 通用请求封装
 * 兼容：网络错误、超时、空响应、非JSON、验证码页面、500错误
 */
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  // 超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    // 读取原始文本
    const text = await response.text();

    // 空响应
    if (!text || text.trim() === "") {
      console.warn(`[API] ${url} → 空响应`);
      throw new Error("服务器返回空响应");
    }

    // 非 JSON 响应（HTML 验证码页等）
    const trimmed = text.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      const preview = trimmed.slice(0, 150);
      console.error(`[API] ${url} → 非JSON响应: ${preview}`);
      throw new Error(`服务器返回非JSON数据 (${preview.slice(0, 80)}...)`);
    }

    // 解析 JSON
    let data: T;
    try {
      data = JSON.parse(trimmed);
    } catch {
      console.error(`[API] ${url} → JSON解析失败: ${trimmed.slice(0, 200)}`);
      throw new Error("服务器返回数据格式异常");
    }

    // HTTP 错误
    if (!response.ok) {
      const detail = (data as Record<string, unknown>)?.detail;
      const msg = typeof detail === "string"
        ? detail
        : JSON.stringify(detail || `HTTP ${response.status}`);
      console.error(`[API] ${url} → ${msg}`);
      // 不抛异常 — 返回数据让调用方自行处理
    }

    return data;

  } catch (err) {
    clearTimeout(timeoutId);
    // 网络错误 / 超时
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error(`[API] ${url} → 请求超时`);
      throw new Error("请求超时，请检查后端服务是否运行");
    }
    // fetch 本身失败（网络断开等）
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      console.error(`[API] ${url} → 无法连接服务器`);
      throw new Error("无法连接后端服务，请确认服务已启动");
    }
    // 已处理的错误直接抛出
    if (err instanceof Error) throw err;
    throw new Error(String(err));
  }
}

/**
 * 构建查询字符串
 * 过滤掉 undefined 和 null 的参数
 */
function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// ========== 商品相关 API ==========

/** 获取商品列表（调用统一 API: GET /api/products） */
export async function getProducts(
  params: ProductQueryParams = {},
  includeScore: boolean = true
): Promise<ProductListResponse> {
  const allParams = { ...params, include_score: includeScore };
  const queryString = buildQueryString(allParams as Record<string, unknown>);
  return fetchAPI<ProductListResponse>(`${API_BASE_URL}/api/products${queryString}`);
}

/** 获取商品详情 */
export async function getProductById(id: number): Promise<Product> {
  return fetchAPI<Product>(`${API_V1}/products/${id}`);
}

/** 获取所有商品类目 */
export async function getCategories(): Promise<string[]> {
  const data = await fetchAPI<{ categories: string[] }>(
    `${API_V1}/products/categories`
  );
  return data.categories;
}

/** 获取所有来源平台 */
export async function getPlatforms(): Promise<string[]> {
  const data = await fetchAPI<{ platforms: string[] }>(
    `${API_V1}/products/platforms`
  );
  return data.platforms;
}

/** 获取单商品完整分析报告（调用: GET /api/products/{id}） */
export async function getProductFullDetail(
  productId: number
): Promise<ProductFullDetail> {
  return fetchAPI<ProductFullDetail>(
    `${API_BASE_URL}/api/products/${productId}`
  );
}

// ========== Shopee 真实 API ==========

/** 获取 Shopee 商品列表（真实爬虫 + Mock 降级） */
export async function getShopeeProducts(
  keyword: string = "热销",
  count: number = 50
): Promise<{
  products: Product[];
  total: number;
  mode: "live" | "mock";
  stats: Record<string, number>;
}> {
  const queryString = buildQueryString({ keyword, count });
  return fetchAPI(`${API_V1}/shopee/products${queryString}`);
}

// ========== 利润计算 API ==========

/** 计算利润和 ROI */
export async function calculateProfit(
  data: ProfitCalculateRequest
): Promise<ProfitCalculateResponse> {
  return fetchAPI<ProfitCalculateResponse>(`${API_V1}/profit/calculate`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ========== 仪表盘图表数据 API ==========

/** 获取销量趋势数据 */
export async function getSalesTrend(): Promise<SalesTrend> {
  return fetchAPI<SalesTrend>(`${API_V1}/dashboard/sales-trend`);
}

/** 获取评分分布数据 */
export async function getRatingDistribution(): Promise<RatingDistribution> {
  return fetchAPI<RatingDistribution>(`${API_V1}/dashboard/rating-distribution`);
}

/** 获取类目分析数据 */
export async function getCategoryAnalysis(): Promise<CategoryAnalysis> {
  return fetchAPI<CategoryAnalysis>(`${API_V1}/dashboard/category-analysis`);
}

/** 获取利润分析数据 */
export async function getProfitAnalysis(): Promise<ProfitAnalysis> {
  return fetchAPI<ProfitAnalysis>(`${API_V1}/dashboard/profit-analysis`);
}

// ========== 评分相关 API ==========

/** 获取 Top N 推荐商品 */
export async function getTopRecommendations(
  n: number = 10
): Promise<RecommendationResponse> {
  return fetchAPI<RecommendationResponse>(
    `${API_V1}/scoring/top-recommendations?n=${n}`
  );
}

/** 获取单个商品评分详情 */
export async function getProductScore(productId: number): Promise<ProductScore> {
  return fetchAPI<ProductScore>(
    `${API_V1}/scoring/product/${productId}`
  );
}

/** 按类目获取推荐商品 */
export async function getRecommendationsByCategory(
  topN: number = 5
): Promise<Record<string, ProductWithScore[]>> {
  return fetchAPI<Record<string, ProductWithScore[]>>(
    `${API_V1}/scoring/by-category?top_n=${topN}`
  );
}

// ========== AI 分析相关 API ==========

/** 获取 AI 综合分析（标签+推荐理由+卖点+风险） */
export async function getFullAnalysis(
  productId: number
): Promise<FullAnalysis> {
  return fetchAPI<FullAnalysis>(
    `${API_V1}/analysis/${productId}/full`
  );
}
