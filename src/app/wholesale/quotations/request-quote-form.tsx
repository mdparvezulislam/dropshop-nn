"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/workspace/page-header";
import { Spinner } from "@/components/ui/spinner";

interface QuoteItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export function RequestQuoteForm({ onBack, onSuccess }: Props): React.ReactElement {
  const [items, setItems] = React.useState<QuoteItem[]>([
    { productId: "", productName: "", sku: "", quantity: 1, unitPrice: 0, totalPrice: 0 },
  ]);
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const next = [...items];
    (next[index] as any)[field] = value;
    if (field === "quantity" || field === "unitPrice") {
      next[index].totalPrice = next[index].quantity * next[index].unitPrice;
    }
    setItems(next);
  };

  const addItem = () => {
    setItems([
      ...items,
      { productId: "", productName: "", sku: "", quantity: 1, unitPrice: 0, totalPrice: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((i) => !i.productName.trim() || i.quantity < 1)) {
      toast.error("Fill in all product fields");
      return;
    }

    setSubmitting(true);
    try {
      const { createQuotationAction } =
        await import("@/features/quotation/actions/quotation-actions");
      const res = await createQuotationAction({
        items: items.map((i) => ({
          productId: i.productId || `temp_${Date.now()}`,
          productName: i.productName,
          sku: i.sku,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
        })),
        subtotal,
        tax,
        grandTotal,
        notes,
      });
      if (res.success) {
        toast.success("Quotation request submitted");
        onSuccess();
      } else {
        toast.error(res.error ?? "Failed to submit");
      }
    } catch {
      toast.error("Failed to submit quotation request");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Request Quote" description="Submit a quotation request" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Products</CardTitle>
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addItem}>
                <Plus className="h-3.5 w-3.5" /> Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-2 items-end rounded-lg border border-border p-3"
              >
                <div className="col-span-4 space-y-1">
                  <Label className="text-[10px]">Product Name</Label>
                  <Input
                    value={item.productName}
                    onChange={(e) => updateItem(i, "productName", e.target.value)}
                    placeholder="Product name"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px]">SKU</Label>
                  <Input
                    value={item.sku}
                    onChange={(e) => updateItem(i, "sku", e.target.value)}
                    placeholder="SKU"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px]">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px]">Unit Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice / 100}
                    onChange={(e) =>
                      updateItem(
                        i,
                        "unitPrice",
                        Math.round(parseFloat(e.target.value || "0") * 100),
                      )
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <Label className="text-[10px]">Total</Label>
                  <p className="h-8 flex items-center text-xs font-medium tabular-nums">
                    {formatCents(item.totalPrice)}
                  </p>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(i)}
                    disabled={items.length === 1}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCents(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (5%)</span>
              <span>{formatCents(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCents(grandTotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or comments…"
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" className="gap-1.5" disabled={submitting}>
            {submitting ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
            {submitting ? "Submitting…" : "Submit Quote Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
