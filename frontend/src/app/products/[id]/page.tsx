"use client";

/**
 * 单商品深度分析页（核心页面）
 * Jungle Scout / Helium10 风格的产品分析视图
 */
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, DollarSign, Star, Package,
  AlertTriangle, ThumbsUp, Zap, Target, BarChart3,
  ChevronLeft, ShieldCheck, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/components/common/ProductImage";
import { ScoreBar } from "@/components/ui/score-bar";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/components/platform-provider";
import { PLATFORM_CONFIGS } from "@/types/platform";
import { getProductFullDetail } from "@/lib/api";
import type { ProductFullDetail } from "@/types/product-detail";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LabelList,
} from "recharts";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { platform } = usePlatform();
  const [data, setData] = useState<ProductFullDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getProductFullDetail(parseInt(id))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSkeleton />;
  if (!data) return (
    <div className="flex flex-col items-center justify-center flex-1 py-24 text-center">
      <p className="text-lg font-medium text-muted-foreground mb-2">当前为 Mock 数据，详情不可用</p>
      <p className="text-sm text-muted-foreground mb-4">商品 ID 在当前平台数据库中不存在</p>
      <Link href="/products"><Button variant="outline">返回商品列表</Button></Link>
    </div>
  );

  const { basic, price_history, price_analysis, profit_analysis, scoring, review_analysis, sales_trend } = data;

  return (
    <div className="flex flex-col flex-1 bg-muted/30">
      {/* ====== 顶栏 ====== */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <Link href="/products" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold truncate flex-1">{basic.title}</h1>
          {/* 平台标识（带配色） */}
          <Badge className={cn(
            "text-xs gap-1 font-medium border shadow-sm",
            PLATFORM_CONFIGS[platform].bgColor,
            PLATFORM_CONFIGS[platform].borderColor,
            PLATFORM_CONFIGS[platform].color
          )}>
            <span className={cn("h-2 w-2 rounded-full", PLATFORM_CONFIGS[platform].activeColor)} />
            {PLATFORM_CONFIGS[platform].label}
          </Badge>
          <ScoreBadge score={scoring.composite_score} tier={scoring.tier} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ====== 左栏（2/3） ====== */}
          <div className="lg:col-span-2 space-y-6">
            <InfoCard basic={basic} />
            <PriceHistoryCard data={price_history} />
            <SalesTrendCard data={sales_trend} />
            <ReviewCard data={review_analysis} />
            {/* AI 智能分析（独立异步加载，不阻塞页面） */}
            <AIAnalysisSection productId={basic.id} />
          </div>

          {/* ====== 右栏（1/3） ====== */}
          <div className="space-y-6">
            <ScoringCard data={scoring} />
            <PriceAnalysisCard data={price_analysis} />
            <ProfitCard data={profit_analysis} />
            <EntryAdviceCard
              isGood={price_analysis.is_good_time_to_enter}
              score={scoring.composite_score}
              competitive={price_analysis.competitiveness_score}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   子卡片组件
   ================================================================ */

function InfoCard({ basic }: { basic: ProductFullDetail["basic"] }) {
  const { platform } = usePlatform();
  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format;
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-48 aspect-square sm:aspect-auto bg-muted">
          <ProductImage src={basic.image_url} alt={basic.title} fill className="object-cover" />
        </div>
        <div className="flex-1 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{basic.category}</Badge>
            <Badge className={cn(
              "text-xs gap-1",
              PLATFORM_CONFIGS[platform].bgColor,
              PLATFORM_CONFIGS[platform].borderColor,
              PLATFORM_CONFIGS[platform].color
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full", PLATFORM_CONFIGS[platform].activeColor)} />
              {PLATFORM_CONFIGS[platform].label}
            </Badge>
          </div>
          <h2 className="text-lg font-bold leading-snug mb-3">{basic.title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <KV label="售价" value={fmt(basic.price)} highlight />
            <KV label="原价" value={basic.original_price ? fmt(basic.original_price) : "—"} />
            <KV label="累计销量" value={basic.sales.toLocaleString()} />
            <KV label="店铺" value={basic.store} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceHistoryCard({ data }: { data: ProductFullDetail["price_history"] }) {
  const chartData = data.months.map((m, i) => ({ month: m.slice(5), price: data.prices[i] }));
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingDown className="h-4 w-4" /> 价格走势
        </h3>
        <Badge variant={data.trend === "下降" ? "default" : "outline"}>
          趋势：{data.trend} | 波动 {data.volatility}%
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Box label="最高" value={`$${data.highest}`} />
        <Box label="最低" value={`$${data.lowest}`} />
        <Box label="当前" value={`$${data.current}`} highlight />
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
          <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" domain={["auto", "auto"]} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", fontSize: "13px" }} />
          <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} fill="url(#priceGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SalesTrendCard({ data }: { data: ProductFullDetail["sales_trend"] }) {
  const chartData = data.months.map((m, i) => ({ month: m, sales: data.monthly_sales[i] }));
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4" /> 预估月销量趋势
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
          <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", fontSize: "13px" }} />
          <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={i >= chartData.length - 2 ? "#6366f1" : "#a5b4fc"} />
            ))}
            <LabelList dataKey="sales" position="top" fontSize={11} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ReviewCard({ data }: { data: ProductFullDetail["review_analysis"] }) {
  const dist = data.rating_distribution;
  const labels = ["5星", "4星", "3星", "2星", "1星"];
  const values = [dist["5星"], dist["4星"], dist["3星"], dist["2星"], dist["1星"]];
  const colors = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#f43f5e"];
  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 评论分析
        </h3>
        <Badge variant="outline">{data.sentiment}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><div className="text-3xl font-bold">{data.rating}</div>
          <div className="flex items-center gap-0.5 mt-1">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`h-4 w-4 ${s <= Math.round(data.rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{data.reviews.toLocaleString()} 条评论</p>
        </div>
        <div><div className="text-3xl font-bold text-green-600">{data.quality_score}</div>
          <p className="text-xs text-muted-foreground mt-1">评论质量得分</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {labels.map((l, i) => (
          <div key={l} className="flex items-center gap-2 text-xs">
            <span className="w-7 text-muted-foreground">{l}</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${total > 0 ? (values[i] / total) * 100 : 0}%`, backgroundColor: colors[i] }} />
            </div>
            <span className="w-8 text-right text-muted-foreground">{values[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   AI 智能分析区块 — 所有 Hooks 在顶层，用 let content 控制渲染
   ================================================================ */

const MOCK_AI_DATA: Record<string, unknown> = {
  score: 70, summary: "AI分析引擎正在初始化，当前展示测试数据",
  competition: "中等", competition_detail: "请确保后端运行后刷新页面获取真实AI分析",
  is_worth_entering: true, worth_entering_reason: "建议启动后端服务后获取完整AI分析",
  advantages: ["利润空间可观", "市场需求稳定", "品牌认知度高", "评分优秀"],
  disadvantages: ["需确认市场竞争强度", "运费成本需优化"],
  target_audience: ["跨境电商卖家", "品牌经销商", "小批量测试卖家"],
  risks: [{ title: "市场竞争风险", description: "需进一步分析竞品数据", level: "中" }],
  pricing_advice: { current_rating: "合理", suggested_range: "待分析", detail: "启动后端获取准确建议" },
  profit_advice: { current_level: "良好", cost_optimization: "优化物流成本", detail: "完整分析需后端运行" },
  advertising_advice: { budget_suggestion: "待定", keywords_strategy: "待分析", detail: "完整分析需后端运行" },
  recommendation: "AI 智能分析报告将在后端服务启动后自动生成。当前为占位测试数据。",
};

function AIAnalysisSection({ productId }: { productId: number }) {
  // ====== 所有 Hooks 在顶层固定顺序调用 ======
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // 数据请求（挂载时执行一次，productId 变化时重新执行）
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const url = `${apiBase}/api/products/${productId}/ai-analysis`;

    setLoading(true);
    setError(null);

    fetch(url)
      .then(async (r) => {
        if (!r.ok) { const t = await r.text(); throw new Error(`HTTP ${r.status}: ${t.slice(0, 200)}`); }
        return r.json();
      })
      .then((json) => { setData(json); })
      .catch((err) => {
        setError(err.message);
        setTimeout(() => setData({ ...MOCK_AI_DATA }), 1500);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  // ====== 数据提取（始终执行） ======
  const adv = (data?.advantages as string[]) || [];
  const dis = (data?.disadvantages as string[]) || [];
  const risks = (data?.risks as Array<{ title: string; description?: string; level: string }>) || [];
  const pricing = (data?.pricing_advice as Record<string, string>) || {};
  const profitAdv = (data?.profit_advice as Record<string, string>) || {};
  const adAdv = (data?.advertising_advice as Record<string, string>) || {};
  const audience = (data?.target_audience as string[]) || [];
  const score = (data?.score as number) ?? 0;
  const competition = (data?.competition as string) || "?";
  const summary = (data?.summary as string) || "";
  const isWorth = data?.is_worth_entering as boolean;
  const competitionDetail = (data?.competition_detail as string) || "";
  const worthReason = (data?.worth_entering_reason as string) || "";
  const recommendation = (data?.recommendation as string) || "";

  // ====== 渲染逻辑：只有两个分支，有 data 就渲染卡片，否则渲染骨架 ======
  console.log("[AI] RENDER CHECK:", { loading, hasData: data !== null, dataKeys: data ? Object.keys(data).length : 0, error });

  if (!data) {
    // 无数据时显示骨架（loading 和 error 都用骨架，由 .catch 中的 setTimeout 最终设 data）
    return (
      <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 p-5">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          {error && <p className="text-xs text-yellow-600 mt-2">⚠ {error}</p>}
        </div>
      </div>
    );
  }

  // data 存在时直接返回完整卡片
  return (
    <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 p-5">
      {error && (
        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 p-3 text-xs">
          <p className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">AI 接口调用失败，当前展示测试数据</p>
          <p className="text-yellow-600 dark:text-yellow-500 font-mono text-[11px]">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" /> AI 智能分析报告
          <Badge variant="secondary" className="text-xs">DeepSeek</Badge>
          {error && <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">Mock</Badge>}
        </h3>
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs",
            competition === "蓝海" ? "bg-green-100 text-green-700" : competition === "中等" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
          )}>竞争: {competition}</Badge>
          <Badge className={cn("text-xs font-bold",
            score >= 80 ? "bg-green-100 text-green-700" : score >= 60 ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
          )}>AI评分: {score}/100</Badge>
          <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => setExpanded(!expanded)}>
            {expanded ? "收起" : "展开"}
          </Button>
        </div>
      </div>

      <p className="text-sm font-medium text-foreground mb-3">{summary}</p>

      <div className={cn("rounded-lg bg-white/50 dark:bg-black/10 p-3 mb-4", isWorth ? "border-l-4 border-l-green-500" : "border-l-4 border-l-yellow-500")}>
        <p className="text-sm font-semibold mb-0.5">{isWorth ? "✅ 建议进入" : "⚠️ 谨慎评估"}</p>
        <p className="text-xs text-muted-foreground">{worthReason}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <div>
          <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> 商品优势</h4>
          <ul className="space-y-1">
            {adv.map((a, i) => (<li key={i} className="text-xs text-muted-foreground flex gap-1.5"><span className="text-green-500 mt-0.5 shrink-0">+</span><span className="text-foreground">{a}</span></li>))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> 商品缺点</h4>
          <ul className="space-y-1">
            {dis.map((d, i) => (<li key={i} className="text-xs text-muted-foreground flex gap-1.5"><span className="text-red-500 mt-0.5 shrink-0">-</span><span className="text-foreground">{d}</span></li>))}
          </ul>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3 pt-3 border-t border-border">
          {audience.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold mb-1.5">🎯 适合人群</h4>
              <div className="flex flex-wrap gap-1">{audience.map((t, i) => (<Badge key={i} variant="secondary" className="text-xs">{t}</Badge>))}</div>
            </div>
          )}
          <div>
            <h4 className="text-xs font-semibold mb-1.5">⚠️ 风险提示</h4>
            <div className="space-y-1.5">
              {risks.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Badge variant="outline" className={cn("text-xs h-4 shrink-0", r.level === "高" ? "border-red-300 text-red-700 bg-red-50" : r.level === "中" ? "border-yellow-300 text-yellow-700 bg-yellow-50" : "border-green-300 text-green-700 bg-green-50")}>{r.level}</Badge>
                  <div><p className="font-medium text-foreground">{r.title}</p>{r.description && <p className="text-muted-foreground">{r.description}</p>}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/20 p-3">
              <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">💰 定价建议</h4>
              <p className="text-xs text-muted-foreground">{pricing.detail || pricing.current_rating}</p>
              {pricing.suggested_range && <p className="text-xs font-bold text-blue-600 mt-1">{pricing.suggested_range}</p>}
            </div>
            <div className="rounded-lg bg-green-50/50 dark:bg-green-950/20 p-3">
              <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">📈 利润建议</h4>
              <p className="text-xs text-muted-foreground">{profitAdv.detail || profitAdv.cost_optimization}</p>
            </div>
            <div className="rounded-lg bg-orange-50/50 dark:bg-orange-950/20 p-3">
              <h4 className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">📣 广告建议</h4>
              <p className="text-xs text-muted-foreground">{adAdv.detail || adAdv.budget_suggestion}</p>
            </div>
          </div>
          {competitionDetail && (<div><h4 className="text-xs font-semibold mb-1">📊 竞争分析</h4><p className="text-xs text-muted-foreground">{competitionDetail}</p></div>)}
          {recommendation && (
            <div className="rounded-lg bg-purple-50/50 dark:bg-purple-950/20 p-3">
              <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">🤖 AI 推荐理由</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   右侧栏卡片组件
   ================================================================ */

function ScoringCard({ data }: { data: ProductFullDetail["scoring"] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold flex items-center gap-2 mb-3"><Target className="h-4 w-4" /> 推荐指数</h3>
      <div className="text-center mb-3">
        <span className={cn("text-5xl font-bold", data.composite_score >= 80 ? "text-green-600" : data.composite_score >= 65 ? "text-blue-600" : data.composite_score >= 50 ? "text-yellow-600" : "text-muted-foreground")}>{data.composite_score.toFixed(0)}</span>
        <span className="text-sm text-muted-foreground">/100</span>
        <p className="text-sm font-medium mt-1">{data.tier}</p>
      </div>
      <div className="space-y-2">
        <ScoreBar dimension="sales_score" value={data.dimensions.sales} maxValue={30} />
        <ScoreBar dimension="rating_score" value={data.dimensions.rating} maxValue={25} />
        <ScoreBar dimension="reviews_score" value={data.dimensions.reviews} maxValue={20} />
        <ScoreBar dimension="price_score" value={data.dimensions.price} maxValue={25} />
      </div>
    </div>
  );
}

function PriceAnalysisCard({ data }: { data: ProductFullDetail["price_analysis"] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold flex items-center gap-2 mb-3"><DollarSign className="h-4 w-4" /> 价格竞争力</h3>
      <div className="space-y-2 text-sm">
        <Row label="当前价格" value={`$${data.current_price}`} bold />
        {data.original_price && <Row label="原价" value={`$${data.original_price}`} />}
        {data.discount_rate > 0 && <Row label="折扣率" value={`${data.discount_rate}%`} green />}
        <Row label="类目均价" value={`$${data.category_avg_price}`} />
        <Row label="价格区间" value={data.price_tier} badge={data.price_tier} />
        <Row label="竞争力得分" value={`${data.competitiveness_score}/100`} />
        <hr className="border-border my-2" />
        <p className="text-xs text-muted-foreground">当前价格处于类目<strong> {data.price_position_percentile}% </strong>分位{data.price_tier === "低" ? "，价格优势明显" : data.price_tier === "高" ? "，需关注价格竞争力" : "，处于合理区间"}</p>
      </div>
    </div>
  );
}

function ProfitCard({ data }: { data: ProductFullDetail["profit_analysis"] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold flex items-center gap-2 mb-3"><Zap className="h-4 w-4" /> 利润预测</h3>
      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <KV label="毛利润" value={`$${data.gross_profit}`} highlight />
        <KV label="利润率" value={`${data.profit_margin}%`} highlight />
        <KV label="ROI" value={`${data.roi}%`} />
        <KV label="等级" value={data.profit_level} />
        <KV label="总成本" value={`$${data.total_cost}`} />
        <KV label="佣金" value={`$${data.commission_amount}`} />
      </div>
    </div>
  );
}

function EntryAdviceCard({ isGood, score, competitive }: { isGood: boolean; score: number; competitive: number }) {
  return (
    <div className={cn("rounded-xl border p-5", isGood ? "border-green-300 bg-green-50/50 dark:bg-green-950/20" : "border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/20")}>
      <h3 className="font-semibold flex items-center gap-2 mb-2"><ShieldCheck className={cn("h-4 w-4", isGood ? "text-green-600" : "text-yellow-600")} /> 入场建议</h3>
      <p className={cn("text-2xl font-bold mb-2", isGood ? "text-green-600" : "text-yellow-600")}>{isGood ? "✅ 建议入场" : "⚠️ 谨慎评估"}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {isGood ? `综合评分 ${score} 分，价格竞争力 ${competitive} 分。该商品市场表现良好，盈利能力可观，建议优先考虑。` : `综合评分 ${score} 分。建议进一步分析市场竞争和供应链可行性后再做决策。`}
      </p>
    </div>
  );
}

/* ================================================================
   通用小组件
   ================================================================ */

function ScoreBadge({ score, tier }: { score: number; tier: string }) {
  const c = score >= 80 ? "bg-green-100 text-green-700 border-green-300" : score >= 65 ? "bg-blue-100 text-blue-700 border-blue-300" : score >= 50 ? "bg-yellow-100 text-yellow-700 border-yellow-300" : "bg-muted text-muted-foreground";
  return <Badge className={cn("text-xs", c)} variant="outline">{tier} {score.toFixed(0)}</Badge>;
}

function Box({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg bg-muted/50 p-2 text-center"><p className="text-xs text-muted-foreground">{label}</p><p className={cn("text-sm font-bold", highlight && "text-indigo-600")}>{value}</p></div>;
}

function KV({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className={cn("text-sm font-semibold", highlight && "text-indigo-600")}>{value}</p></div>;
}

function Row({ label, value, bold, green, badge }: { label: string; value: string; bold?: boolean; green?: boolean; badge?: string }) {
  const bv = badge === "高" ? "border-red-200 text-red-700" : badge === "低" ? "border-green-200 text-green-700" : "";
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      {badge ? <Badge variant="outline" className={cn("text-xs", bv)}>{value}</Badge> : <span className={cn("tabular-nums", bold && "font-semibold", green && "text-green-600")}>{value}</span>}
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-24">
      <p className="text-lg font-medium text-muted-foreground mb-4">商品不存在</p>
      <Link href="/products"><Button variant="outline">返回商品列表</Button></Link>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
