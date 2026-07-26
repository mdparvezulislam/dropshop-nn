"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Download, Image, FileText, Video, Package, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace/page-header";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

interface KitAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  altText?: string;
  folder?: string;
}

interface ProductKit {
  productId: string;
  title: string;
  description?: string;
  images: { url: string; alt?: string }[];
  specs?: string;
}

function iconForType(type: string) {
  const t = type.toLowerCase();
  if (t.includes("video")) return Video;
  if (t.includes("pdf") || t.includes("doc") || t.includes("text")) return FileText;
  return Image;
}

function MarketingKitPageContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") ?? "";
  const [assets, setAssets] = React.useState<KitAsset[]>([]);
  const [product, setProduct] = React.useState<ProductKit | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const mediaMod = await import("@/features/cms/actions/media-actions");
        const mediaRes = await mediaMod.listMediaAction({
          page: 1,
          limit: 48,
          folder: "reseller_marketing_kit",
        });

        let list: KitAsset[] = [];
        if (mediaRes.success && mediaRes.data) {
          const d = mediaRes.data as { items?: any[] };
          list = (d.items ?? []).map((m: any) => ({
            id: m.id,
            name: m.name ?? m.altText ?? "Asset",
            url: m.url,
            type: m.type ?? "image",
            altText: m.altText,
            folder: m.folder,
          }));
        }

        // Fallback: general marketing media
        if (list.length === 0) {
          const fallback = await mediaMod.listMediaAction({ page: 1, limit: 24 });
          if (fallback.success && fallback.data) {
            const d = fallback.data as { items?: any[] };
            list = (d.items ?? [])
              .filter((m: any) => {
                const folder = (m.folder ?? "").toLowerCase();
                return (
                  folder.includes("marketing") ||
                  folder.includes("reseller") ||
                  m.type === "image" ||
                  m.type === "video"
                );
              })
              .map((m: any) => ({
                id: m.id,
                name: m.name ?? m.altText ?? "Asset",
                url: m.url,
                type: m.type ?? "image",
                altText: m.altText,
                folder: m.folder,
              }));
          }
        }

        setAssets(list);

        if (productId) {
          const { searchResellerProductsAction } =
            await import("@/features/reseller/actions/reseller-actions");
          const prodRes = await searchResellerProductsAction({
            resellerId: "me",
            page: 1,
            limit: 50,
          });
          if (prodRes.success && prodRes.data) {
            const items = (prodRes.data as any).items ?? [];
            const match = items.find((p: any) => p.id === productId || p.productId === productId);
            if (match) {
              setProduct({
                productId: match.productId ?? match.id,
                title: match.customTitle ?? match.product?.name ?? "Product",
                description:
                  match.customDescription ??
                  match.product?.shortDescription ??
                  match.product?.description,
                images: (match.product?.media ?? match.media ?? [])
                  .filter((m: any) => m.url)
                  .map((m: any) => ({ url: m.url, alt: m.altText })),
                specs: match.product?.specifications
                  ? JSON.stringify(match.product.specifications, null, 2)
                  : undefined,
              });
            }
          }
        }
      } catch {
        toast.error("Failed to load marketing assets");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  const copyText = async (label: string, text?: string) => {
    if (!text) {
      toast.error("Nothing to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Clipboard unavailable");
    }
  };

  const openAsset = (url: string) => {
    if (!url || url === "#") {
      toast.error("Asset URL unavailable");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const downloadAll = () => {
    const openable = assets.filter((a) => a.url && a.url !== "#");
    if (openable.length === 0) {
      toast.message("No downloadable assets yet — ask admin to upload marketing kit media.");
      return;
    }
    openable.slice(0, 8).forEach((a, i) => {
      setTimeout(() => openAsset(a.url), i * 200);
    });
    toast.success(`Opening ${Math.min(8, openable.length)} asset(s)`);
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <PageHeader
        title="Marketing Kit"
        description="Product media and ready-to-post assets from the CMS media library"
        actions={
          <Button onClick={downloadAll} className="gap-1.5" disabled={loading}>
            <Download className="h-4 w-4" />
            Open assets
          </Button>
        }
      />

      {product && (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-primary" />
              {product.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-2">
            {product.description && (
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Description</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => copyText("Description", product.description)}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-foreground/90">{product.description}</p>
              </div>
            )}
            {product.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {product.images.map((img, i) => (
                  <button
                    key={`${img.url}-${i}`}
                    type="button"
                    onClick={() => openAsset(img.url)}
                    className="overflow-hidden rounded-lg border border-border/60"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt ?? product.title}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            {product.specs && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => copyText("Specifications", product.specs)}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy specifications
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : assets.length === 0 && !product ? (
        <Card>
          <CardContent className="space-y-3 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No marketing assets uploaded yet. Admin can add media under CMS → Media (folder{" "}
              <code className="text-xs">reseller_marketing_kit</code>).
            </p>
            <Link href="/reseller/products">
              <Button variant="outline" size="sm">
                Browse products
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((item) => {
            const Icon = iconForType(item.type);
            return (
              <Card key={item.id} className="group transition-colors hover:border-primary/30">
                <CardHeader className="flex-row items-start gap-3 space-y-0 p-4 pb-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-sm">{item.name}</CardTitle>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {item.type}
                      </Badge>
                      {item.folder && (
                        <Badge variant="outline" className="text-[10px]">
                          {item.folder}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 p-4 pt-2">
                  {item.type === "image" && item.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.altText ?? item.name}
                      className="mb-2 aspect-video w-full rounded-md object-cover"
                    />
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => openAsset(item.url)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => copyText("URL", item.url)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MarketingKitPage(): React.ReactElement {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <MarketingKitPageContent />
    </React.Suspense>
  );
}
