"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import { EmptyState } from "@/shared/components/ui/empty-state";
import {
  assignProductAction,
  favoriteResellerProductAction,
  hideResellerProductAction,
  removeResellerProductAction,
} from "@/features/reseller/actions/reseller-actions";
import { toast } from "sonner";
import { ArrowLeft, Search, Plus, Heart, EyeOff, Trash2, DollarSign } from "lucide-react";
import { formatCentsToCurrency } from "@/shared/utils/currency-utils";

type CatalogItem = {
  id: string;
  productId: string;
  title: string;
  customTitle: string;
  variantSku: string;
  sellingStatus: "draft" | "active" | "hidden" | "out_of_catalog";
  isFavorite: boolean;
  isHidden: boolean;
  pricing: {
    sellingPrice: number;
    recommendedPrice: number;
    profitMargin: number;
    currency: string;
  };
};

const MOCK_PRODUCTS: CatalogItem[] = [
  {
    id: "rp1",
    productId: "p1",
    title: "iPhone 16 Pro Max",
    customTitle: "iPhone 16 Pro Max — Nova Edition",
    variantSku: "APL-IPH16PM-256-BLK",
    sellingStatus: "active",
    isFavorite: true,
    isHidden: false,
    pricing: {
      sellingPrice: 124900,
      recommendedPrice: 119900,
      profitMargin: 22.5,
      currency: "USD",
    },
  },
  {
    id: "rp2",
    productId: "p2",
    title: "Galaxy S24 Ultra",
    customTitle: "",
    variantSku: "SAM-S24U-512-TIT",
    sellingStatus: "hidden",
    isFavorite: false,
    isHidden: true,
    pricing: {
      sellingPrice: 109900,
      recommendedPrice: 109900,
      profitMargin: 18.0,
      currency: "USD",
    },
  },
  {
    id: "rp3",
    productId: "p3",
    title: "AirPods Pro 2",
    customTitle: "",
    variantSku: "APL-APP2-USB-C",
    sellingStatus: "draft",
    isFavorite: true,
    isHidden: false,
    pricing: {
      sellingPrice: 24900,
      recommendedPrice: 24900,
      profitMargin: 15.2,
      currency: "USD",
    },
  },
];

function ProductsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const resellerId = String(params.id);
  const showAssign = searchParams.get("assign") === "1";

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [products, setProducts] = React.useState(MOCK_PRODUCTS);
  const [assignOpen, setAssignOpen] = React.useState(showAssign);
  const [assignForm, setAssignForm] = React.useState({
    productId: "",
    variantSku: "",
    customTitle: "",
  });
  const [assigning, setAssigning] = React.useState(false);

  const filtered = products.filter((p) => {
    const name = (p.customTitle || p.title).toLowerCase();
    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      p.variantSku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      p.sellingStatus === statusFilter ||
      (statusFilter === "favorite" && p.isFavorite);
    return matchesSearch && matchesStatus;
  });

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssigning(true);
    try {
      const res = await assignProductAction({
        resellerId,
        productId: assignForm.productId.trim(),
        variantSku: assignForm.variantSku.trim() || undefined,
        customTitle: assignForm.customTitle.trim() || undefined,
      });
      if (res.success && res.data) {
        toast.success("Product added to reseller catalog (master unchanged)");
        setProducts((prev) => [
          {
            id: res.data!.id,
            productId: res.data!.productId,
            title: "Assigned product",
            customTitle: res.data!.customTitle || "",
            variantSku: res.data!.variantSku || "",
            sellingStatus: res.data!.sellingStatus,
            isFavorite: res.data!.isFavorite,
            isHidden: res.data!.isHidden,
            pricing: {
              sellingPrice: res.data!.pricing.sellingPrice,
              recommendedPrice: res.data!.pricing.recommendedPrice,
              profitMargin: res.data!.pricing.profitMargin,
              currency: res.data!.pricing.currency,
            },
          },
          ...prev,
        ]);
        setAssignOpen(false);
        setAssignForm({ productId: "", variantSku: "", customTitle: "" });
      } else {
        toast.error(res.error || "Assign failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Assign failed");
    } finally {
      setAssigning(false);
    }
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    try {
      await favoriteResellerProductAction(id, !current);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !current } : p)));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const hideItem = async (id: string) => {
    try {
      await hideResellerProductAction(id);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isHidden: true, sellingStatus: "hidden" as const } : p,
        ),
      );
      toast.success("Product hidden");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const removeItem = async (id: string) => {
    try {
      await removeResellerProductAction(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Removed from catalog (master product intact)");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/resellers/${resellerId}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Products</h1>
            <p className="text-sm text-slate-400">
              Private catalog — master Product is never modified
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/resellers/${resellerId}/pricing`}
            className="flex h-10 items-center gap-2 rounded-md border border-slate-700 px-3 text-sm text-slate-300 hover:bg-slate-900"
          >
            <DollarSign className="h-4 w-4" /> Pricing
          </Link>
          <Button
            type="button"
            onClick={() => setAssignOpen((v) => !v)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
          >
            <Plus className="h-4 w-4" /> Assign Product
          </Button>
        </div>
      </div>

      {assignOpen && (
        <Card className="border-indigo-900/40 bg-indigo-950/20">
          <CardHeader className="p-4 pb-2">
            <span className="text-sm font-medium text-indigo-200">
              Product Assignment (master catalog reference only)
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <form
              onSubmit={handleAssign}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end"
            >
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Product ID *</label>
                <Input
                  required
                  value={assignForm.productId}
                  onChange={(e) => setAssignForm((f) => ({ ...f, productId: e.target.value }))}
                  placeholder="24-char ObjectId"
                  className="bg-slate-950 border-slate-800 text-white font-mono text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Variant SKU</label>
                <Input
                  value={assignForm.variantSku}
                  onChange={(e) => setAssignForm((f) => ({ ...f, variantSku: e.target.value }))}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Custom Title</label>
                <Input
                  value={assignForm.customTitle}
                  onChange={(e) => setAssignForm((f) => ({ ...f, customTitle: e.target.value }))}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
              <Button
                type="submit"
                disabled={assigning}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                {assigning ? "Adding..." : "Add to Catalog"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-800 bg-slate-900/30">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search title or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-800 text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white w-full md:w-44"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
            <option value="favorite">Favorites</option>
          </select>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/30 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No products in catalog"
            description="Assign approved master products to this reseller."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Product</TableHead>
                  <TableHead className="text-slate-400">Price</TableHead>
                  <TableHead className="text-slate-400 hidden sm:table-cell">Margin</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className="border-slate-800">
                    <TableCell>
                      <div className="font-medium text-white">{item.customTitle || item.title}</div>
                      <div className="text-xs text-slate-500 font-mono">{item.variantSku}</div>
                    </TableCell>
                    <TableCell className="text-white font-semibold">
                      {formatCentsToCurrency(item.pricing.sellingPrice, item.pricing.currency)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-emerald-400">
                      {item.pricing.profitMargin}%
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.sellingStatus === "active"
                            ? "success"
                            : item.sellingStatus === "hidden"
                              ? "warning"
                              : "default"
                        }
                      >
                        {item.sellingStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(item.id, item.isFavorite)}
                          className={`h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-800 ${
                            item.isFavorite ? "text-rose-400" : "text-slate-500"
                          }`}
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => hideItem(item.id)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-800"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/dashboard/resellers/${resellerId}/pricing?product=${item.id}`}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-emerald-400 hover:bg-slate-800"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-rose-400 hover:bg-slate-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ResellerProductsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 p-6 text-slate-400">Loading products...</div>
      }
    >
      <ProductsContent />
    </React.Suspense>
  );
}
