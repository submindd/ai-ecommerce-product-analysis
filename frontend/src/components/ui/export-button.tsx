"use client";

/**
 * Excel 导出按钮组件
 * 调用后端导出 API，触发浏览器 .xlsx 文件下载
 */

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface ExportButtonProps {
  endpoint: "products" | "analysis-report" | "profit-report";
  label?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm";
  className?: string;
  /** 利润报表额外参数 */
  profitParams?: {
    product_cost?: number;
    shipping?: number;
    commission_rate?: number;
    advertising_cost?: number;
  };
}

export function ExportButton({
  endpoint,
  label,
  variant = "outline",
  size = "sm",
  className,
  profitParams,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const defaultLabels: Record<string, string> = {
    "products": "导出商品列表",
    "analysis-report": "导出分析报告",
    "profit-report": "导出利润报表",
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/v1/export/${endpoint}`;

      // 利润报表附加查询参数
      if (endpoint === "profit-report" && profitParams) {
        const params = new URLSearchParams();
        if (profitParams.product_cost != null) params.set("product_cost", String(profitParams.product_cost));
        if (profitParams.shipping != null) params.set("shipping", String(profitParams.shipping));
        if (profitParams.commission_rate != null) params.set("commission_rate", String(profitParams.commission_rate));
        if (profitParams.advertising_cost != null) params.set("advertising_cost", String(profitParams.advertising_cost));
        const qs = params.toString();
        if (qs) url += `?${qs}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("导出失败");

      // 获取文件名
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      const filename = filenameMatch?.[1]?.replace(/['"]/g, "") || `${endpoint}.xlsx`;

      // 触发下载
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = decodeURIComponent(filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("导出失败:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={loading}
      className={cn("gap-1.5", className)}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      {label || defaultLabels[endpoint] || "导出"}
    </Button>
  );
}
