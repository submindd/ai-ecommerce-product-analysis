"use client";

/**
 * 平台切换 Tab 组件
 * 显示在导航栏中，支持 hover 动效和选中高亮
 */

import { cn } from "@/lib/utils";
import { usePlatform } from "@/components/platform-provider";
import { PLATFORM_CONFIGS, type PlatformType } from "@/types/platform";

export function PlatformTabs() {
  const { platform, setPlatform } = usePlatform();
  const platforms = Object.values(PLATFORM_CONFIGS);

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
      {platforms.map((p) => {
        const isActive = platform === p.key;
        return (
          <button
            key={p.key}
            onClick={() => setPlatform(p.key)}
            className={cn(
              // 基础样式
              "relative rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
              // hover 动效
              "hover:scale-105",
              // 选中态：白底 + 阴影
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            {/* 平台名称 */}
            <span className="hidden sm:inline">{p.label}</span>
            {/* 移动端短名称 */}
            <span className="sm:hidden">{p.shortLabel}</span>

            {/* mock 标记（小圆点） */}
            {p.dataMode === "mock" && (
              <span
                className={cn(
                  "absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full",
                  p.activeColor
                )}
                title="Mock 数据模式"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
