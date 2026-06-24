"use client";

/**
 * 商品列表页
 * 集成搜索、筛选、排序和分页功能
 */

import { useState, useEffect, useCallback } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterBar } from "@/components/ui/filter-bar";
import { ProductCard } from "@/components/ui/product-card";
import { Pagination } from "@/components/ui/pagination";
import { ProductCardSkeleton } from "@/components/ui/product-card-skeleton";
import { getProducts, getCategories, getPlatforms, getShopeeProducts } from "@/lib/api";
import type { Product, ProductQueryParams } from "@/types/product";
import { PackageOpen, Download } from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";
import { usePlatform } from "@/components/platform-provider";
import { PLATFORM_CONFIGS } from "@/types/platform";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const { platform } = usePlatform();
  // ========== 状态管理 ==========
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [params, setParams] = useState<ProductQueryParams>({
    page: 1,
    page_size: 12,
    sort_by: "score",
    sort_order: "desc",
    platform: platform, // 初始平台
  });

  // 平台切换时同步到筛选参数
  useEffect(() => {
    setParams((prev) => ({ ...prev, platform, page: 1 }));
  }, [platform]);

  // ========== 加载筛选选项 ==========
  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
    getPlatforms().then(setPlatforms).catch(() => setPlatforms([]));
  }, []);

  // ========== 加载商品列表 ==========
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Shopee 使用真实爬虫接口，其他平台使用通用 mock 接口
      let data;
      if (params.platform === "shopee") {
        try {
          const shopeeData = await getShopeeProducts(params.keyword || "热销", 50);
          console.log("[Shopee] API返回:", { total: shopeeData.total, mode: shopeeData.mode, productsLen: shopeeData.products?.length, error: (shopeeData as Record<string,unknown>)?.error });
          const items = Array.isArray(shopeeData.products) ? shopeeData.products : [];
          data = {
            items: items as Product[],
            total: shopeeData.total || items.length,
            page: params.page || 1,
            page_size: params.page_size || 50,
            total_pages: Math.ceil((shopeeData.total || items.length) / (params.page_size || 50)),
          };
        } catch (shopeeErr) {
          // Shopee 接口失败 → 降级到通用接口
          console.warn("[Shopee] 接口失败，降级到通用Mock:", shopeeErr);
          data = await getProducts(params);
        }
      } else {
        data = await getProducts(params);
      }
      console.log("[Products] 加载完成:", { total: data.total, itemsLen: data.items?.length, platform: params.platform });
      setProducts(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("[Products] 加载失败:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ========== 搜索处理 ==========
  const handleSearchChange = useCallback((keyword: string) => {
    setParams((prev) => ({ ...prev, keyword: keyword || undefined, page: 1 }));
  }, []);

  // ========== 分页处理 ==========
  const handlePageChange = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col flex-1">
      {/* ========== 顶栏：搜索 + 筛选 ========== */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-7xl px-4 py-4">
          {/* 平台 + 搜索栏 */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {PLATFORM_CONFIGS[platform].label}
            </Badge>
            <div className="flex-1 max-w-xl">
              <SearchBar
                value={params.keyword || ""}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* 筛选栏 */}
          <FilterBar
            categories={categories}
            platforms={platforms}
            params={params}
            onParamsChange={setParams}
          />
        </div>
      </div>

      {/* ========== 结果信息栏 ========== */}
      <div className="mx-auto w-full max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {params.keyword ? (
              <>
                搜索 &quot;
                <span className="font-medium text-foreground">
                  {params.keyword}
                </span>
                &quot; 的结果
              </>
            ) : (
              "全部商品"
            )}
          </span>
          <span>
            共 <span className="font-medium text-foreground">{total}</span>{" "}
            件商品
          </span>
        </div>
        <div className="flex justify-end mt-2">
          <ExportButton endpoint="products" />
        </div>
      </div>

      {/* ========== 商品网格 ========== */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-8">
        {loading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <PackageOpen className="h-16 w-16 mb-4 stroke-1" />
            <p className="text-lg font-medium">暂无符合条件的商品</p>
            <p className="text-sm mt-1">请调整筛选条件或搜索关键词</p>
          </div>
        ) : (
          <>
            {/* 商品卡片网格 */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* 分页器 */}
            <div className="mt-8">
              <Pagination
                page={params.page || 1}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** 骨架屏占位网格 */
function ProductGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
