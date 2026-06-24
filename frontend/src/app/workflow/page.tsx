"use client";

/**
 * Workflow 页面
 * 可视化展示选品分析全流程：Data Source → Data Cleaning → Ranking → AI Analysis → Product Report
 */

import {
  Database, Filter, BarChart3, Brain, FileText, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WorkflowStep {
  icon: typeof Database;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  bg: string;
  gradient: string;
}

const steps: WorkflowStep[] = [
  {
    icon: Database,
    title: "Data Source",
    subtitle: "数据源接入",
    description: "自动接入 Amazon、Shopee、TikTok Shop 等主流跨境电商平台的商品数据，支持实时抓取和历史数据导入。",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Filter,
    title: "Data Cleaning",
    subtitle: "数据清洗",
    description: "对原始数据进行去重、格式化、异常值处理，统一多平台数据标准，确保分析基础准确可靠。",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    icon: BarChart3,
    title: "Ranking",
    subtitle: "智能排序",
    description: "基于销量、增长率、评分、竞争度等多维指标，通过加权算法计算综合机会指数，自动排序发现高潜力商品。",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    gradient: "from-violet-500 to-violet-600",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    subtitle: "AI 智能分析",
    description: "调用大语言模型深度分析商品的市场容量、利润空间、用户需求和潜在风险，生成结构化洞察报告。",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: FileText,
    title: "Product Report",
    subtitle: "生成报告",
    description: "输出包含推荐指数、进入建议和综合总结的最终分析报告，辅助卖家做出数据驱动的选品决策。",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    gradient: "from-rose-500 to-rose-600",
  },
];

export default function WorkflowPage() {
  return (
    <div className="mx-auto max-w-6xl w-full px-4 py-8">
      {/* 页面头部 */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-foreground">选品分析工作流</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          从数据采集到最终报告，全流程自动化智能分析，每一步都经过精心设计
        </p>
      </div>

      {/* Desktop: 水平工作流 */}
      <div className="hidden md:block relative">
        {/* 连接线 */}
        <div className="absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-500 via-emerald-500 via-violet-500 via-purple-500 to-rose-500 opacity-30" />

        <div className="grid grid-cols-5 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative flex flex-col items-center group">
                {/* 步骤编号 */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold shadow-lg bg-gradient-to-br ${step.gradient} relative z-10`}>
                  {idx + 1}
                </div>

                {/* 图标 */}
                <div className={`mt-4 flex h-16 w-16 items-center justify-center rounded-2xl ${step.bg} ring-1 ring-border`}>
                  <Icon className={`h-8 w-8 ${step.color}`} />
                </div>

                {/* 标题 */}
                <h3 className="mt-4 font-bold text-foreground text-center">{step.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 text-center">{step.subtitle}</p>

                {/* 描述卡片（hover 时展开） */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Card size="sm" className="shadow-lg">
                    <CardContent className="p-3 text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>

        {/* 箭头指示（连接步骤） */}
        <div className="flex justify-between px-[4%] -mt-10">
          {steps.slice(0, -1).map((_, idx) => (
            <ChevronRight key={idx} className="h-5 w-5 text-muted-foreground/30" />
          ))}
        </div>

        {/* 可点击查看详情提示 */}
        <p className="text-center text-xs text-muted-foreground mt-20">
          悬停查看各步骤详细说明
        </p>
      </div>

      {/* Mobile: 垂直工作流 */}
      <div className="md:hidden space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;
          return (
            <div key={step.title} className="relative flex gap-4">
              {/* 左侧时间轴 */}
              <div className="flex flex-col items-center">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white text-sm font-bold shadow-lg bg-gradient-to-br ${step.gradient}`}>
                  {idx + 1}
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-current to-transparent mt-2 opacity-20" />
                )}
              </div>

              {/* 内容 */}
              <Card className="flex-1 mb-2">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.bg}`}>
                      <Icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{step.title}</h3>
                      <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* 底部功能介绍 */}
      <Card className="mt-12">
        <CardContent className="p-6">
          <h3 className="font-bold text-foreground mb-3">工作流优势</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <h4 className="font-semibold text-sm text-foreground">全自动化</h4>
              <p className="text-xs text-muted-foreground mt-1">从数据采集到报告生成，无需人工干预</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">实时更新</h4>
              <p className="text-xs text-muted-foreground mt-1">数据源持续更新，分析结果始终保持最新</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">AI 驱动</h4>
              <p className="text-xs text-muted-foreground mt-1">大语言模型深度分析，提供专业级洞察</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
