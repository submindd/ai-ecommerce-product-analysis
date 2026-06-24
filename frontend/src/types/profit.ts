/**
 * 利润预测类型定义
 */

/** 利润计算请求 */
export interface ProfitCalculateRequest {
  product_cost: number;
  shipping: number;
  commission_rate: number;
  advertising_cost: number;
  selling_price: number;
}

/** 利润计算结果 */
export interface ProfitCalculateResponse {
  product_cost: number;
  shipping: number;
  commission_rate: number;
  advertising_cost: number;
  selling_price: number;
  commission_amount: number;
  total_cost: number;
  gross_profit: number;
  profit_margin: number;
  roi: number;
  break_even_price: number;
  suggested_price_20: number;
  suggested_price_30: number;
  suggested_price_40: number;
  profit_level: string;
  roi_level: string;
  is_profitable: boolean;
}
