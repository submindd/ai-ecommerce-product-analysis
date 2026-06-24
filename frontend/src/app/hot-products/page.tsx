"use client";

/**
 * 热销商品页面
 * 从 mock-data/products.json 读取数据，展示商品名称、类目、销量、增长率
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { Flame, ArrowUp, ArrowDown, TrendingUp, SortAsc } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import productsData from "@/data/products.json";
import type { MockProduct } from "@/types/mock-product";

const products = productsData as MockProduct[];

type SortKey = "sales" | "growthRate" | "name";

export default function HotProductsPage() {
  const [sortKey, setSortKey] = useState<SortKey>("sales");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    const list = [...products];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "sales") cmp = a.sales - b.sales;
      else if (sortKey === "growthRate") cmp = a.growthRate - b.growthRate;
      else cmp = a.name.localeCompare(b.name);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortButton = ({ label, sortValue }: { label: string; sortValue: SortKey }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleSort(sortValue)}
      className={`gap-1 text-xs ${sortKey === sortValue ? "text-foreground font-semibold" : "text-muted-foreground"}`}
    >
      {label}
      {sortKey === sortValue && (sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </Button>
  );

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <h1 className="text-3xl font-bold text-foreground">热销商品</h1>
          </div>
          <p className="text-muted-foreground mt-1">共 {products.length} 件商品，按热度排序</p>
        </div>
        <div className="flex items-center gap-1">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <SortButton label="销量" sortValue="sales" />
          <SortButton label="增长率" sortValue="growthRate" />
          <SortButton label="名称" sortValue="name" />
        </div>
      </div>

      {/* 商品网格 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((product) => (
          <Link key={product.id} href={`/ai-report/${product.id}`} className="block group">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-0">
                {/* 商品图片区域 */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">{product.platform}</Badge>
                  </div>
                </div>

                {/* 商品信息 */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{product.category}</Badge>
                    <span className="text-xs text-muted-foreground">★ {product.rating}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-xs text-muted-foreground">销量</p>
                      <p className="font-bold text-foreground tabular-nums">{product.sales.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">增长率</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`h-4 w-4 ${product.growthRate >= 20 ? "text-emerald-500" : "text-amber-500"}`} />
                        <span className={`font-bold tabular-nums ${product.growthRate >= 20 ? "text-emerald-500" : "text-amber-500"}`}>
                          +{product.growthRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
