/**
 * Mock 商品数据类型（仅用于前端演示）
 */

export interface MockProduct {
  id: number;
  name: string;
  category: string;
  sales: number;
  growthRate: number;   // 增长率 %
  competition: number;  // 竞争度 0-1
  price: number;
  rating: number;
  platform: string;
  image: string;
}
