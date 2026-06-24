"use client";

/**
 * 评分徽章组件
 * 显示商品推荐等级和综合得分
 */

import { cn } from "@/lib/utils";

// ========== 等级对应的样式映射 ==========
const TIER_STYLES: Record<string, string> = {
  "强烈推荐": "bg-green-50 text-green-700 border-green-200",
  "值得考虑": "bg-blue-50 text-blue-700 border-blue-200",
  "一般": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "观望": "bg-muted text-muted-foreground border-border",
};

const TIER_DOT: Record<string, string> = {
  "强烈推荐": "bg-green-500",
  "值得考虑": "bg-blue-500",
  "一般": "bg-yellow-500",
  "观望": "bg-gray-400",
};

interface ScoreBadgeProps {
  score: number;
  tier: string;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
}

export function ScoreBadge({
  score,
  tier,
  size = "md",
  showScore = true,
}: ScoreBadgeProps) {
  const style = TIER_STYLES[tier] || TIER_STYLES["观望"];
  const dot = TIER_DOT[tier] || TIER_DOT["观望"];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        style,
        sizeClasses[size]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {tier}
      {showScore && (
        <span className="font-bold tabular-nums">{score.toFixed(1)}</span>
      )}
    </span>
  );
}
