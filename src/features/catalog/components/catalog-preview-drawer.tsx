"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Package,
  FileEdit,
  ExternalLink,
  Activity,
  Warehouse,
  Tag,
  Share2,
  X,
  Star,
} from "lucide-react";
import { getProductAction } from "../actions/product-actions";
import { useHealthScore } from "@/features/product-studio/hooks/use-health-score";
import { toast } from "sonner";

export interface CatalogPreviewDrawerProps {
  productId: string | null;
  onClose: () => void;
}

export function CatalogPreviewDrawer({
  productId,
  onClose,
}: CatalogPreviewDrawerProps): React.ReactElement {
  const [product, setProduct] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await getProductAction(productId);
        if (res.success && res.data) {
          setProduct(res.data);
        }
      } catch {
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  const healthResult = useHealthScore({
    name: product?.title ?? product?.name ?? "",
    sku: product?.sku ?? "",
    shortDescription: product?.shortDescription ?? "",
    richDescription: product?.richDescription ?? product?.description ?? "",
    productModel: product?.productModel ?? "",
    barcode: product?.barcode ?? "",
    brandId: product?.brandId ?? product?.brand?.id ?? "",
    categoryId: product?.categoryId ?? product?.category?.id ?? "",
    supplierId: product?.supplierId ?? "",
    costPrice: String(product?.costPrice ?? 0),
    sellingPrice: String(product?.retailPrice ?? product?.price ?? 0),
    wholesalePrice: String(product?.wholesalePrice ?? 0),
    resellerPrice: String(product?.resellerPrice ?? 0),
    comparePrice: String(product?.comparePrice ?? 0),
    stock: String(product?.stockQuantity ?? product?.stock ?? 0),
    lowStockThreshold: "5",
    media: (product?.images ?? []).map((url: string, i: number) => ({
      id: `m-${i}`,
      url,
      type: "image",
      isFeatured: i === 0,
    })),
    slug: product?.slug ?? "",
    metaTitle: product?.seo?.metaTitle ?? "",
    metaDescription: product?.seo?.metaDescription ?? "",
    productType: "simple",
    templateId: "",
    brandName: "",
    categoryName: "",
    variants: [],
    tags: [],
    visibility: "public",
    status: product?.status ?? "draft",
    featured: false,
    trending: false,
    flashSale: false,
    newArrival: true,
    warranty: "",
    returnPolicy: "",
    inventorySku: "",
    inventoryBarcode: "",
    reservedStock: "0",
    incomingStock: "0",
    warehouseLocation: "",
    weight: "0.5",
    campaignPrice: "",
    metaKeywords: [],
    ogImage: "",
    bulletFeatures: [],
    selectedCollectionIds: [],
    channels: [],
    supplierSku: "",
    supplierCost: "",
    leadTimeDays: "",
    purchaseLink: "",
    supplierNotes: "",
    relationships: [],
    scheduledPublishDate: "",
    scheduledPublishTime: "",
    scheduledUnpublishDate: "",
    timezone: "Asia/Dhaka (GMT+6)",
    manualPriceOverrides: {},
  });

  const handleCopyUrl = () => {
    if (!product) return;
    const url = `${window.location.origin}/products/${product.slug || product.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Product URL copied!");
  };

  return (
    <Sheet open={Boolean(productId)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md border-l border-border bg-card p-6 shadow-2xl overflow-y-auto ws-scroll">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Badge
              variant={product?.status === "active" ? "success" : "warning"}
              size="xs"
              className="font-bold"
            >
              {product?.status === "active" ? "সক্রিয় (Active)" : "খসড়া (Draft)"}
            </Badge>
            <Link href={`/dashboard/products/${productId}/edit`}>
              <Button size="sm" className="gap-1.5 font-bold shadow-xs">
                <FileEdit className="h-3.5 w-3.5" /> Open in Product Studio
              </Button>
            </Link>
          </div>
          <SheetTitle className="text-base font-extrabold text-foreground pt-2 line-clamp-2">
            {loading
              ? "Loading product..."
              : (product?.title ?? product?.name ?? "Untitled Product")}
          </SheetTitle>
          <p className="text-xs font-mono text-muted-foreground">{product?.sku ?? "SKU-PROD"}</p>
        </SheetHeader>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
            Loading preview…
          </div>
        ) : product ? (
          <div className="space-y-5 pt-4">
            {/* Primary Media Zoom Preview */}
            <div className="aspect-[4/3] rounded-2xl border border-border bg-muted/30 overflow-hidden shadow-2xs">
              {product.images?.[0] ? (
                <img
                  src={
                    typeof product.images[0] === "string"
                      ? product.images[0]
                      : product.images[0].url
                  }
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Package className="h-10 w-10 text-primary" />
                </div>
              )}
            </div>

            {/* Product Health Score Gauge */}
            <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Product Health Score
                </span>
                <span className="font-mono text-xs font-extrabold text-primary">
                  {healthResult.score}/100
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div style={{ width: `${healthResult.score}%` }} className="h-full bg-primary" />
              </div>
            </div>

            {/* Multi-Tier Pricing Matrix */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Multi-Tier Pricing Matrix
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl border border-border bg-card">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    Retail Customer
                  </p>
                  <p className="text-sm font-extrabold font-mono text-foreground">
                    ৳{(product.retailPrice ?? product.price ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-card">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    Cost Price
                  </p>
                  <p className="text-sm font-extrabold font-mono text-muted-foreground">
                    ৳{(product.costPrice ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Inventory Breakdown */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Warehouse Allocation
              </p>
              <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Warehouse className="h-3.5 w-3.5 text-primary" /> Available Stock
                </span>
                <span className="font-mono text-sm font-extrabold text-foreground">
                  {product.stockQuantity ?? product.stock ?? 0} pcs
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5 font-bold text-xs"
                onClick={handleCopyUrl}
              >
                <Share2 className="h-3.5 w-3.5" /> Copy Link
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
