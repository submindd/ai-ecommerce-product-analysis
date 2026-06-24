"use client";

/**
 * AI 报告页面
 * 展示 LLM 生成的商品分析报告（市场容量、利润空间、需求、风险、推荐指数）
 */

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Brain, TrendingUp, DollarSign, Users, AlertTriangle,
  CheckCircle, Clock, Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ui/score-bar";
import productsData from "@/data/products.json";
import { mockAiReport } from "@/lib/ai-report-mock";
import type { MockProduct } from "@/types/mock-product";
import type { AIReport } from "@/types/ai-report";

const products = productsData as MockProduct[];

const entryRecConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle }> = {
  "强烈建议进入": { color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: CheckCircle },
  "建议进入": { color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", icon: CheckCircle },
  "谨慎考虑": { color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", icon: AlertTriangle },
  "不建议进入": { color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", icon: AlertTriangle },
};

export default function AIReportPage() {
  const params = useParams();
  const productId = Number(params.id);
  const [product, setProduct] = useState<MockProduct | null>(null);
  const [report, setReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = products.find(p => p.id === productId);
    if (found) {
      setProduct(found);
      // 模拟 LLM 调用延迟
      const timer = setTimeout(() => {
        const aiReport = mockAiReport({
          productId: found.id,
          productName: found.name,
          category: found.category,
          sales: found.sales,
          growthRate: found.growthRate,
          competition: found.competition,
          price: found.price,
          rating: found.rating,
          platform: found.platform,
        });
        setReport(aiReport);
        setLoading(false);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [productId]);

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground">未找到该商品</h2>
        <p className="text-muted-foreground mt-2">商品 ID: {productId} 不存在</p>
        <Link href="/hot-products" className="inline-flex items-center gap-1 mt-4 text-blue-500 hover:underline">
          <ArrowLeft className="h-4 w-4" /> 返回热销商品
        </Link>
      </div>
    );
  }

  const recConfig = report ? entryRecConfig[report.entryRecommendation] || entryRecConfig["谨慎考虑"] : null;
  const RecIcon = recConfig?.icon || AlertTriangle;

  return (
    <div className="mx-auto max-w-4xl w-full px-4 py-8">
      {/* 返回导航 */}
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> 返回机会列表
      </Link>

      {/* 商品基本信息 */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary">{product.category}</Badge>
            <Badge variant="outline">{product.platform}</Badge>
            <span className="text-sm text-muted-foreground">★ {product.rating}</span>
          </div>
          <div className="flex items-center gap-6 mt-3 text-sm">
            <span>销量: <strong className="tabular-nums">{product.sales.toLocaleString()}</strong></span>
            <span>增长率: <strong className="text-emerald-500">+{product.growthRate}%</strong></span>
            <span>价格: <strong className="tabular-nums">${product.price.toFixed(2)}</strong></span>
          </div>
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Brain className="h-12 w-12 text-muted-foreground animate-pulse mb-4" />
            <p className="text-lg font-medium text-foreground">AI 正在分析...</p>
            <p className="text-sm text-muted-foreground mt-1">正在生成商品分析报告</p>
            <div className="mt-6 flex gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-2 w-12 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s`, width: "60%" }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI 报告内容 */}
      {report && (
        <div className="space-y-6">
          {/* 推荐指数与决策 */}
          <Card>
            <CardContent className="flex items-center gap-6 p-6">
              <div className={`flex h-20 w-20 items-center justify-center rounded-full ${recConfig?.bg || ""}`}>
                <RecIcon className={`h-10 w-10 ${recConfig?.color || ""}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">AI 决策建议</p>
                <p className={`text-2xl font-bold ${recConfig?.color || ""}`}>{report.entryRecommendation}</p>
                <p className="text-sm text-muted-foreground mt-1">推荐指数 {report.recommendationScore}/100</p>
              </div>
              <div className="w-32">
                <ScoreBar dimension="sales_score" value={report.recommendationScore} animate />
              </div>
            </CardContent>
          </Card>

          {/* 报告详情网格 */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* 市场容量 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  市场容量
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{report.marketSize}</p>
              </CardContent>
            </Card>

            {/* 利润空间 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  利润空间
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{report.profitMargin}</p>
              </CardContent>
            </Card>

            {/* 用户需求 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-violet-500" />
                  用户需求
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{report.userDemand}</p>
              </CardContent>
            </Card>

            {/* 风险 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  风险提示
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.risks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 综合总结 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                综合总结
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
              <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                报告生成时间: {new Date(report.generatedAt).toLocaleString("zh-CN")}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
