"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Package, DollarSign, Boxes, Tag, Edit3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { Spinner } from "@/shared/components/ui/spinner";

export default function SupplierProductDetailPage(): React.ReactElement {
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

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  if (!product) return <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Product not found.</CardContent></Card>;

  const p = product;
  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/supplier/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={p.title ?? p.name}
          description={`SKU: ${p.sku ?? "—"} · ${p.categoryName ?? p.category ?? "Uncategorized"}`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Description</CardTitle></CardHeader>
            <CardContent className="p-4 text-sm text-muted-foreground leading-relaxed">
              {p.description ?? "—"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Variants</CardTitle></CardHeader>
            <CardContent className="p-4">
              {p.variants?.length ? (
                <div className="divide-y divide-border text-sm">
                  {p.variants.map((v: any, i: number) => (
                    <div key={i} className="flex justify-between py-2">
                      <span>{v.label ?? v.name ?? v.sku}</span>
                      <span className="tabular-nums text-muted-foreground">{v.sku}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No variants.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Details</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusChip label={p.status} tone={statusToneFromValue(p.status)} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-semibold">{formatCents(p.retailPrice ?? p.pricing?.retail ?? 0)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Stock</span><span>{p.stock ?? p.inventory?.available ?? 0}</span></div>
              {p.brand ? <div className="flex justify-between"><span className="text-muted-foreground">Brand</span><span>{p.brandName ?? p.brand}</span></div> : null}
            </CardContent>
          </Card>
          <Link href={`/supplier/products/${params.id}/edit`}>
            <Button className="w-full gap-1.5"><Edit3 className="h-4 w-4" /> Edit Product</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
