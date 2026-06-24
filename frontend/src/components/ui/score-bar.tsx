"use client";

/**
 * 评分进度条组件
 * 用于展示单个评分维度的得分（带动画）
 */

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

// ========== 维度配置 ==========
const DIMENSION_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  sales_score: { label: "销量表现", color: "bg-violet-500", bg: "bg-violet-100" },
  rating_score: { label: "商品评分", color: "bg-amber-500", bg: "bg-amber-100" },
  reviews_score: {
    label: "社交验证（评论数）",
    color: "bg-emerald-500",
    bg: "bg-emerald-100",
  },
  price_score: {
    label: "价格竞争力",
    color: "bg-sky-500",
    bg: "bg-sky-100",
  },
};

interface ScoreBarProps {
  dimension: string;
  value: number;
  maxValue?: number;
  showLabel?: boolean;
  animate?: boolean;
}

export function ScoreBar({
  dimension,
  value,
  maxValue = 100,
  showLabel = true,
  animate = true,
}: ScoreBarProps) {
  const [width, setWidth] = useState(animate ? 0 : value);
  const barRef = useRef<HTMLDivElement>(null);
  const config = DIMENSION_CONFIG[dimension] || {
    label: dimension,
    color: "bg-gray-500",
    bg: "bg-gray-100",
  };

  useEffect(() => {
    if (!animate) {
      setWidth(value);
      return;
    }

    // Intersection Observer 触发入口动画
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 延迟触发动画更自然
          setTimeout(() => setWidth(value), 150);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (barRef.current) {
      observer.observe(barRef.current);
    }

    return () => observer.disconnect();
  }, [value, animate]);

  // 进度条颜色指示
  const getBarLevel = () => {
    if (value >= 80) return config.color;
    if (value >= 50) return config.color.replace("500", "400");
    return config.color.replace("500", "300");
  };

  return (
    <div ref={barRef} className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{config.label}</span>
          <span className="font-semibold tabular-nums text-foreground">
            {value.toFixed(0)}
            <span className="text-xs text-muted-foreground font-normal">
              /{maxValue}
            </span>
          </span>
        </div>
      )}
      <div className={cn("h-2.5 w-full overflow-hidden rounded-full", config.bg)}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            getBarLevel()
          )}
          style={{ width: `${(width / maxValue) * 100}%` }}
        />
      </div>
    </div>
  );
}
