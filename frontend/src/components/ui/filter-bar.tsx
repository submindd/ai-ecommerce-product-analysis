"use client";

/**
 * 筛选栏组件
 * 支持按类目、评分、平台筛选，以及排序方式切换
 */

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductQueryParams, SortOption } from "@/types/product";

// ========== 排序预设 ==========
const SORT_OPTIONS: SortOption[] = [
  { label: "智能评分 ↓", field: "score", order: "desc" },
  { label: "默认排序", field: "created_at", order: "desc" },
  { label: "价格从低到高", field: "price", order: "asc" },
  { label: "价格从高到低", field: "price", order: "desc" },
  { label: "销量最高", field: "sales", order: "desc" },
  { label: "评分最高", field: "rating", order: "desc" },
  { label: "评论最多", field: "reviews", order: "desc" },
];

// ========== 评分选项 ==========
const RATING_OPTIONS = [
  { label: "4.5 分及以上", value: "4.5" },
  { label: "4.0 分及以上", value: "4.0" },
  { label: "3.5 分及以上", value: "3.5" },
];

interface FilterBarProps {
  categories: string[];
  platforms: string[];
  params: ProductQueryParams;
  onParamsChange: (params: ProductQueryParams) => void;
}

export function FilterBar({
  categories,
  platforms,
  params,
  onParamsChange,
}: FilterBarProps) {
  // 更新单个参数
  const updateParam = (key: keyof ProductQueryParams, value: unknown) => {
    onParamsChange({
      ...params,
      [key]: value === "all" || value === "" ? undefined : value,
      // 切换筛选条件时重置到第一页
      page: 1,
    });
  };

  // 清除所有筛选条件（保留排序）
  const clearFilters = () => {
    onParamsChange({
      page: 1,
      page_size: params.page_size,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
    });
  };

  // 当前选中的排序索引
  const currentSortIndex = SORT_OPTIONS.findIndex(
    (s) => s.field === params.sort_by && s.order === params.sort_order
  );
  const currentSortKey = currentSortIndex >= 0 ? String(currentSortIndex) : "0";

  // 判断是否有活跃筛选
  const hasActiveFilters = params.category || params.min_rating || params.platform;

  return (
    <div className="space-y-3">
      {/* 筛选和排序控件 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 类目筛选 */}
        <Select
          value={params.category || "all"}
          onValueChange={(v) => updateParam("category", v || undefined)}
        >
          <SelectTrigger className="h-9 w-[130px] text-sm">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 评分筛选 */}
        <Select
          value={params.min_rating ? String(params.min_rating) : "all"}
          onValueChange={(v) => {
            if (!v || v === "all") {
              updateParam("min_rating", undefined);
            } else {
              updateParam("min_rating", parseFloat(v));
            }
          }}
        >
          <SelectTrigger className="h-9 w-[140px] text-sm">
            <SelectValue placeholder="全部分数" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分数</SelectItem>
            {RATING_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 平台筛选 */}
        <Select
          value={params.platform || "all"}
          onValueChange={(v) => updateParam("platform", v || undefined)}
        >
          <SelectTrigger className="h-9 w-[120px] text-sm">
            <SelectValue placeholder="全部平台" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部平台</SelectItem>
            {platforms.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 排序选择 */}
        <Select
          value={currentSortKey}
          onValueChange={(v) => {
            if (!v) return;
            const option = SORT_OPTIONS[parseInt(v)];
            updateParam("sort_by", option.field);
            onParamsChange({
              ...params,
              sort_by: option.field,
              sort_order: option.order,
              page: 1,
            });
          }}
        >
          <SelectTrigger className="h-9 w-[155px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option, i) => (
              <SelectItem key={i} value={String(i)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 清除筛选按钮 */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs text-muted-foreground"
            onClick={clearFilters}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            清除筛选
          </Button>
        )}
      </div>

      {/* 活跃筛选标签 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {params.category && (
            <FilterBadge
              label={`分类: ${params.category}`}
              onRemove={() => updateParam("category", undefined)}
            />
          )}
          {params.min_rating && (
            <FilterBadge
              label={`评分 ≥ ${params.min_rating}`}
              onRemove={() => updateParam("min_rating", undefined)}
            />
          )}
          {params.platform && (
            <FilterBadge
              label={`平台: ${params.platform}`}
              onRemove={() => updateParam("platform", undefined)}
            />
          )}
        </div>
      )}
    </div>
  );
}

/** 可移除的筛选标签 */
function FilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge variant="secondary" className="h-6 gap-1 pl-2 pr-1 text-xs">
      {label}
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 hover:bg-transparent"
        onClick={onRemove}
        aria-label={`移除${label}筛选`}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
}
