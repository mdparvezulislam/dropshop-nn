"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Boxes,
  Tag,
  Layers,
  ShoppingCart,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { Spinner } from "@/shared/components/ui/spinner";
import { cn } from "@/shared/utils/cn";

export default function WholesaleProductDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const { getProductAction } = await import("@/features/catalog/actions/product-actions");
        const res = await getProductAction(params.id as string);
        if (res.success) {
          setProduct(res.data);
        } else {
          toast.error("Product not found");
        }
      } catch {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <PageHeader title="Product Not Found" />
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Product not found.</CardContent></Card>
      </div>
    );
  }

  const p = product;
  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const wholesalePrice = p.wholesalePrice ?? p.pricing?.wholesale ?? 0;
  const retailPrice = p.retailPrice ?? p.pricing?.retail ?? 0;
  const costPrice = p.costPrice ?? p.pricing?.cost ?? 0;
  const moq = p.moq ?? p.minOrderQuantity ?? 1;
  const stock = p.stock ?? p.inventory?.available ?? 0;

  const tierPricing = p.tierPricing ?? p.pricing?.tiers ?? [];

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/wholesale/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title={p.title ?? p.name} description={`SKU: ${p.sku ?? "—"} · ${p.categoryName ?? p.category ?? "Uncategorized"}`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm text-muted-foreground leading-relaxed">
              {p.description ?? "—"}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Tier Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {tierPricing.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tier pricing configured.</p>
              ) : (
                <div className="divide-y divide-border">
                  {tierPricing.map((tier: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="text-muted-foreground">{tier.label ?? `Qty ${tier.minQty ?? "—"}`}</span>
                      <span className="font-semibold tabular-nums">{formatCents(tier.price ?? 0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wholesale</span>
                <span className="font-bold text-lg text-success">{formatCents(wholesalePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retail</span>
                <span>{formatCents(retailPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost</span>
                <span className="text-muted-foreground">{formatCents(costPrice)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-muted-foreground" />
                <span>MOQ: <strong>{moq}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>Stock: <strong className={stock <= 0 ? "text-destructive" : "text-success"}>{stock}</strong></span>
              </div>
              {p.brand ? (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>Brand: <strong>{p.brandName ?? p.brand}</strong></span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Link href="/wholesale/bulk-orders">
            <Button className="w-full gap-1.5">
              <ShoppingCart className="h-4 w-4" /> Request Bulk Order
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
