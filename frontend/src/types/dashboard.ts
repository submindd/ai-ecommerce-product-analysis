/**
 * 仪表盘数据类型定义
 * 与后端 Pydantic Schema 保持一致
 */

/** 销量趋势 */
export interface SalesTrend {
  months: string[];
  sales: number[];
  growth_rates: (number | null)[];
}

/** 评分分布 */
export interface RatingDistribution {
  labels: string[];
  counts: number[];
}

/** 类目分析 */
export interface CategoryAnalysis {
  categories: string[];
  counts: number[];
  avg_prices: number[];
  avg_ratings: number[];
  total_sales: number[];
  colors: string[];
}

/** 利润分析 */
export interface ProfitAnalysis {
  categories: string[];
  revenues: number[];
  costs: number[];
  profits: number[];
  profit_margins: number[];
  colors: string[];
}
