/**
 * AI 分析相关类型定义
 * 与后端 Pydantic Schema 保持一致
 */

/** 商品卖点 */
export interface SellingPoint {
  title: string;
  description: string;
  level: "强" | "中" | "弱";
}

/** 选品风险点 */
export interface Risk {
  title: string;
  description: string;
  level: "高" | "中" | "低";
}

/** AI 综合分析响应 */
export interface FullAnalysis {
  product_id: number;
  tags: string[];
  recommendation: string;
  selling_points: SellingPoint[];
  risks: Risk[];
}
