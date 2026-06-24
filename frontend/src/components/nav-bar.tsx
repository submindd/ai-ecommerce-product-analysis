"use client";

/**
 * 顶部导航栏
 * 包含品牌 Logo、页面链接和深色模式切换
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, ShoppingBag, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { PlatformTabs } from "@/components/platform-tabs";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "首页", icon: null },
  { href: "/products", label: "商品列表", icon: ShoppingBag },
  { href: "/profit-calculator", label: "利润计算器", icon: Calculator },
];

export function NavBar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* 品牌 Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-foreground hover:opacity-80 transition-opacity"
        >
          <span className="hidden sm:inline bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI 智能选品
          </span>
          <span className="sm:hidden bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-sm">
            AI选品
          </span>
        </Link>

        {/* 平台切换 Tab */}
        <PlatformTabs />

        {/* 导航链接 */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="hidden sm:inline">{link.label.split(":")[0]}</span>
              </Link>
            );
          })}

          {/* 深色模式切换 */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 h-8 w-8"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "切换浅色模式" : "切换深色模式"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}
