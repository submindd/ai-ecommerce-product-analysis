import { Sparkles, TrendingUp, Globe, Search, BarChart3, Zap } from "lucide-react";

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
      <section className="relative flex flex-col items-center justify-center px-4 py-24 md:py-36">
        {/* 装饰性渐变背景 */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

        <div className="flex flex-col items-center gap-6 text-center max-w-3xl">
          {/* 徽章 */}
          <div className="inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            AI 驱动的智能选品引擎
          </div>

          {/* 主标题 */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            AI 跨境电商
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              智能选品分析平台
            </span>
          </h1>

          {/* 副标题 */}
          <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
            基于人工智能和大数据分析，帮助跨境电商卖家精准选品、洞察市场趋势、
            优化运营策略，让数据驱动每一笔决策
          </p>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-8 text-sm font-medium text-background shadow-md transition-colors hover:bg-foreground/90"
            >
              开始使用
            </a>
            <a
              href="#features"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-8 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
            >
              了解更多
            </a>
          </div>
        </div>
      </section>

      {/* ========== 功能特性网格 ========== */}
      <section id="features" className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          {/* 区域标题 */}
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              全方位智能选品能力
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              六大核心功能，覆盖选品全流程
            </p>
          </div>

          {/* 特性卡片网格 */}
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
          AI 跨境电商智能选品分析平台 &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
