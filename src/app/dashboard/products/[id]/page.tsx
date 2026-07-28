"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateProductStatusAction } from "@/features/catalog/actions/product-actions";
import {
  getProductDetailAction,
  type ProductDetailView,
} from "@/features/product-studio/actions/studio-actions";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  FileText,
  User,
  ArrowLeft,
  Layers,
  ImageIcon,
  DollarSign,
  Package,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { RichContentRenderer } from "@/components/editor/rich-content-renderer";
import { EditProductPricingModal } from "@/features/product-studio/components/modals/edit-product-pricing-modal";

type DetailTab = "info" | "pricing" | "media" | "variants" | "seo";

const DETAIL_TABS: { value: DetailTab; label: string; icon: React.ElementType }[] = [
  { value: "info", label: "Product Details", icon: User },
  { value: "pricing", label: "Pricing & Stock", icon: DollarSign },
  { value: "media", label: "Media & Video Showcase", icon: ImageIcon },
  { value: "variants", label: "Variants Matrix", icon: Layers },
  { value: "seo", label: "SEO & Meta", icon: FileText },
];

function extractYoutubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

const BDT = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 });

function formatPrice(minorUnits?: number | null): string {
  if (!minorUnits || minorUnits <= 0) return "—";
  return `৳${BDT.format(minorUnits / 100)}`;
}

function statusVariant(status: string): "success" | "warning" | "destructive" | "default" {
  if (status === "active") return "success";
  if (status === "draft" || status === "pending_review") return "warning";
  if (status === "archived") return "destructive";
  return "default";
}

function Field({ label, value }: { label: string; value?: React.ReactNode }): React.ReactElement {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm font-medium text-foreground/90 break-words">{value || "—"}</p>
    </div>
  );
}

function EmptySection({ message }: { message: string }): React.ReactElement {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
      {message}
    </div>
  );
}

export default function ProductDetailsPage(): React.ReactElement {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [detail, setDetail] = React.useState<ProductDetailView | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<DetailTab>("info");
  const [updating, setUpdating] = React.useState(false);
  const [editPricingOpen, setEditPricingOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getProductDetailAction(id);
      if (res.success && res.data) {
        setDetail(res.data);
      } else {
        setDetail(null);
        toast.error(res.error || "Failed to load product details");
      }
    } catch (err: unknown) {
      setDetail(null);
      toast.error(err instanceof Error ? err.message : "Failed to load product details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const product = detail?.product ?? null;
  const pricing = detail?.pricing ?? null;
  const inventory = detail?.inventory ?? null;

  const handleStatusChange = async (newStatus: "active" | "draft" | "archived") => {
    if (!product) return;
    setUpdating(true);
    try {
      const res = await updateProductStatusAction(product.id, newStatus);
      if (res.success) {
        toast.success(`Product status updated to ${newStatus}`);
        await load();
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update product status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 text-foreground space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/products"
            aria-label="Back to products"
            className="p-2 rounded-full border border-border bg-card/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Product Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 text-foreground space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/dashboard/products"
          aria-label="Back to products"
          className="p-2 rounded-full border border-border bg-card/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">
              {product.name}
            </h1>
            <Badge variant={statusVariant(product.status)}>{product.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground font-mono">Base SKU: {product.sku}</p>
        </div>
        <Link href={`/dashboard/products/${product.id}/edit`} className="ml-auto">
          <Button variant="outline" className="h-10 font-medium gap-2">
            <FileEdit className="h-4 w-4" /> Edit in Studio
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Card className="border-border bg-card/30 backdrop-blur-md">
        <CardContent className="p-3 sm:p-4 flex flex-wrap gap-3 items-center justify-between">
          <div
            role="tablist"
            aria-label="Product detail sections"
            className="flex gap-1 overflow-x-auto ws-scroll"
          >
            {DETAIL_TABS.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 h-10 shrink-0 rounded-md text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            {product.status !== "active" && (
              <Button
                onClick={() => handleStatusChange("active")}
                disabled={updating}
                variant="outline"
                className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 h-10 font-medium"
              >
                Publish Catalog
              </Button>
            )}
            {product.status !== "archived" && (
              <Button
                onClick={() => handleStatusChange("archived")}
                disabled={updating}
                variant="destructive"
                className="h-10 font-medium"
              >
                Archive Product
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tab 1: Product Details & Media */}
      {activeTab === "info" && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">General Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Short Summary Description" value={product.shortDescription} />
                <div>
                  <span className="text-xs text-muted-foreground">Full Description</span>
                  {product.description ? (
                    <RichContentRenderer content={product.description} />
                  ) : (
                    <p className="text-sm text-foreground/90">—</p>
                  )}
                </div>
                <Field label="Notice" value={product.notice} />
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Product Properties</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Model Number" value={product.productModel} />
                <Field label="Brand / Manufacturer" value={detail?.brandName} />
                <Field label="Barcode" value={product.barcode} />
                <Field label="GTIN Code" value={product.gtin} />
                <Field label="Product Type" value={product.productType} />
                <Field label="Visibility" value={product.visibility} />
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Media Gallery ({product.media.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.media.length === 0 ? (
                  <EmptySection message="No images have been uploaded for this product yet." />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {product.media.map((media) => (
                      <div
                        key={media.url}
                        className="relative rounded-xl border border-border overflow-hidden bg-muted/30 aspect-square"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={media.url}
                          alt={media.altText || ""}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        {media.isFeatured && (
                          <Badge variant="success" size="xs" className="absolute top-2 left-2">
                            Featured
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {product.specifications.length > 0 && (
              <Card className="border-border bg-card/50">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Specifications ({product.specifications.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-border rounded-lg overflow-hidden">
                    {product.specifications.map((spec) => (
                      <div
                        key={`${spec.key}-${spec.value}`}
                        className="grid grid-cols-2 gap-2 p-3 border-b border-border bg-muted/20 last:border-b-0 text-sm"
                      >
                        <span className="text-muted-foreground font-medium break-words">
                          {spec.key}
                        </span>
                        <span className="text-foreground font-semibold break-words">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {product.variants.length > 0 && (
              <Card className="border-border bg-card/50">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Variant Options ({product.variants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-border rounded-lg overflow-hidden">
                    {product.variants.map((variant) => {
                      const attributes = variant.attributes
                        ? Object.entries(variant.attributes)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(" / ")
                        : [variant.color, variant.size, variant.storage].filter(Boolean).join(" / ");

                      return (
                        <div
                          key={variant.sku}
                          className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-border bg-muted/20 last:border-b-0"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-mono text-primary">{variant.sku}</p>
                            <span className="text-xs text-muted-foreground">
                              {attributes || variant.name || "Default"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">
                              <Package className="inline h-3 w-3 mr-1" />
                              {variant.stock ?? 0} pcs
                            </span>
                            <Badge
                              variant={variant.isActive === false ? "outline" : "success"}
                              size="xs"
                            >
                              {variant.isActive === false ? "Inactive" : "Active"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Taxonomy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Category" value={detail?.categoryName} />
                <div>
                  <span className="text-xs text-muted-foreground">Tags</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {product.tags.length > 0 ? (
                      product.tags.map((tag) => (
                        <Badge key={tag} variant="outline" size="xs">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-foreground/90">—</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Badges</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {product.badges.length > 0 ? (
                      product.badges.map((badge) => (
                        <Badge key={badge} variant="secondary" size="xs">
                          {badge.replace(/_/g, " ")}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-foreground/90">—</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field
                  label="Created"
                  value={product.createdAt ? new Date(product.createdAt).toLocaleString() : ""}
                />
                <Field
                  label="Last Updated"
                  value={product.updatedAt ? new Date(product.updatedAt).toLocaleString() : ""}
                />
                <Field label="URL Slug" value={product.slug} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Variants Matrix */}
      {activeTab === "variants" && (
        <Card className="border-border bg-card/50 max-w-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Variant Options ({product.variants.length})
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Generic attribute combinations for this product
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {product.variants.length === 0 ? (
              <EmptySection message="This product has no variants." />
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                {product.variants.map((variant) => {
                  const attributes = variant.attributes
                    ? Object.entries(variant.attributes)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" / ")
                    : [variant.color, variant.size, variant.storage].filter(Boolean).join(" / ");

                  return (
                    <div
                      key={variant.sku}
                      className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-border bg-muted/20 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-mono text-primary">{variant.sku}</p>
                        <span className="text-xs text-muted-foreground">
                          {attributes || variant.name || "Default"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">
                          <Package className="inline h-3 w-3 mr-1" />
                          {variant.stock ?? 0} pcs
                        </span>
                        <Badge
                          variant={variant.isActive === false ? "outline" : "success"}
                          size="xs"
                        >
                          {variant.isActive === false ? "Inactive" : "Active"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Pricing & Inventory */}
      {activeTab === "pricing" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-semibold">Pricing & Margins</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Live values from the Pricing Engine
                </CardDescription>
              </div>
              {pricing && (
                <Button
                  size="sm"
                  variant="outline"
                  className="font-bold text-xs gap-1.5 h-9"
                  onClick={() => setEditPricingOpen(true)}
                >
                  <DollarSign className="h-3.5 w-3.5 text-primary" /> Edit Prices & Margin
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {pricing ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Cost Price" value={formatPrice(pricing.baseCostPrice)} />
                  <Field label="Retail / Selling" value={formatPrice(pricing.sellingPrice)} />
                  <Field label="Reseller Price" value={formatPrice(pricing.resellerPrice)} />
                  <Field label="Wholesale Price" value={formatPrice(pricing.wholesalePrice)} />
                  <Field label="Compare-at Price" value={formatPrice(pricing.comparePrice)} />
                  <Field label="Currency" value={pricing.currency} />
                </div>
              ) : (
                <EmptySection message="No pricing record exists for this product yet." />
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Inventory</CardTitle>
              <CardDescription className="text-muted-foreground">
                Live values from the Inventory Engine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inventory ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Available Stock" value={`${inventory.availableStock} pcs`} />
                  <Field label="Reserved" value={`${inventory.reservedStock} pcs`} />
                  <Field label="Incoming" value={`${inventory.incomingStock} pcs`} />
                  <Field label="Low Stock Threshold" value={`${inventory.lowStockThreshold} pcs`} />
                  <Field label="Availability" value={inventory.availability} />
                  <Field label="Variant SKU" value={inventory.variantSku} />
                </div>
              ) : (
                <EmptySection message="No inventory record exists for this product yet." />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Media & Video Showcase */}
      {activeTab === "media" && (
        <div className="space-y-6">
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Media Gallery ({product.media.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.media.length === 0 ? (
                <EmptySection message="No images uploaded for this product yet." />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {product.media.map((media) => (
                    <div
                      key={media.url}
                      className="relative rounded-xl border border-border overflow-hidden bg-muted/30 aspect-square"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={media.url}
                        alt={media.altText || ""}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      {media.isFeatured && (
                        <Badge variant="success" size="xs" className="absolute top-2 left-2">
                          Featured
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* YouTube Video Card */}
          {product.videoUrl && extractYoutubeId(product.videoUrl) && (
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-xs font-bold">
                    YouTube
                  </span>
                  <CardTitle className="text-xl font-semibold">Product Showcase Video</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl overflow-hidden border border-border aspect-video max-w-2xl shadow-lg">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${extractYoutubeId(product.videoUrl)}`}
                    title="YouTube Video Player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab 3: SEO */}
      {activeTab === "seo" && (
        <Card className="border-border bg-card/50 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">SEO Meta Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Meta Title" value={product.metaTitle} />
            <Field label="Meta Description" value={product.metaDescription} />
            <Field label="URL Slug" value={product.slug} />
            <div>
              <span className="text-xs text-muted-foreground">Meta Keywords</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {product.seo?.metaKeywords && product.seo.metaKeywords.length > 0 ? (
                  product.seo.metaKeywords.map((keyword) => (
                    <Badge key={keyword} variant="outline" size="xs">
                      {keyword}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-foreground/90">—</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Product Pricing Modal */}
      {pricing && (
        <EditProductPricingModal
          isOpen={editPricingOpen}
          onClose={() => setEditPricingOpen(false)}
          pricingId={pricing.id}
          pricingData={pricing}
          productName={product.name}
          onSuccess={load}
        />
      )}
    </div>
  );
}
