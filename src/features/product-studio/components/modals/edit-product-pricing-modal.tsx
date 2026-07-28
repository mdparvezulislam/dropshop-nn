"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { updatePricingAction } from "@/features/pricing/actions/pricing-actions";
import { DollarSign, Loader2, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

export interface EditProductPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricingId?: string | null;
  pricingData?: {
    baseCostPrice?: number | null;
    sellingPrice?: number | null;
    resellerPrice?: number | null;
    wholesalePrice?: number | null;
    comparePrice?: number | null;
    currency?: string;
  } | null;
  productName?: string;
  onSuccess?: () => void;
}

export function EditProductPricingModal({
  isOpen,
  onClose,
  pricingId,
  pricingData,
  productName,
  onSuccess,
}: EditProductPricingModalProps): React.ReactElement | null {
  const [costPrice, setCostPrice] = useState<string>("0");
  const [sellingPrice, setSellingPrice] = useState<string>("0");
  const [resellerPrice, setResellerPrice] = useState<string>("0");
  const [wholesalePrice, setWholesalePrice] = useState<string>("0");
  const [comparePrice, setComparePrice] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (pricingData) {
      setCostPrice(pricingData.baseCostPrice ? String(Math.round(pricingData.baseCostPrice / 100)) : "0");
      setSellingPrice(pricingData.sellingPrice ? String(Math.round(pricingData.sellingPrice / 100)) : "0");
      setResellerPrice(pricingData.resellerPrice ? String(Math.round(pricingData.resellerPrice / 100)) : "0");
      setWholesalePrice(pricingData.wholesalePrice ? String(Math.round(pricingData.wholesalePrice / 100)) : "0");
      setComparePrice(pricingData.comparePrice ? String(Math.round(pricingData.comparePrice / 100)) : "0");
    }
  }, [pricingData]);

  if (!isOpen || !pricingId) return null;

  const cost = parseFloat(costPrice) || 0;
  const selling = parseFloat(sellingPrice) || 0;
  const reseller = parseFloat(resellerPrice) || 0;

  // Real-time Reseller Profit Calculation
  const resellerMargin = reseller - cost;
  const resellerMarginPercent = cost > 0 ? ((resellerMargin / cost) * 100).toFixed(1) : "0";
  const isResellerValid = reseller >= cost;

  const handleSave = async () => {
    if (!isResellerValid) {
      toast.error(`রিসেলার প্রাইস (৳${reseller}) অবশ্যই কস্ট প্রাইসের (৳${cost}) চেয়ে বেশি বা সমান হতে হবে!`);
      return;
    }

    setLoading(true);
    try {
      const res = await updatePricingAction(pricingId, {
        baseCostPrice: Math.round(cost * 100),
        sellingPrice: Math.round(selling * 100),
        resellerPrice: Math.round(reseller * 100),
        wholesalePrice: Math.round((parseFloat(wholesalePrice) || 0) * 100),
        comparePrice: Math.round((parseFloat(comparePrice) || 0) * 100),
      });

      if (res.success) {
        toast.success("প্রাইসিং ও রিসেলার প্রাইস সফলভাবে আপডেট করা হয়েছে!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.error || "প্রাইস আপডেট করতে ব্যর্থ হয়েছে");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "প্রাইস আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-5 sm:p-6 bg-card border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Edit Product Pricing & Reseller Margin
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground line-clamp-1">
                {productName || "Update product pricing rules & reseller rates"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Cost & Selling Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Base Cost Price (৳)</Label>
              <Input
                type="number"
                min={0}
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0"
                className="font-mono font-bold text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary">Retail Selling Price (৳) *</Label>
              <Input
                type="number"
                min={0}
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0"
                className="font-mono font-bold text-xs h-10 border-primary/40"
              />
            </div>
          </div>

          {/* Reseller Price with Condition Alert */}
          <div className="space-y-1.5 rounded-2xl border border-border bg-muted/20 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                Reseller Wholesale Price (৳) *
              </Label>
              <Badge
                variant={isResellerValid ? "success" : "destructive"}
                size="xs"
                className="font-bold"
              >
                {isResellerValid ? `+৳${resellerMargin} (${resellerMarginPercent}%) Margin` : "Below Cost Price"}
              </Badge>
            </div>
            <Input
              type="number"
              min={0}
              value={resellerPrice}
              onChange={(e) => setResellerPrice(e.target.value)}
              placeholder="0"
              className={`font-mono font-extrabold text-xs h-10 ${
                !isResellerValid ? "border-red-500 focus-visible:ring-red-500" : "border-emerald-500/40"
              }`}
            />

            {!isResellerValid && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>রিসেলার প্রাইস (৳{reseller}) অবশ্যই কস্ট প্রাইসের (৳{cost}) চেয়ে বেশি বা সমান হতে হবে!</span>
              </div>
            )}
          </div>

          {/* Wholesale & Compare Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Wholesale Price (৳)</Label>
              <Input
                type="number"
                min={0}
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                placeholder="0"
                className="font-mono font-semibold text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Compare-at MRP Price (৳)</Label>
              <Input
                type="number"
                min={0}
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                placeholder="0"
                className="font-mono font-semibold text-xs h-10"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-9 font-medium">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading || !isResellerValid}
            className="h-9 font-bold gap-1.5 bg-primary text-primary-foreground"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Save Price Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
