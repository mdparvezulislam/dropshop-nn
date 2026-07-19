"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { updateProductStatusAction } from "@/features/product/actions/product-actions";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  FileText,
  User,
  CreditCard,
  ArrowLeft,
  Layers,
  Award,
} from "lucide-react";

const MOCK_PRODUCT = {
  id: "1",
  name: "iPhone 16 Pro Max",
  slug: "iphone-16-pro-max",
  sku: "APL-IPH16PM-256",
  productModel: "A3296",
  barcode: "190199123456",
  gtin: "01901991234568",
  status: "draft" as const,
  brand: "Apple",
  category: "Smartphones",
  shortDescription: "Sleek titanium smartphone featuring the new A18 Pro CPU chip.",
  fullDescription:
    "The Apple iPhone 16 Pro Max features a 6.9-inch OLED display, custom camera control triggers, grade 5 titanium chassis, and next-generation Apple Intelligence support.",
  variants: [
    { sku: "APL-IPH16PM-256-BLK", color: "Black Titanium", size: "256GB" },
    { sku: "APL-IPH16PM-256-WHT", color: "White Titanium", size: "256GB" },
    { sku: "APL-IPH16PM-256-GLD", color: "Desert Titanium", size: "256GB" },
  ],
  attributes: [
    { key: "Display Size", value: "6.9 inches", group: "specification" },
    { key: "CPU Chipset", value: "A18 Pro Apple Silicon", group: "technical" },
    { key: "Chassis Material", value: "Grade 5 Titanium", group: "specification" },
    { key: "Warranty Period", value: "1 Year Standard", group: "general" },
  ],
  seo: {
    metaTitle: "Buy iPhone 16 Pro Max - Best Price dropship catalogue",
    metaDescription:
      "Secure titanium chassis iPhone 16 Pro Max with custom camera triggers and A18 Pro silicon chip.",
  },
};

export default function ProductDetailsPage() {
  const [product, setProduct] = React.useState<any>(MOCK_PRODUCT);
  const [activeTab, setActiveTab] = React.useState("info");
  const [updating, setUpdating] = React.useState(false);

  const handleStatusChange = async (newStatus: "active" | "draft" | "archived") => {
    setUpdating(true);
    try {
      const res = await updateProductStatusAction(product.id, newStatus);
      if (res.success) {
        setProduct((prev: any) => ({ ...prev, status: newStatus }));
        toast.success(`Product status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update product status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="p-2 rounded-full border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <Badge variant={getStatusVariant(product.status)}>{product.status}</Badge>
          </div>
          <p className="text-sm text-slate-400">Base SKU: {product.sku}</p>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
        <CardContent className="p-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-2 px-4 h-10 rounded-md text-sm font-medium transition-colors ${
                activeTab === "info"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <User className="h-4 w-4" /> Info
            </button>
            <button
              onClick={() => setActiveTab("variants")}
              className={`flex items-center gap-2 px-4 h-10 rounded-md text-sm font-medium transition-colors ${
                activeTab === "variants"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Layers className="h-4 w-4" /> Variants Config
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`flex items-center gap-2 px-4 h-10 rounded-md text-sm font-medium transition-colors ${
                activeTab === "specs"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <SettingsIcon className="h-4 w-4" /> Specifications
            </button>
            <button
              onClick={() => setActiveTab("seo")}
              className={`flex items-center gap-2 px-4 h-10 rounded-md text-sm font-medium transition-colors ${
                activeTab === "seo"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <FileText className="h-4 w-4" /> SEO Tags
            </button>
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

      {activeTab === "info" && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">General Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400">Short Summary Description</span>
                  <p className="text-sm text-slate-200">{product.shortDescription}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Full Description Description</span>
                  <p className="text-sm text-slate-200">{product.fullDescription}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Product Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Model Number</span>
                    <p className="text-sm font-medium text-slate-200">
                      {product.productModel || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Brand / Manufacturer</span>
                    <p className="text-sm font-medium text-slate-200">{product.brand}</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Barcode</span>
                    <p className="text-sm font-medium text-slate-200 font-mono">
                      {product.barcode || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">GTIN Code</span>
                    <p className="text-sm font-medium text-slate-200 font-mono">
                      {product.gtin || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Taxonomy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400">Category Category</span>
                  <p className="text-sm font-semibold text-white">{product.category}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "variants" && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Variant List</CardTitle>
            <CardDescription className="text-slate-400">
              Different configs, colors and memory storage
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              {product.variants.map((variant: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/20 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-mono text-indigo-400">{variant.sku}</p>
                    <span className="text-xs text-slate-400">
                      Color: {variant.color || "Default"} / Size: {variant.size || "N/A"}
                    </span>
                  </div>
                  <Badge variant="outline">Variant SKU Valid</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "specs" && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Specifications Matrix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              {product.attributes.map((attr: any, idx: number) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 p-3 border-b border-slate-800 bg-slate-950/20 last:border-b-0 text-sm"
                >
                  <span className="text-slate-400 font-medium">{attr.key}</span>
                  <span className="text-white font-semibold">{attr.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "seo" && (
        <Card className="border-slate-800 bg-slate-900/50 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">SEO Meta Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs text-slate-400">Meta Title Title</span>
              <p className="text-sm font-semibold text-slate-200">{product.seo.metaTitle}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Meta Description Description</span>
              <p className="text-sm text-slate-200">{product.seo.metaDescription}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
