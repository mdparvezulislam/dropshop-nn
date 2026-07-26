"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductDashboardStatsAction } from "@/features/catalog/actions/product-dashboard-actions";
import { listProductsAction } from "@/features/catalog/actions/product-actions";
import { toast } from "sonner";
import {
  Package,
  Clock,
  FileText,
  CheckCircle,
  Archive,
  ImageOff,
  SearchX,
  PackageX,
  RefreshCw,
  RefreshCcw,
  Calendar,
  Heart,
  AlertTriangle,
  Layers,
  Unlink,
  List,
  Plus,
  Users,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  sublabel,
  value,
  textColor,
}: {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  value: number;
  textColor?: string;
}) {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`h-4 w-4 ${textColor || "text-muted-foreground"}`} />
          <div>
            <p className="text-xs text-muted-foreground leading-tight">{sublabel}</p>
            <p className="text-[10px] text-muted-foreground/60">{label}</p>
          </div>
        </div>
        <p className={`text-xl font-bold ${textColor || ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export default function ProductActivityPage(): React.ReactElement {
  const [stats, setStats] = React.useState<Record<string, number>>({});
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        getProductDashboardStatsAction(),
        listProductsAction({}, { limit: 50 }),
      ]);
      if (s.success && s.data) setStats(s.data);
      if (p.success && p.data) {
        const d = p.data as any;
        const sorted = (d.items ?? [])
          .slice()
          .sort(
            (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          );
        setProducts(sorted.slice(0, 20));
      }
    } catch {
      toast.error("Failed to load product dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const statusVariant = (s: string) => {
    switch (s) {
      case "active":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "muted";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!products.length && Object.keys(stats).length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <p className="text-muted-foreground">কোনো তথ্য পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">পণ্য অ্যাক্টিভিটি ড্যাশবোর্ড</h1>
          <p className="text-sm text-muted-foreground">Product Activity Dashboard</p>
        </div>
        <Button variant="ghost" size="icon" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <StatCard
          icon={Package}
          label="Total Products"
          sublabel="মোট পণ্য"
          value={stats.total ?? 0}
        />
        <StatCard
          icon={Clock}
          label="Recently Created"
          sublabel="সম্প্রতি তৈরি"
          value={stats.recentlyCreated ?? 0}
          textColor="text-blue-400"
        />
        <StatCard
          icon={FileText}
          label="Draft Products"
          sublabel="খসড়া পণ্য"
          value={stats.draft ?? 0}
          textColor="text-amber-400"
        />
        <StatCard
          icon={CheckCircle}
          label="Active Products"
          sublabel="সক্রিয় পণ্য"
          value={stats.active ?? 0}
          textColor="text-emerald-400"
        />
        <StatCard
          icon={Archive}
          label="Archived"
          sublabel="আর্কাইভ"
          value={stats.archived ?? 0}
          textColor="text-muted-foreground"
        />
        <StatCard
          icon={ImageOff}
          label="Missing Images"
          sublabel="ছবি নেই"
          value={stats.missingImages ?? 0}
          textColor="text-rose-400"
        />
        <StatCard
          icon={SearchX}
          label="Missing SEO"
          sublabel="SEO নেই"
          value={stats.missingSEO ?? 0}
          textColor="text-orange-400"
        />
        <StatCard
          icon={PackageX}
          label="Out of Stock"
          sublabel="স্টক নেই"
          value={stats.outOfStock ?? 0}
          textColor="text-red-400"
        />
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={RefreshCcw}
          label="Recently Updated"
          sublabel="সম্প্রতি হালনাগাদ"
          value={stats.recentlyUpdated ?? 0}
        />
        <StatCard
          icon={Calendar}
          label="Scheduled"
          sublabel="নির্ধারিত"
          value={stats.scheduled ?? 0}
        />
        <StatCard
          icon={Heart}
          label="Low Health Products"
          sublabel="নিম্ন স্বাস্থ্য"
          value={stats.lowHealth ?? 0}
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          sublabel="স্বল্প স্টক"
          value={stats.lowStock ?? 0}
        />
        <StatCard
          icon={Layers}
          label="Has Variants"
          sublabel="ভ্যারিয়েন্ট আছে"
          value={stats.hasVariants ?? 0}
        />
        <StatCard
          icon={Unlink}
          label="No Category"
          sublabel="ক্যাটাগরি নেই"
          value={stats.noCategory ?? 0}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/products">
          <Button variant="outline">
            <List className="h-4 w-4" />
            Product List
          </Button>
        </Link>
        <Link href="/dashboard/products/new">
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Create Product
          </Button>
        </Link>
        <Link href="/dashboard/orders/customers">
          <Button variant="outline">
            <Users className="h-4 w-4" />
            Customer Ops
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            সাম্প্রতিক কার্যকলাপ / Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="p-5 text-sm text-muted-foreground">কোনো তথ্য পাওয়া যায়নি</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase">
                    <th className="text-left p-3 font-semibold">Product</th>
                    <th className="text-left p-3 font-semibold">SKU</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Updated</th>
                    <th className="text-center p-3 font-semibold">Image</th>
                    <th className="text-center p-3 font-semibold">SEO</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p: any) => (
                    <tr key={p.id} className="border-b border-border/30 hover:bg-muted/50">
                      <td className="p-3">
                        <Link
                          href={`/dashboard/products/${p.id}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {p.name || p.title || "Untitled"}
                        </Link>
                      </td>
                      <td className="p-3 text-muted-foreground">{p.sku}</td>
                      <td className="p-3">
                        <Badge variant={statusVariant(p.status)} size="xs">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={p.media?.length ? "success" : "destructive"} size="xs">
                          {p.media?.length ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={p.seo ? "success" : "destructive"} size="xs">
                          {p.seo ? "Yes" : "No"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
