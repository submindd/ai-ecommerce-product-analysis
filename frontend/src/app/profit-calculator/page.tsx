"use client";

/**
 * 利润预测计算器
 * 实时计算利润率、ROI、建议售价，支持可视化展示
 */

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  Target,
  Percent,
  Truck,
  ShoppingCart,
  BadgePercent,
  Megaphone,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ui/export-button";
import { cn } from "@/lib/utils";
import { calculateProfit } from "@/lib/api";
import type { ProfitCalculateResponse } from "@/types/profit";

// ========== 客户端即时计算公式 ==========
function calcLocal(data: {
  product_cost: number;
  shipping: number;
  commission_rate: number;
  advertising_cost: number;
  selling_price: number;
}) {
  const { product_cost, shipping, commission_rate, advertising_cost, selling_price } = data;
  const commission_amount = selling_price * commission_rate;
  const total_cost = product_cost + shipping + advertising_cost + commission_amount;
  const gross_profit = selling_price - total_cost;
  const profit_margin = selling_price > 0 ? (gross_profit / selling_price) * 100 : 0;
  const roi = total_cost > 0 ? (gross_profit / total_cost) * 100 : 0;
  const base_cost = product_cost + shipping + advertising_cost;
  const break_even = commission_rate < 1 ? base_cost / (1 - commission_rate) : 0;
  return {
    commission_amount: +commission_amount.toFixed(2),
    total_cost: +total_cost.toFixed(2),
    gross_profit: +gross_profit.toFixed(2),
    profit_margin: +profit_margin.toFixed(2),
    roi: +roi.toFixed(2),
    break_even_price: +break_even.toFixed(2),
    is_profitable: gross_profit > 0,
  };
}

// ========== 默认值 ==========
const DEFAULTS = {
  product_cost: 15,
  shipping: 5,
  commission_rate: 15,
  advertising_cost: 3,
  selling_price: 39.99,
};

// ========== 预设场景 ==========
const PRESETS = [
  { label: "小商品", cost: 5, shipping: 3, comm: 12, ad: 1, price: 19.99 },
  { label: "电子产品", cost: 50, shipping: 8, comm: 15, ad: 8, price: 99.99 },
  { label: "服装", cost: 12, shipping: 4, comm: 15, ad: 3, price: 34.99 },
];

export default function ProfitCalculatorPage() {
  // ========== 输入状态 ==========
  const [cost, setCost] = useState(DEFAULTS.product_cost);
  const [shipping, setShipping] = useState(DEFAULTS.shipping);
  const [commRate, setCommRate] = useState(DEFAULTS.commission_rate);
  const [adCost, setAdCost] = useState(DEFAULTS.advertising_cost);
  const [price, setPrice] = useState(DEFAULTS.selling_price);

  // ========== 结果状态 ==========
  const [local, setLocal] = useState(() =>
    calcLocal({
      product_cost: DEFAULTS.product_cost,
      shipping: DEFAULTS.shipping,
      commission_rate: DEFAULTS.commission_rate / 100,
      advertising_cost: DEFAULTS.advertising_cost,
      selling_price: DEFAULTS.selling_price,
    })
  );
  const [server, setServer] = useState<ProfitCalculateResponse | null>(null);

  // ========== 实时客户端计算 ==========
  const updateLocal = useCallback(() => {
    setLocal(
      calcLocal({
        product_cost: cost,
        shipping,
        commission_rate: commRate / 100,
        advertising_cost: adCost,
        selling_price: price,
      })
    );
  }, [cost, shipping, commRate, adCost, price]);

  useEffect(() => {
    updateLocal();
  }, [updateLocal]);

  // ========== 调用后端获取建议售价（防抖） ==========
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await calculateProfit({
          product_cost: cost,
          shipping,
          commission_rate: commRate / 100,
          advertising_cost: adCost,
          selling_price: price,
        });
        setServer(result);
      } catch {
        // 后端不可用时降级到本地计算
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [cost, shipping, commRate, adCost, price]);

  // ========== 应用预设 ==========
  const applyPreset = (p: (typeof PRESETS)[0]) => {
    setCost(p.cost);
    setShipping(p.shipping);
    setCommRate(p.comm);
    setAdCost(p.ad);
    setPrice(p.price);
  };

  // ========== 环形图数据 ==========
  const pieData = [
    { name: "利润", value: Math.max(0, local.gross_profit) },
    { name: "商品成本", value: cost },
    { name: "运费", value: shipping },
    { name: "佣金", value: local.commission_amount },
    { name: "广告费", value: adCost },
  ].filter((d) => d.value > 0);

  const PIE_COLORS = ["#22c55e", "#6366f1", "#f97316", "#ec4899", "#f43f5e"];

  return (
    <div className="flex flex-col flex-1">
      {/* ========== 页面标题 ========== */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">利润预测计算器</h1>
              <p className="text-sm text-muted-foreground mt-1">
                输入成本参数，实时计算利润率、ROI 和最优定价
              </p>
            </div>
            <ExportButton
              endpoint="profit-report"
              label="导出报表"
              profitParams={{
                product_cost: cost,
                shipping,
                commission_rate: commRate / 100,
                advertising_cost: adCost,
              }}
            />
          </div>
          {/* 预设场景 */}
          <div className="flex gap-2 mt-3">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(p)}
                className="text-xs h-7"
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ========== 左侧：输入区 ========== */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              成本参数
            </h3>

            <div className="space-y-4">
              <Field
                label="商品成本"
                icon={<DollarSign className="h-3.5 w-3.5" />}
                value={cost}
                onChange={setCost}
                min={0}
                max={200}
                step={0.5}
                prefix="$"
              />
              <Field
                label="运费（每件）"
                icon={<Truck className="h-3.5 w-3.5" />}
                value={shipping}
                onChange={setShipping}
                min={0}
                max={50}
                step={0.5}
                prefix="$"
              />
              <Field
                label="平台佣金率"
                icon={<BadgePercent className="h-3.5 w-3.5" />}
                value={commRate}
                onChange={setCommRate}
                min={0}
                max={30}
                step={0.5}
                prefix=""
                suffix="%"
              />
              <Field
                label="广告费用（每件）"
                icon={<Megaphone className="h-3.5 w-3.5" />}
                value={adCost}
                onChange={setAdCost}
                min={0}
                max={30}
                step={0.5}
                prefix="$"
              />
              <div className="border-t border-border pt-4">
                <Field
                  label="售价"
                  icon={<DollarSign className="h-3.5 w-3.5 text-green-500" />}
                  value={price}
                  onChange={setPrice}
                  min={1}
                  max={200}
                  step={0.5}
                  prefix="$"
                  highlight
                />
              </div>
            </div>
          </div>

          {/* ========== 右侧：结果区 ========== */}
          <div className="space-y-6">
            {/* KPI 卡片 */}
            <div className="grid grid-cols-2 gap-3">
              <KPICard
                label="利润率"
                value={`${local.profit_margin}%`}
                level={local.is_profitable ? (local.profit_margin >= 20 ? "优秀" : "一般") : "亏损"}
                icon={<Percent className="h-4 w-4" />}
              />
              <KPICard
                label="ROI"
                value={`${local.roi}%`}
                level={local.is_profitable ? (local.roi >= 25 ? "优秀" : "一般") : "亏损"}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <KPICard
                label="毛利润"
                value={`$${local.gross_profit.toFixed(2)}`}
                level={local.is_profitable ? "良好" : "亏损"}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <KPICard
                label="总成本"
                value={`$${local.total_cost.toFixed(2)}`}
                level="一般"
                icon={<ShoppingCart className="h-4 w-4" />}
                muted
              />
            </div>

            {/* 环形图：成本构成 */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-foreground mb-2 text-sm">成本构成分析</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* 图例 */}
              <div className="flex flex-wrap gap-3 justify-center mt-1">
                {pieData.map((d, i) => (
                  <span key={d.name} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i] }}
                    />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>

            {/* 建议售价（后端计算） */}
            {server && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  定价建议
                </h3>
                <div className="space-y-2">
                  <PriceRow
                    label="盈亏平衡价"
                    price={server.break_even_price}
                    desc="刚好不亏不赚"
                    color="text-muted-foreground"
                  />
                  <PriceRow
                    label="目标利润率 20%"
                    price={server.suggested_price_20}
                    desc="低利润走量策略"
                    color="text-blue-600 dark:text-blue-400"
                  />
                  <PriceRow
                    label="目标利润率 30%"
                    price={server.suggested_price_30}
                    desc="推荐均衡定价"
                    color="text-green-600 dark:text-green-400"
                    recommended
                  />
                  <PriceRow
                    label="目标利润率 40%"
                    price={server.suggested_price_40}
                    desc="高利润品牌策略"
                    color="text-purple-600 dark:text-purple-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 输入字段组件 ==========
function Field({
  label,
  icon,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  highlight,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  highlight?: boolean;
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className={cn("text-sm font-semibold tabular-nums", highlight && "text-green-600 dark:text-green-400 text-base")}>
          {prefix}{value}{suffix}
        </span>
      </div>
      {/* 数值输入 + 滑块 */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 h-1.5 rounded-full appearance-none bg-muted cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${pct}%, var(--muted) ${pct}%, var(--muted) 100%)`,
          }}
        />
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="h-8 w-20 text-sm text-center"
        />
      </div>
    </div>
  );
}

// ========== KPI 卡片组件 ==========
function KPICard({
  label,
  value,
  level,
  icon,
  muted,
}: {
  label: string;
  value: string;
  level: string;
  icon: React.ReactNode;
  muted?: boolean;
}) {
  const colorMap: Record<string, string> = {
    "优秀": "border-l-green-500 bg-green-50/50 dark:bg-green-950/20",
    "良好": "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
    "一般": "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20",
    "亏损": "border-l-red-500 bg-red-50/50 dark:bg-red-950/20",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border border-l-4 p-3",
        muted ? "border-l-muted-foreground/30" : colorMap[level] || ""
      )}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <p className={cn("text-lg font-bold tabular-nums", muted && "text-muted-foreground")}>
        {value}
      </p>
    </div>
  );
}

// ========== 建议售价行 ==========
function PriceRow({
  label,
  price,
  desc,
  color,
  recommended,
}: {
  label: string;
  price: number;
  desc: string;
  color: string;
  recommended?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2",
        recommended && "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
      )}
    >
      <div>
        <p className={cn("text-sm font-medium", color)}>{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="text-right">
        <p className={cn("text-lg font-bold tabular-nums", color)}>
          ${price.toFixed(2)}
        </p>
        {recommended && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            推荐
          </span>
        )}
      </div>
    </div>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  fontSize: "13px",
};
