"use client";

/**
 * 商品卡片骨架屏
 * 数据加载时展示的占位组件
 */

import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* 图片占位 */}
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        {/* 标题占位 */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        {/* 价格占位 */}
        <Skeleton className="h-6 w-1/3" />
        {/* 评分占位 */}
        <Skeleton className="h-4 w-1/2" />
        {/* 店铺占位 */}
        <div className="flex justify-between">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}
