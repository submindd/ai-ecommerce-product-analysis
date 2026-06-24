/**
 * 平台类型定义
 * 统一管理四大跨境电商平台
 */

/** 平台标识 */
export type PlatformType = "shopee" | "amazon" | "tiktok" | "aliexpress";

/** 平台配置（名称、图标简写、颜色、数据模式） */
export interface PlatformConfig {
  key: PlatformType;
  label: string;
  shortLabel: string;
  color: string;          // 文字色
  activeColor: string;    // 选中态背景
  bgColor: string;        // 浅色背景
  borderColor: string;    // 边框色
  gradientFrom: string;   // 渐变起始
  gradientTo: string;     // 渐变结束
  dataMode: "live" | "mock";
}

/** 平台配置表 */
export const PLATFORM_CONFIGS: Record<PlatformType, PlatformConfig> = {
  shopee: {
    key: "shopee",
    label: "Shopee",
    shortLabel: "虾皮",
    color: "text-orange-600",
    activeColor: "bg-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    gradientFrom: "from-orange-50",
    gradientTo: "to-orange-100/50",
    dataMode: "live",
  },
  amazon: {
    key: "amazon",
    label: "Amazon",
    shortLabel: "亚马逊",
    color: "text-amber-600",
    activeColor: "bg-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    gradientFrom: "from-amber-50",
    gradientTo: "to-amber-100/50",
    dataMode: "mock",
  },
  tiktok: {
    key: "tiktok",
    label: "TikTok Shop",
    shortLabel: "TK",
    color: "text-pink-600",
    activeColor: "bg-pink-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    gradientFrom: "from-pink-50",
    gradientTo: "to-pink-100/50",
    dataMode: "mock",
  },
  aliexpress: {
    key: "aliexpress",
    label: "速卖通",
    shortLabel: "速卖通",
    color: "text-red-600",
    activeColor: "bg-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    gradientFrom: "from-red-50",
    gradientTo: "to-red-100/50",
    dataMode: "mock",
  },
};
