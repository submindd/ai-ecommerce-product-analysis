/**
 * Mock AI 报告生成器
 * 在后端 LLM API 不可用时，使用规则引擎生成模拟报告
 */

import type { AIReport, AIReportRequest } from "@/types/ai-report";

/** 生成规则化的 Mock AI 报告 */
export function mockAiReport(req: AIReportRequest): AIReport {
  const now = new Date().toISOString();

  // 基于竞争度估算市场容量
  const marketSize = req.competition < 0.3
    ? "蓝海市场，竞争较少，处于上升期，预估全球市场规模在 $5-8 亿之间"
    : req.competition < 0.5
      ? "中等规模市场，有一定竞争但仍有空间，预估全球市场规模在 $10-20 亿之间"
      : "红海市场，竞争激烈，头部品牌占据主导，预估全球市场规模超 $50 亿";

  // 基于价格和销量估算利润
  const profitMargin = req.price > 50
    ? `毛利率约 45-60%，扣除平台佣金和物流后净利率约 20-35%，单件利润 $${(req.price * 0.25).toFixed(2)}-${(req.price * 0.35).toFixed(2)}`
    : req.price > 20
      ? `毛利率约 35-50%，扣除各项成本后净利率约 15-25%，单件利润 $${(req.price * 0.15).toFixed(2)}-${(req.price * 0.25).toFixed(2)}`
      : "毛利率约 30-40%，走量为主，需控制物流成本，建议捆绑销售提升客单价";

  // 基于增长率和评分估算用户需求
  const userDemand = req.growthRate > 50
    ? `需求爆发期，搜索量同比显著增长，社交媒体热度高，用户评价普遍正面（评分 ${req.rating}/5）`
    : req.growthRate > 20
      ? "稳定增长阶段，月度搜索量持续上升，用户复购率较好，评论内容以质量和使用体验为主"
      : "成熟期需求稳定，用户搜索量波动不大，需通过差异化功能和营销手段突围";

  // 风险列表
  const risks: string[] = [];
  if (req.competition > 0.6) risks.push("竞争激烈，同质化严重，价格战风险较高");
  if (req.competition < 0.6 && req.competition > 0.3) risks.push("中等竞争，需关注头部品牌动态");
  if (req.growthRate < 15) risks.push("市场增速放缓，需谨慎评估投入产出比");
  if (req.rating < 4.0) risks.push("现有产品评分偏低，需注意质量控制和用户反馈");
  if (req.price > 100) risks.push("定价偏高，需要强品牌背书或差异化功能支撑");
  risks.push("跨境物流和关税政策变动可能影响成本和时效");

  // 推荐指数计算
  let recScore = 0;
  recScore += Math.min(req.growthRate * 1.2, 40); // 增长率贡献 0-40
  recScore += (1 - req.competition) * 30;          // 低竞争贡献 0-30
  recScore += (req.rating / 5) * 20;               // 评分贡献 0-20
  recScore += req.price > 30 ? 10 : 5;             // 价格贡献 5-10
  recScore = Math.round(Math.min(recScore, 100));

  const entryRecommendation = recScore >= 75
    ? "强烈建议进入"
    : recScore >= 55
      ? "建议进入"
      : recScore >= 35
        ? "谨慎考虑"
        : "不建议进入";

  // 综合总结
  const summary = req.competition < 0.4 && req.growthRate > 40
    ? "该商品处于蓝海高增长阶段，竞争压力小且市场需求旺盛，建议尽快入场抢占领先优势。"
    : req.competition < 0.6 && req.growthRate > 20
      ? "该商品市场表现良好，有一定的增长空间和合理的竞争格局，建议差异化切入。"
      : "该商品市场竞争较为激烈，建议深入分析目标细分市场，找到差异化突破点后再入场。";

  return {
    productId: req.productId,
    productName: req.productName,
    marketSize,
    profitMargin,
    userDemand,
    risks,
    recommendationScore: recScore,
    entryRecommendation,
    summary,
    generatedAt: now,
  };
}
