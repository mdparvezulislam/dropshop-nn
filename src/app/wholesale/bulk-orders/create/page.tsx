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
  ClipboardList,
  FileText,
  Boxes,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/workspace/page-header";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils/cn";

interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  variantSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  moq: number;
  tierPricing: { minQty: number; price: number; label?: string }[];
}

interface CompanyInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  tradeLicense: string;
  binVat: string;
  poReference: string;
}

const DELIVERY_ZONES = [
  "Inside Dhaka",
  "Outside Dhaka",
  "Chattogram",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];
const COURIER_RATES: Record<string, number> = {
  "Inside Dhaka": 6000,
  "Outside Dhaka": 13000,
  Chattogram: 10000,
  Sylhet: 12000,
  Khulna: 13000,
  Rajshahi: 13000,
  Barishal: 14000,
  Rangpur: 15000,
  Mymensingh: 13000,
};

function CreateBulkOrderPageContent(): React.ReactElement {
  const router = useRouter();
  const [company, setCompany] = React.useState<CompanyInfo>({
    name: "",
    phone: "",
    email: "",
    address: "",
    district: "Inside Dhaka",
    tradeLicense: "",
    binVat: "",
    poReference: "",
  });
  const [paymentMethod, setPaymentMethod] = React.useState<"cod" | "prepaid">("cod");
  const [items, setItems] = React.useState<OrderLineItem[]>([]);
  const [productSearch, setProductSearch] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const deliveryCharge = COURIER_RATES[company.district] ?? 13000;

  const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const grandTotal = subtotal + deliveryCharge;

  const searchProducts = React.useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { listProductsAction } = await import("@/features/catalog/actions/product-actions");
      const res = await listProductsAction({ search: q } as any, { limit: 10 });
      if (res.success && res.data) {
        const raw = res.data as any;
        const items = raw?.items ?? (Array.isArray(raw) ? raw : []);
        setSearchResults(items);
      } else {
        setSearchResults([]);
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
    const wholesalePrice = pricing.wholesale ?? product.wholesalePrice ?? 0;
    const moq = product.moq ?? product.minOrderQuantity ?? 1;
    const tierPricing = pricing.tiers ?? product.tierPricing ?? [];
    const productId = product.id ?? product._id;

    if (!productId) {
      toast.error("Product identifier missing");
      return;
    }

    const newItem: OrderLineItem = {
      id: String(productId) + Date.now(),
      productId: String(productId),
      productName: product.title ?? product.name ?? "Product",
      variantSku: product.sku ?? "",
      quantity: moq,
      unitPrice: wholesalePrice,
      totalPrice: wholesalePrice * moq,
      moq,
      tierPricing,
    };
    setItems((prev) => [...prev, newItem]);
    setProductSearch("");
    setSearchResults([]);
    toast.success("Product added to bulk order");
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const qty = Math.max(item.moq, item.quantity + delta);
        const bestPrice = getBestTierPrice(item.tierPricing, qty) ?? item.unitPrice;
        return {
          ...item,
          quantity: qty,
          unitPrice: bestPrice,
          totalPrice: bestPrice * qty,
        };
      }),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const getBestTierPrice = (
    tiers: { minQty: number; price: number }[],
    qty: number,
  ): number | null => {
    if (!tiers.length) return null;
    const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
    for (const tier of sorted) {
      if (qty >= tier.minQty) return tier.price;
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!company.name.trim() || !company.phone.trim()) {
      toast.error("Company name and phone are required");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one product to the order");
      return;
    }

    const moqViolation = items.find((i) => i.quantity < i.moq);
    if (moqViolation) {
      toast.error(`Minimum order quantity for ${moqViolation.productName} is ${moqViolation.moq}`);
      return;
    }

    setSubmitting(true);
    try {
      const { completeRoleCheckoutAction } =
        await import("@/features/checkout/actions/checkout-actions");

      const res = await completeRoleCheckoutAction({
        type: "wholesaler",
        paymentMethod,
        deliveryCharge,
        customer: {
          name: company.name,
          phone: company.phone,
          email: company.email,
          address: company.address || company.district,
          district: company.district,
        },
        items: items.map((i) => ({
          productId: i.productId,
          variantSku: i.variantSku || undefined,
          quantity: i.quantity,
          unitPriceOverride: i.unitPrice,
        })),
      });

      if (res.success) {
        toast.success("Bulk order created");
        const orderId =
          (res.data as { orderId?: string; id?: string } | undefined)?.orderId ??
          (res.data as { id?: string } | undefined)?.id;
        router.push(orderId ? `/wholesale/bulk-orders/${orderId}` : "/wholesale/bulk-orders");
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
        title="Create Bulk Order"
        description="Place a wholesale bulk order for your business"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Company Info */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    value={company.name}
                    onChange={(e) => setCompany((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Business name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company-phone">Phone *</Label>
                  <Input
                    id="company-phone"
                    value={company.phone}
                    onChange={(e) => setCompany((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={company.email}
                    onChange={(e) => setCompany((p) => ({ ...p, email: e.target.value }))}
                    placeholder="business@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="po-reference">PO Reference</Label>
                  <Input
                    id="po-reference"
                    value={company.poReference}
                    onChange={(e) => setCompany((p) => ({ ...p, poReference: e.target.value }))}
                    placeholder="Purchase order number"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-address">Delivery Address *</Label>
                <Input
                  id="company-address"
                  value={company.address}
                  onChange={(e) => setCompany((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Full address"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="company-district">District *</Label>
                  <Select
                    value={company.district}
                    onValueChange={(v) => setCompany((p) => ({ ...p, district: v }))}
                  >
                    <SelectTrigger id="company-district">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_ZONES.map((z) => (
                        <SelectItem key={z} value={z}>
                          {z}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company-trade-license">Trade License</Label>
                  <Input
                    id="company-trade-license"
                    value={company.tradeLicense}
                    onChange={(e) => setCompany((p) => ({ ...p, tradeLicense: e.target.value }))}
                    placeholder="Trade license number"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-bin">BIN / VAT Number</Label>
                <Input
                  id="company-bin"
                  value={company.binVat}
                  onChange={(e) => setCompany((p) => ({ ...p, binVat: e.target.value }))}
                  placeholder="BIN or VAT number"
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Search */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Add Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name or SKU…"
                  className="pl-9"
                />
              </div>

              {searching && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Spinner size="sm" /> Searching…
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto divide-y divide-border rounded-lg border border-border">
                  {searchResults.map((p: any) => {
                    const pid = p.id ?? p._id;
                    const wholesalePrice = p.wholesalePrice ?? p.pricing?.wholesale ?? 0;
                    const moq = p.moq ?? p.minOrderQuantity ?? 1;
                    const stock = p.stock ?? p.inventory?.available ?? 0;
                    return (
                      <button
                        key={pid}
                        type="button"
                        onClick={() => addItem(p)}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                          stock <= 0 && "opacity-50",
                        )}
                        disabled={stock <= 0}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.title ?? p.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {p.sku ?? "—"} · MOQ: {moq} · Stock: {stock}
                          </p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-success shrink-0">
                          {formatCents(wholesalePrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          {items.length > 0 && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Order Items ({items.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          SKU: {item.variantSku || "—"} · MOQ: {item.moq}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {item.tierPricing.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.tierPricing.map((tier, i) => (
                          <span
                            key={i}
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded border",
                              item.quantity >= tier.minQty
                                ? "border-success/30 bg-success/10 text-success"
                                : "border-border text-muted-foreground",
                            )}
                          >
                            {tier.label ?? `${tier.minQty}+`}: {formatCents(tier.price)}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.id, -item.moq)}
                          disabled={item.quantity <= item.moq}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const qty = Math.max(item.moq, parseInt(e.target.value) || item.moq);
                            const bestPrice =
                              getBestTierPrice(item.tierPricing, qty) ?? item.unitPrice;
                            setItems((prev) =>
                              prev.map((it) =>
                                it.id === item.id
                                  ? {
                                      ...it,
                                      quantity: qty,
                                      unitPrice: bestPrice,
                                      totalPrice: bestPrice * qty,
                                    }
                                  : it,
                              ),
                            );
                          }}
                          min={item.moq}
                          className="w-20 h-8 text-center text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.id, item.moq)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex-1 text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatCents(item.unitPrice)} × {item.quantity}
                        </p>
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCents(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span className="tabular-nums">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatCents(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Delivery ({company.district})
                  </span>
                  <span className="tabular-nums">{formatCents(deliveryCharge)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Grand Total</span>
                  <span className="tabular-nums">{formatCents(grandTotal)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as "cod" | "prepaid")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="prepaid">Prepaid / Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {company.poReference && (
                <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">PO Ref: </span>
                  <span className="font-medium">{company.poReference}</span>
                </div>
              )}

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
                    Place Bulk Order
                  </>
                )}
              </Button>

              {items.length === 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  Search and add products to place a bulk order
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
              <p>• Minimum order quantity (MOQ) is enforced per product</p>
              <p>• Tier pricing applies automatically based on quantity</p>
              <p>• Add your PO reference for invoice matching</p>
              <p>• Delivery charge varies by district</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CreateBulkOrderPage(): React.ReactElement {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Loading bulk order form…
        </div>
      }
    >
      <CreateBulkOrderPageContent />
    </React.Suspense>
  );
}
