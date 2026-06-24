/**
 * AI 报告类型定义
 * 由 LLM 生成的商品分析报告
 */

/** AI 生成报告 */
export interface AIReport {
  productId: number;
  productName: string;
  marketSize: string;           // 市场容量描述
  profitMargin: string;         // 利润空间描述
  userDemand: string;           // 用户需求分析
  risks: string[];              // 风险列表
  recommendationScore: number;  // 推荐指数 0-100
  entryRecommendation: "强烈建议进入" | "建议进入" | "谨慎考虑" | "不建议进入";
  summary: string;              // 综合总结
  generatedAt: string;          // 生成时间
}

import type { MockProduct } from "./mock-product";

/** AI 报告生成请求参数 */
export interface AIReportRequest {
  productId: number;
  productName: string;
  category: string;
  sales: number;
  growthRate: number;
  competition: number;
  price: number;
  rating: number;
  platform: string;
}
