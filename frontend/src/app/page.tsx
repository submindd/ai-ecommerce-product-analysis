"use client";

import { Sparkles, TrendingUp, Globe, Search, BarChart3, Zap, Package, Target, Activity } from "lucide-react";
import productsData from "@/data/products.json";
import type { MockProduct } from "@/types/mock-product";
import { Card, CardContent } from "@/components/ui/card";

const products = productsData as MockProduct[];

// ========== 核心 KPI 计算 ==========
const totalProducts = products.length;
const avgGrowth = products.reduce((s, p) => s + p.growthRate, 0) / totalProducts;
const avgSales = products.reduce((s, p) => s + p.sales, 0) / totalProducts;
const highOpportunity = products.filter(p => p.growthRate > 30 && p.competition < 0.5).length;
const avgCompetition = products.reduce((s, p) => s + p.competition, 0) / totalProducts;

const kpiCards = [
  {
    icon: Package,
    label: "商品总数",
    value: totalProducts,
    unit: "个",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    icon: TrendingUp,
    label: "平均增长率",
    value: avgGrowth.toFixed(1),
    unit: "%",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    icon: Target,
    label: "高机会商品",
    value: highOpportunity,
    unit: "个",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-500/10",
  },
  {
    icon: Activity,
    label: "平均竞争度",
    value: (avgCompetition * 100).toFixed(0),
    unit: "%",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
];

// ========== 平台功能亮点数据 ==========
const features = [
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "市场趋势分析",
    description: "基于大数据实时追踪跨境市场动态，发现潜力爆品",
  },
  {
    icon: <Search className="h-8 w-8" />,
    title: "智能选品推荐",
    description: "AI 算法精准匹配高利润、低竞争的商品机会",
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "多平台数据聚合",
    description: "整合 Amazon、Shopee、TikTok Shop 等多平台数据",
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "竞品深度洞察",
    description: "全方位分析竞品定价、销量和营销策略",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "实时数据看板",
    description: "可视化数据面板，关键指标一目了然",
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: "AI 内容生成",
    description: "自动生成商品标题、描述和营销文案",
  },
];

// ========== 首页组件 ==========
export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* ========== 主视觉区域 ========== */}
      <section className="relative flex flex-col items-center justify-center px-4 py-20 md:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

        <div className="flex flex-col items-center gap-6 text-center max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            AI 驱动的智能选品引擎
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Aoxia Lite
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              AI 选品助手
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
            基于人工智能和大数据分析，帮助跨境电商卖家精准选品、洞察市场趋势、
            优化运营策略，让数据驱动每一笔决策
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-8 text-sm font-medium text-background shadow-md transition-colors hover:bg-foreground/90"
            >
              查看仪表盘
            </a>
            <a
              href="/hot-products"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-8 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
            >
              浏览热销商品
            </a>
          </div>
        </div>
      </section>

      {/* ========== KPI 指标卡片 ========== */}
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpiCards.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} size="sm">
                  <CardContent className="flex items-center gap-4 py-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.bg}`}>
                      <Icon className={`h-6 w-6 ${kpi.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      <p className="text-2xl font-bold text-foreground">
                        {kpi.value}
                        <span className="ml-1 text-sm font-normal text-muted-foreground">{kpi.unit}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== 功能特性网格 ========== */}
      <section id="features" className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              全方位智能选品能力
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              六大核心功能，覆盖选品全流程
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-muted p-3 text-foreground">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 底部区域 ========== */}
      <footer className="border-t border-border mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-muted-foreground">
          Aoxia Lite - AI 选品助手 &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
