/**
 * 机会商品类型定义
 * 基于销量、增长率、竞争度计算机会指数
 */

import type { MockProduct } from "./mock-product";

/** 机会商品（扩展自 MockProduct + 机会指数） */
export interface OpportunityProduct extends MockProduct {
  opportunityScore: number; // 0-100 机会指数
  salesScore: number;       // 销量得分（归一化 0-100）
  growthScore: number;     // 增长率得分（归一化 0-100）
  competitionScore: number; // 竞争度得分（归一化 0-100）
}

/** 机会指数排序方式 */
export type OpportunitySortField = "opportunityScore" | "sales" | "growthRate" | "competition";
