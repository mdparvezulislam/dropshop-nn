"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Trash2,
  Minus,
  Phone,
  MapPin,
  Package,
  Truck,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { cn } from "@/shared/utils/cn";

interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  variantSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  costBasis: number;
  profitAmount: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  district: string;
}

const DELIVERY_ZONES = ["Inside Dhaka", "Outside Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Barishal", "Rangpur", "Mymensingh"];
const COURIER_RATES: Record<string, number> = {
  "Inside Dhaka": 6000,
  "Outside Dhaka": 13000,
  "Chattogram": 10000,
  "Sylhet": 12000,
  "Khulna": 13000,
  "Rajshahi": 13000,
  "Barishal": 14000,
  "Rangpur": 15000,
  "Mymensingh": 13000,
};

export default function CreateOrderPage(): React.ReactElement {
  const router = useRouter();
  const [customer, setCustomer] = React.useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    district: "Inside Dhaka",
  });
  const [paymentMethod, setPaymentMethod] = React.useState<"cod" | "prepaid">("cod");
  const [items, setItems] = React.useState<OrderLineItem[]>([]);
  const [productSearch, setProductSearch] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const deliveryCharge = COURIER_RATES[customer.district] ?? 13000;

  const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const totalProfit = items.reduce((s, i) => s + i.profitAmount * i.quantity, 0);
  const grandTotal = subtotal + deliveryCharge;

  const searchProducts = React.useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { searchResellerProductsAction } = await import(
        "@/features/reseller/actions/reseller-actions"
      );
      const res = await searchResellerProductsAction({
        resellerId: "current",
        search: q,
        page: 1,
        limit: 10,
      });
      if (res.success && res.data) {
        const d = res.data as any;
        setSearchResults(d.items ?? []);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => searchProducts(productSearch), 300);
    return () => clearTimeout(timer);
  }, [productSearch, searchProducts]);

  const addItem = (product: any) => {
    const pricing = product.pricing ?? {};
    const productId =
      typeof product.productId === "string"
        ? product.productId
        : (product.productId?.id ?? product.productId?._id ?? product.id ?? product._id);
    if (!productId) {
      toast.error("Product identifier missing");
      return;
    }
    const newItem: OrderLineItem = {
      id: String(productId) + Date.now(),
      productId: String(productId),
      productName: product.customTitle ?? product.productId?.title ?? product.title ?? "Product",
      variantSku: product.variantSku ?? product.productId?.sku ?? product.sku ?? "",
      quantity: 1,
      unitPrice: pricing.sellingPrice ?? 0,
      totalPrice: pricing.sellingPrice ?? 0,
      costBasis: pricing.costBasis ?? 0,
      profitAmount: pricing.profitAmount ?? 0,
    };
    setItems((prev) => [...prev, newItem]);
    setProductSearch("");
    setSearchResults([]);
    toast.success("Product added to order");
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const qty = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: qty,
          totalPrice: item.unitPrice * qty,
        };
      }),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const setCustomPrice = (id: string, priceCents: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          unitPrice: priceCents,
          totalPrice: priceCents * item.quantity,
          profitAmount: priceCents - item.costBasis,
        };
      }),
    );
  };

  const handleSubmit = async () => {
    if (!customer.name.trim() || !customer.phone.trim()) {
      toast.error("Customer name and phone are required");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one product to the order");
      return;
    }

    setSubmitting(true);
    try {
      const { completeRoleCheckoutAction } = await import(
        "@/features/checkout/actions/checkout-actions"
      );
      const res = await completeRoleCheckoutAction({
        type: "reseller",
        resellerId: "current",
        paymentMethod,
        deliveryCharge,
        customer: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address || customer.district,
          district: customer.district,
        },
        items: items.map((i) => ({
          productId: i.productId,
          variantSku: i.variantSku || undefined,
          quantity: i.quantity,
          unitPriceOverride: i.unitPrice,
        })),
      });

      if (res.success) {
        toast.success("Order created via checkout pipeline");
        router.push("/reseller/orders");
      } else {
        toast.error(res.error ?? "Failed to create order");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <PageHeader
        title="Create Order"
        description="Place a new order for your customer"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Customer Info */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cust-name">Full Name</Label>
                  <Input
                    id="cust-name"
                    value={customer.name}
                    onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Customer name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cust-phone">Phone</Label>
                  <Input
                    id="cust-phone"
                    value={customer.phone}
                    onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust-address">Delivery Address</Label>
                <Input
                  id="cust-address"
                  value={customer.address}
                  onChange={(e) => setCustomer((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Full address"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust-district">Delivery Zone</Label>
                <select
                  id="cust-district"
                  value={customer.district}
                  onChange={(e) => setCustomer((p) => ({ ...p, district: e.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                >
                  {DELIVERY_ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search your products…"
                  className="pl-9"
                />
                {productSearch && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-10 rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
                    {searching ? (
                      <div className="p-3 text-sm text-muted-foreground">Searching…</div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">No products found</div>
                    ) : (
                      searchResults.map((p: any) => {
                        const pricing = p.pricing ?? {};
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => addItem(p)}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <Package className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">
                                {p.customTitle ?? p.productId?.title ?? "Product"}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {formatCents(pricing.sellingPrice ?? 0)} · {pricing.profitMargin ?? 0}% margin
                              </div>
                            </div>
                            <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{item.productName}</span>
                          <span className="text-[10px] font-mono text-muted-foreground shrink-0">{item.variantSku}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => setCustomPrice(item.id, parseInt(e.target.value) || 0)}
                            className="h-7 w-24 text-xs tabular-nums"
                            placeholder="Price (cents)"
                          />
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>Line total: <span className="font-medium text-foreground">{formatCents(item.totalPrice)}</span></span>
                          <span>Profit: <span className={cn("font-medium", item.profitAmount > 0 ? "text-success" : "text-destructive")}>{formatCents(item.profitAmount * item.quantity)}</span></span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-destructive/80 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {items.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Search and select products above to add them to the order
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={cn(
                    "flex flex-1 items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                    paymentMethod === "cod"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Truck className="h-4 w-4" />
                  <span className="font-medium">COD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("prepaid")}
                  className={cn(
                    "flex flex-1 items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                    paymentMethod === "prepaid"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">Prepaid</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Order Summary */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                  <span className="font-medium tabular-nums">{formatCents(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium tabular-nums">{formatCents(deliveryCharge)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-semibold">Grand Total</span>
                  <span className="font-bold tabular-nums text-primary">{formatCents(grandTotal)}</span>
                </div>
              </div>

              <Separator />

              {/* Live Profit Preview */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Profit Preview</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Profit</span>
                  <span className={cn(
                    "font-semibold tabular-nums",
                    totalProfit > 0 ? "text-success" : "text-destructive",
                  )}>
                    {formatCents(totalProfit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Margin</span>
                  <span className="font-semibold tabular-nums text-success">
                    {subtotal > 0 ? ((totalProfit / subtotal) * 100).toFixed(1) : "0"}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Net Receivable</span>
                  <span className="font-semibold tabular-nums">{formatCents(grandTotal - deliveryCharge)}</span>
                </div>
              </div>

              <Button
                className="w-full gap-1.5"
                size="lg"
                disabled={submitting || items.length === 0}
                onClick={handleSubmit}
              >
                {submitting ? (
                  "Creating Order…"
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Create Order
                  </>
                )}
              </Button>

              {items.length === 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  Add products to enable the order button
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick tips */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Tips</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-xs text-muted-foreground">
              <p>• You can set a custom selling price per item</p>
              <p>• Profit is calculated based on your cost basis</p>
              <p>• Delivery charge varies by zone</p>
              <p>• COD orders are processed on delivery</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
