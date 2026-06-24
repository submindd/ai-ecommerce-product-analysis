"use client";

/**
 * 机会挖掘页面
 * 根据销量、增长率、竞争度计算机会指数并排序展示
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Target, TrendingUp, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/components/ui/score-badge";
import productsData from "@/data/products.json";
import type { MockProduct } from "@/types/mock-product";

const products = productsData as MockProduct[];

/** 计算机会指数：归一化销量×0.4 + 归一化增长率×0.4 + (1-竞争度)×0.2 */
function calcOpportunityScore(p: MockProduct, maxSales: number, maxGrowth: number) {
  const salesScore = maxSales > 0 ? (p.sales / maxSales) * 100 : 0;
  const growthScore = maxGrowth > 0 ? (p.growthRate / maxGrowth) * 100 : 0;
  const competitionScore = (1 - p.competition) * 100;
  const opportunity = salesScore * 0.4 + growthScore * 0.4 + competitionScore * 0.2;
  return { opportunityScore: Math.round(opportunity), salesScore: Math.round(salesScore), growthScore: Math.round(growthScore), competitionScore: Math.round(competitionScore) };
}

function getTier(score: number): { tier: string; color: string } {
  if (score >= 70) return { tier: "强烈推荐", color: "text-green-500" };
  if (score >= 50) return { tier: "值得考虑", color: "text-blue-500" };
  if (score >= 30) return { tier: "一般", color: "text-yellow-500" };
  return { tier: "观望", color: "text-muted-foreground" };
}

export default function OpportunitiesPage() {
  const [sortBy, setSortBy] = useState<"opportunityScore" | "sales" | "growthRate">("opportunityScore");

  const enriched = useMemo(() => {
    const maxSales = Math.max(...products.map(p => p.sales));
    const maxGrowth = Math.max(...products.map(p => p.growthRate));
    return products.map(p => ({ ...p, ...calcOpportunityScore(p, maxSales, maxGrowth) }));
  }, []);

  const sorted = useMemo(() => {
    return [...enriched].sort((a, b) => {
      if (sortBy === "sales") return b.sales - a.sales;
      if (sortBy === "growthRate") return b.growthRate - a.growthRate;
      return b.opportunityScore - a.opportunityScore;
    });
  }, [sortBy, enriched]);

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-violet-500" />
            <h1 className="text-3xl font-bold text-foreground">机会挖掘</h1>
          </div>
          <p className="text-muted-foreground mt-1">基于多维数据计算机会指数，发现高潜力商品</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">排序：</span>
          {(["opportunityScore", "sales", "growthRate"] as const).map((key) => (
            <Button
              key={key}
              variant={sortBy === key ? "default" : "ghost"}
              size="sm"
              onClick={() => setSortBy(key)}
              className="text-xs"
            >
              {key === "opportunityScore" ? "机会指数" : key === "sales" ? "销量" : "增长率"}
            </Button>
          ))}
        </div>
      </div>

      {/* 排名卡片列表 */}
      <div className="space-y-3">
        {sorted.map((product, idx) => {
          const { tier } = getTier(product.opportunityScore);
          return (
            <Link key={product.id} href={`/ai-report/${product.id}`} className="block group">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  {/* 排名序号 */}
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className={`text-lg font-bold ${idx < 3 ? "text-violet-500" : "text-muted-foreground"}`}>
                      #{idx + 1}
                    </span>
                  </div>

                  {/* 商品信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                      <Badge variant="outline" className="flex-shrink-0">{product.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="tabular-nums">¥{product.price.toFixed(2)}</span>
                      <span>★ {product.rating}</span>
                      <span>{product.platform}</span>
                    </div>
                  </div>

                  {/* 得分区域 */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    {/* 销量 */}
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">销量</p>
                      <p className="font-semibold tabular-nums">{product.sales.toLocaleString()}</p>
                    </div>

                    {/* 增长率 */}
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">增长率</p>
                      <div className="flex items-center gap-1 justify-end">
                        <TrendingUp className={`h-3.5 w-3.5 ${product.growthRate >= 30 ? "text-emerald-500" : "text-amber-500"}`} />
                        <span className={`font-semibold tabular-nums ${product.growthRate >= 30 ? "text-emerald-500" : "text-amber-500"}`}>
                          +{product.growthRate}%
                        </span>
                      </div>
                    </div>

                    {/* 竞争度 */}
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">竞争度</p>
                      <div className="flex items-center gap-1 justify-end">
                        <Shield className={`h-3.5 w-3.5 ${product.competition < 0.4 ? "text-emerald-500" : product.competition < 0.6 ? "text-amber-500" : "text-red-500"}`} />
                        <span className="font-semibold tabular-nums">{(product.competition * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* 机会指数 */}
                    <div className="text-right min-w-[100px]">
                      <ScoreBadge
                        score={product.opportunityScore}
                        tier={tier}
                        size="sm"
                        showScore
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* 评分说明 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>评分公式说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p><strong>机会指数</strong> = 销量得分 × 40% + 增长率得分 × 40% + 竞争度得分 × 20%</p>
          <p>• 销量得分：归一化到 0-100 区间</p>
          <p>• 增长率得分：归一化到 0-100 区间</p>
          <p>• 竞争度得分：(1 - 竞争度) × 100，越低越好</p>
          <p className="mt-2 text-xs">点击任一商品查看 AI 详细分析报告</p>
        </CardContent>
      </Card>
    </div>
  );
}
