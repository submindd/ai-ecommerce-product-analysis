"use client";

/**
 * 分页组件
 * 支持页码导航、上一页/下一页、省略号
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // 生成页码列表（含省略号逻辑）
  const pages = generatePageNumbers(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="分页导航">
      {/* 上一页 */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="上一页"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* 页码按钮 */}
      {pages.map((pageNum, index) => {
        if (pageNum === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
            >
              ...
            </span>
          );
        }
        const isActive = pageNum === page;
        return (
          <Button
            key={pageNum}
            variant={isActive ? "default" : "outline"}
            size="icon"
            className="h-9 w-9 text-sm"
            onClick={() => onPageChange(pageNum as number)}
            aria-current={isActive ? "page" : undefined}
            aria-label={`第 ${pageNum} 页`}
          >
            {pageNum}
          </Button>
        );
      })}

      {/* 下一页 */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="下一页"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

/**
 * 生成分页页码数组
 * 示例：[1, '...', 4, 5, 6, '...', 10]
 */
function generatePageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  // 始终显示第一页
  pages.push(1);

  if (current > 3) {
    pages.push("...");
  }

  // 当前页附近的页码
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  // 始终显示最后一页
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}
