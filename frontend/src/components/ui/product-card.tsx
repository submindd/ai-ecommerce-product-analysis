"use client";

/**
 * 商品卡片组件
 * 展示商品图片、标题、价格、评分、销量等关键信息
 */

import Link from "next/link";
import { ProductImage } from "@/components/common/ProductImage";
import { Star, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreBadge } from "@/components/ui/score-badge";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // 格式化价格显示
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price);

  // 格式化销量显示
  const formattedSales =
    product.sales >= 10000
      ? `${(product.sales / 10000).toFixed(1)}万`
      : product.sales >= 1000
        ? `${(product.sales / 1000).toFixed(1)}k`
        : String(product.sales);

  return (
    <Link href={`/products/${product.id}`} title={product.title}>
      <Card className="group h-full overflow-hidden border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        {/* 商品图片 */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <ProductImage
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* 来源平台徽章 */}
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 text-xs font-normal backdrop-blur-sm"
          >
            {product.category}
          </Badge>
          {/* 推荐评分徽章 */}
          {product.composite_score != null && product.score_tier && (
            <div className="absolute top-2 right-2">
              <ScoreBadge
                score={product.composite_score}
                tier={product.score_tier}
                size="sm"
                showScore={false}
              />
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* 商品标题 */}
          <h3 className="line-clamp-2 text-sm font-medium text-foreground leading-snug mb-2 min-h-[2.5em]">
            {product.title}
          </h3>

          {/* 价格行 */}
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-xl font-bold text-foreground">
              {formattedPrice}
            </span>
          </div>

          {/* 评分和评论 */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{product.rating}</span>
            <span>({product.reviews.toLocaleString()})</span>
          </div>

          {/* 店铺和销量 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate max-w-[60%]">{product.store}</span>
            <span className="flex items-center gap-0.5 flex-shrink-0">
              <Package className="h-3 w-3" />
              已售 {formattedSales}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
