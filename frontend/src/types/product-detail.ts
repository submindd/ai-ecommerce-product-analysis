/**
 * 单商品综合分析响应类型
 * 对应 GET /api/v1/product-detail/{id}
 */

export interface ProductBasic {
  id: number;
  title: string;
  image_url: string;
  price: number;
  original_price: number | null;
  store: string;
  category: string;
  sales: number;
  rating: number;
  reviews: number;
  publish_date: string;
}

export interface PriceHistory {
  months: string[];
  prices: number[];
  lowest: number;
  highest: number;
  current: number;
  trend: string;
  volatility: number;
}

export interface PriceAnalysis {
  original_price: number | null;
  current_price: number;
  discount_rate: number;
  price_tier: string;
  category_avg_price: number;
  category_price_range: [number, number];
  price_position_percentile: number;
  break_even_price: number;
  suggested_price_20: number;
  suggested_price_30: number;
  is_good_time_to_enter: boolean;
  competitiveness_score: number;
}

export interface ProfitAnalysis {
  product_cost: number;
  shipping_fee: number;
  commission_rate: number;
  commission_amount: number;
  advertising_cost: number;
  total_cost: number;
  gross_profit: number;
  profit_margin: number;
  roi: number;
  profit_level: string;
  is_profitable: boolean;
}

export interface ScoringDetail {
  composite_score: number;
  dimensions: {
    sales: number;
    rating: number;
    reviews: number;
    price: number;
  };
  tier: string;
}

export interface ReviewAnalysis {
  rating: number;
  reviews: number;
  quality_score: number;
  sentiment: string;
  rating_distribution: Record<string, number>;
}

export interface SalesTrend {
  months: string[];
  monthly_sales: number[];
}

export interface AIAnalysisDetail {
  tags: string[];
  recommendation: string;
  selling_points: { title: string; description: string; level: string }[];
  risks: { title: string; description: string; level: string }[];
}

export interface ProductFullDetail {
  basic: ProductBasic;
  price_history: PriceHistory;
  price_analysis: PriceAnalysis;
  profit_analysis: ProfitAnalysis;
  scoring: ScoringDetail;
  review_analysis: ReviewAnalysis;
  sales_trend: SalesTrend;
  ai_analysis: AIAnalysisDetail | null;
}
