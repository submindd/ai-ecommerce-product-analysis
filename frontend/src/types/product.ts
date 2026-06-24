/**
 * 商品数据类型定义
 * 与后端 Pydantic Schema 保持一致
 */

/** 商品基础信息 */
export interface Product {
  id: number;
  title: string;
  image_url: string;
  price: number;
  original_price?: number | null;
  sales: number;
  rating: number;
  reviews: number;
  store: string;
  category: string;
  platform?: string;
  description?: string | null;
  publish_date?: string | null;
  cost?: number | null;
  shipping_fee?: number;
  commission_rate?: number;
  created_at: string;
  updated_at: string | null;
  // 评分字段（由后端 include_score=true 时附带）
  composite_score?: number | null;
  score_tier?: string | null;
  // JSON 分析字段
  price_analysis?: Record<string, unknown> | null;
  profit_analysis?: Record<string, unknown> | null;
}

/** 分页商品列表响应 */
export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/** 商品查询参数 */
export interface ProductQueryParams {
  keyword?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  platform?: string;
  sort_by?: "price" | "sales" | "rating" | "reviews" | "created_at" | "score";
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

/** 排序选项 */
export interface SortOption {
  label: string;
  field: "price" | "sales" | "rating" | "reviews" | "created_at" | "score";
  order: "asc" | "desc";
}

// ========== 评分相关类型 ==========

/** 各维度评分明细 */
export interface DimensionScores {
  sales_score: number;
  rating_score: number;
  reviews_score: number;
  price_score: number;
}

/** 商品综合评分 */
export interface ProductScore {
  product_id: number;
  composite_score: number;
  tier: string;
  dimensions: DimensionScores;
}

/** 带评分的商品信息 */
export interface ProductWithScore {
  product_id: number;
  title: string;
  image_url: string;
  price: number;
  sales: number;
  rating: number;
  reviews: number;
  store: string;
  category: string;
  composite_score: number;
  tier: string;
  dimensions: DimensionScores;
}

/** 推荐列表响应 */
export interface RecommendationResponse {
  recommendations: ProductWithScore[];
  total_scored: number;
}
