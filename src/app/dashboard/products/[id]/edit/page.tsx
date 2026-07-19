"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { updateProductAction } from "@/features/product/actions/product-actions";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const MOCK_PRODUCT = {
  id: "1",
  name: "iPhone 16 Pro Max",
  sku: "APL-IPH16PM-256",
  productModel: "A3296",
  barcode: "190199123456",
  shortDescription: "Sleek titanium smartphone featuring the new A18 Pro CPU chip.",
  fullDescription:
    "The Apple iPhone 16 Pro Max features a 6.9-inch OLED display, custom camera control triggers, grade 5 titanium chassis, and next-generation Apple Intelligence support.",
  variants: [{ sku: "APL-IPH16PM-256-BLK", color: "Black Titanium", size: "256GB" }],
  attributes: [{ key: "Display Size", value: "6.9 inches", group: "specification" }],
};

export default function EditProductPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  // Form State
  const [name, setName] = React.useState(MOCK_PRODUCT.name);
  const [sku, setSku] = React.useState(MOCK_PRODUCT.sku);
  const [productModel, setProductModel] = React.useState(MOCK_PRODUCT.productModel);
  const [barcode, setBarcode] = React.useState(MOCK_PRODUCT.barcode);
  const [shortDesc, setShortDesc] = React.useState(MOCK_PRODUCT.shortDescription);
  const [fullDesc, setFullDesc] = React.useState(MOCK_PRODUCT.fullDescription);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        sku,
        productModel,
        barcode,
        shortDescription: shortDesc,
        fullDescription: fullDesc,
        supplierId: "60c72b2f9b1d8e2568cf4567",
        variants: MOCK_PRODUCT.variants,
        attributes: MOCK_PRODUCT.attributes,
      };

      const res = await updateProductAction(MOCK_PRODUCT.id, payload);
      if (res.success) {
        toast.success("Product updated successfully!");
        router.push(`/dashboard/products/${MOCK_PRODUCT.id}`);
      } else {
        toast.error("Failed to update product.");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid fields. Please double check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white flex justify-center items-center">
      <div className="w-full max-w-2xl">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="relative border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/products/${MOCK_PRODUCT.id}`}
                className="p-1 rounded-full border border-slate-850 hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-slate-400 hover:text-white" />
              </Link>
              <div>
                <CardTitle className="text-xl font-bold">Edit Product specifications</CardTitle>
                <CardDescription className="text-slate-400">
                  Modify properties and general catalogs
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Product Name</label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Base SKU</label>
                  <Input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Model</label>
                  <Input
                    type="text"
                    value={productModel}
                    onChange={(e) => setProductModel(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Barcode</label>
                  <Input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Short Summary</label>
                <Input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Full Description</label>
                <textarea
                  rows={4}
                  value={fullDesc}
                  onChange={(e) => setFullDesc(e.target.value)}
                  className="w-full rounded-md border border-slate-800 bg-slate-950 p-3 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-800">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  {loading ? <Spinner size="sm" className="mr-2" /> : "Save Changes"}
                </Button>
                <Link
                  href={`/dashboard/products/${MOCK_PRODUCT.id}`}
                  className="flex h-10 w-32 items-center justify-center rounded-md border border-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
