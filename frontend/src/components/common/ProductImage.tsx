"use client";

/**
 * 商品图片容错组件
 * ==================
 * 安全处理所有图片异常情况，禁止页面因图片问题崩溃：
 *
 * 容错场景：
 *   - null / undefined     → 显示占位图
 *   - 空字符串 ""           → 显示占位图
 *   - 无效 URL（不含 ://）  → 显示占位图
 *   - HTTP 403 / 404        → onError 自动切换占位图
 *   - 网络加载失败           → onError 自动切换占位图
 *
 * 用法：
 *   <ProductImage src={product.image_url} alt={product.title} fill />
 *   <ProductImage src={product.image_url} alt="商品图" width={200} height={200} />
 */

import { useState, useCallback } from "react";
import Image from "next/image";

/** 占位图路径 */
const PLACEHOLDER = "/placeholder.svg";

/**
 * 校验图片 URL 是否安全可用
 * 返回清洗后的 URL，无效则返回 null
 */
function validateImageUrl(url: unknown): string | null {
  // null / undefined 检查
  if (url == null) return null;

  // 非字符串
  if (typeof url !== "string") return null;

  // 空字符串或空白
  const trimmed = url.trim();
  if (trimmed === "") return null;

  // 无效 URL（不包含协议分隔符）
  if (!trimmed.includes("://")) return null;

  return trimmed;
}

// ========== Props ==========
interface ProductImageProps {
  src: unknown;                     // 接受任何类型的图片源（容错核心）
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "object-cover",
  sizes,
  priority = false,
}: ProductImageProps) {
  // 清洗并校验 URL
  const validSrc = validateImageUrl(src);
  const [hasError, setHasError] = useState(!validSrc);

  /**
   * 图片加载失败回调
   * 网络错误 / 403 / 404 时自动切换到占位图
   */
  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
    }
  }, [hasError]);

  // ========== 渲染安全图片 ==========
  const imageSrc = hasError ? PLACEHOLDER : (validSrc as string);

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        priority={priority}
        onError={handleError}
        unoptimized={hasError}  // 占位图无需 Next.js 优化
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={className}
      priority={priority}
      onError={handleError}
      unoptimized={hasError}
    />
  );
}
