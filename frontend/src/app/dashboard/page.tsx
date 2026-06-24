"use client";

/**
 * 仪表盘页面
 * 展示核心指标卡片、销量排行柱状图、类目分布饼图、商品一览表
 */

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Package, TrendingUp, Target, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import productsData from "@/data/products.json";
import type { MockProduct } from "@/types/mock-product";

const products = productsData as MockProduct[];

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

export default function DashboardPage() {
  // ========== KPI 计算 ==========
  const kpis = useMemo(() => {
    const total = products.length;
    const avgGrowth = products.reduce((s, p) => s + p.growthRate, 0) / total;
    const avgSales = Math.round(products.reduce((s, p) => s + p.sales, 0) / total);
    const highOpp = products.filter(p => p.growthRate > 30 && p.competition < 0.5).length;
    return { total, avgGrowth, avgSales, highOpp };
  }, []);

  // ========== 类目分布 ==========
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach(p => map.set(p.category, (map.get(p.category) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, []);

  // ========== 销量排行 Top10 ==========
  const salesTop10 = useMemo(() => {
    return [...products].sort((a, b) => b.sales - a.sales).slice(0, 10);
  }, []);

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">仪表盘</h1>
        <p className="text-muted-foreground mt-1">数据概览与核心指标</p>
      </div>

      {/* KPI 卡片网格 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">商品总数</p>
              <p className="text-2xl font-bold">{kpis.total}<span className="ml-1 text-sm font-normal text-muted-foreground">个</span></p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">平均增长率</p>
              <p className="text-2xl font-bold">{kpis.avgGrowth.toFixed(1)}<span className="ml-1 text-sm font-normal text-muted-foreground">%</span></p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
              <Target className="h-6 w-6 text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">平均销量</p>
              <p className="text-2xl font-bold">{kpis.avgSales.toLocaleString()}<span className="ml-1 text-sm font-normal text-muted-foreground">件</span></p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
              <Activity className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">高机会商品</p>
              <p className="text-2xl font-bold">{kpis.highOpp}<span className="ml-1 text-sm font-normal text-muted-foreground">个</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表行 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 销量排行柱状图 */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">销量排行 Top 10</h3>
              <p className="chart-subtitle">按销量降序排列</p>
            </div>
          </div>
          <div className="chart-body h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTop10} margin={{ left: -20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [Number(value).toLocaleString(), "销量"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
                />
                <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 类目分布饼图 */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">类目分布</h3>
              <p className="chart-subtitle">各品类商品数量</p>
            </div>
          </div>
          <div className="chart-body h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 商品一览表 */}
      <Card>
        <CardHeader>
          <CardTitle>全部商品</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">商品名称</th>
                  <th className="text-left px-4 py-3 font-medium">类目</th>
                  <th className="text-right px-4 py-3 font-medium">销量</th>
                  <th className="text-right px-4 py-3 font-medium">增长率</th>
                  <th className="text-right px-4 py-3 font-medium">价格</th>
                  <th className="text-right px-4 py-3 font-medium">平台</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{product.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{product.sales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={product.growthRate >= 0 ? "text-emerald-500" : "text-red-500"}>
                        {product.growthRate >= 0 ? "+" : ""}{product.growthRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{product.platform}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
