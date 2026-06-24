"use client";

/**
 * 搜索栏组件
 * 支持关键词搜索，带防抖和键盘快捷键
 */

import { useEffect, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "搜索商品名称、类目...",
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // 同步外部 value 变化
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // 防抖处理：用户停止输入 300ms 后触发搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  // 清除搜索
  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
  }, [onChange]);

  // 键盘快捷键：ESC 清除搜索
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleClear();
      }
    },
    [handleClear]
  );

  return (
    <div className="relative w-full max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-10 pl-9 pr-10 text-sm bg-card border-border focus-visible:ring-1 transition-shadow"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
          aria-label="清除搜索"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
