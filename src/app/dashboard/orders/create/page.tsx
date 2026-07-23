"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createManualOrderAction } from "@/features/order/actions/order-actions";
import { toast } from "sonner";
import { ArrowLeft, ShoppingCart, Plus, Trash2, Package, Smartphone, Users, Building2 } from "lucide-react";

interface LineItem {
  key: string;
  productId: string;
  productName: string;
  variantSku: string;
  quantity: number;
  unitSellingPrice: number;
  unitCostBasis: number;
}

type OrderSource = "manual" | "facebook" | "reseller" | "wholesale";
type OrderType = "customer" | "reseller" | "wholesaler";

const SOURCE_OPTIONS: { value: OrderSource; label: string; labelBn: string; icon: React.ElementType }[] = [
  { value: "manual", label: "Manual", labelBn: "ম্যানুয়াল", icon: ShoppingCart },
  { value: "facebook", label: "Facebook", labelBn: "ফেসবুক", icon: Smartphone },
  { value: "reseller", label: "Reseller", labelBn: "রিসেলার", icon: Users },
  { value: "wholesale", label: "Wholesale", labelBn: "হোলসেল", icon: Building2 },
];

function generateOrderNumber(): string {
  const prefix = "ORD";
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${ts}${rand}`;
}

export default function CreateOrderPage(): React.ReactElement {
  const router = useRouter();
  const [source, setSource] = React.useState<OrderSource>("manual");
  const [orderNumber] = React.useState(generateOrderNumber());
  const [saving, setSaving] = React.useState(false);

  const [customer, setCustomer] = React.useState({ name: "", phone: "", email: "", alternativePhone: "" });
  const [shipping, setShipping] = React.useState({
    receiverName: "", phone: "", division: "Dhaka", district: "", upazila: "", area: "", address: "", deliveryNote: "",
  });
  const [items, setItems] = React.useState<LineItem[]>([
    { key: "1", productId: "", productName: "", variantSku: "", quantity: 1, unitSellingPrice: 0, unitCostBasis: 0 },
  ]);
  const [discountTotal, setDiscountTotal] = React.useState(0);
  const [taxTotal, setTaxTotal] = React.useState(0);
  const [shippingCost, setShippingCost] = React.useState(0);
  const [note, setNote] = React.useState("");

  const nextKey = React.useRef(2);

  const addItem = () => {
    setItems((prev) => [...prev, { key: String(nextKey.current++), productId: "", productName: "", variantSku: "", quantity: 1, unitSellingPrice: 0, unitCostBasis: 0 }]);
  };

  const removeItem = (key: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateItem = (key: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, [field]: value } : i)));
  };

  const totals = React.useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.unitSellingPrice * i.quantity, 0);
    const grandTotal = subtotal + discountTotal + taxTotal + shippingCost;
    const totalCost = items.reduce((s, i) => s + i.unitCostBasis * i.quantity, 0);
    return { subtotal, grandTotal, totalCost, profit: subtotal - totalCost };
  }, [items, discountTotal, taxTotal, shippingCost]);

  const getType = (): OrderType => {
    if (source === "reseller") return "reseller";
    if (source === "wholesale") return "wholesaler";
    return "customer";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim()) {
      toast.error("গ্রাহকের নাম এবং ফোন প্রয়োজন"); return;
    }
    if (items.some((i) => !i.productName.trim())) {
      toast.error("সব পণ্যের নাম দিন"); return;
    }

    setSaving(true);
    try {
      const res = await createManualOrderAction({
        orderNumber,
        type: getType(),
        source,
        customer: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email || undefined,
          alternativePhone: customer.alternativePhone || undefined,
        },
        shipping: {
          receiverName: shipping.receiverName || customer.name,
          phone: shipping.phone || customer.phone,
          division: shipping.division,
          district: shipping.district,
          upazila: shipping.upazila,
          area: shipping.area,
          address: shipping.address,
          deliveryNote: shipping.deliveryNote || undefined,
        },
        items: items.filter((i) => i.productName.trim()).map((i) => ({
          productId: i.productId || `manual-${i.key}`,
          variantSku: i.variantSku || undefined,
          productName: i.productName,
          quantity: i.quantity,
          unitSellingPrice: Math.round(i.unitSellingPrice * 100),
          unitCostBasis: Math.round(i.unitCostBasis * 100),
          currency: "BDT",
          pricingSource: source === "reseller" ? "reseller" : source === "wholesale" ? "wholesale" : "retail",
        })),
        discountTotal: Math.round(discountTotal * 100),
        taxTotal: Math.round(taxTotal * 100),
        shippingCost: Math.round(shippingCost * 100),
        note: note || undefined,
      });

      if (res.success && res.data) {
        toast.success(`অর্ডার ${res.data.orderNumber} সফলভাবে তৈরি হয়েছে`);
        router.push(`/dashboard/orders/${res.data.id}`);
      } else {
        toast.error(res.error || "অর্ডার তৈরি ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatBdt = (amount: number) => `৳${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">নতুন অর্ডার তৈরি</h1>
            <p className="text-sm text-muted-foreground">{orderNumber}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Source Selection */}
          <Card className="border-border/50 bg-card">
            <CardHeader><CardTitle className="text-sm font-semibold">অর্ডার সোর্স</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SOURCE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = source === opt.value;
                  return (
                    <button key={opt.value} type="button" onClick={() => setSource(opt.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        isActive ? "border-primary bg-accent" : "border-border hover:border-border/80"
                      }`}>
                      <Icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground">{opt.labelBn}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card className="border-border/50 bg-card">
            <CardHeader><CardTitle className="text-sm font-semibold">গ্রাহকের তথ্য *</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="নাম *" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} required className="h-9" />
              <Input placeholder="ফোন *" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} required className="h-9" />
              <Input placeholder="ইমেইল" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="h-9" />
              <Input placeholder="বিকল্প ফোন" value={customer.alternativePhone} onChange={(e) => setCustomer({ ...customer, alternativePhone: e.target.value })} className="h-9" />
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card className="border-border/50 bg-card">
            <CardHeader><CardTitle className="text-sm font-semibold">ডেলিভারি ঠিকানা *</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="প্রাপকের নাম *" value={shipping.receiverName} onChange={(e) => setShipping({ ...shipping, receiverName: e.target.value })} className="h-9" />
              <Input placeholder="প্রাপকের ফোন *" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} className="h-9" />
              <Input placeholder="বিভাগ" value={shipping.division} onChange={(e) => setShipping({ ...shipping, division: e.target.value })} className="h-9" />
              <Input placeholder="জেলা *" value={shipping.district} onChange={(e) => setShipping({ ...shipping, district: e.target.value })} required className="h-9" />
              <Input placeholder="উপজেলা" value={shipping.upazila} onChange={(e) => setShipping({ ...shipping, upazila: e.target.value })} className="h-9" />
              <Input placeholder="এলাকা" value={shipping.area} onChange={(e) => setShipping({ ...shipping, area: e.target.value })} className="h-9" />
              <div className="sm:col-span-2">
                <Input placeholder="পূর্ণ ঠিকানা *" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} required className="h-9" />
              </div>
              <div className="sm:col-span-2">
                <Input placeholder="ডেলিভারি নোট" value={shipping.deliveryNote} onChange={(e) => setShipping({ ...shipping, deliveryNote: e.target.value })} className="h-9" />
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">পণ্যের তালিকা *</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> পণ্য যোগ করুন
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.key} className="flex flex-wrap items-end gap-2 p-3 rounded-lg border border-border/50 bg-muted/10">
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] text-muted-foreground">পণ্যের নাম</label>
                    <Input value={item.productName} onChange={(e) => updateItem(item.key, "productName", e.target.value)}
                      placeholder="পণ্যের নাম" className="h-8 text-xs" />
                  </div>
                  <div className="w-20">
                    <label className="text-[10px] text-muted-foreground">পরিমাণ</label>
                    <Input type="number" min={1} value={item.quantity}
                      onChange={(e) => updateItem(item.key, "quantity", parseInt(e.target.value) || 1)}
                      className="h-8 text-xs" />
                  </div>
                  <div className="w-24">
                    <label className="text-[10px] text-muted-foreground">বিক্রয় মূল্য (BDT)</label>
                    <Input type="number" min={0} step={0.01} value={item.unitSellingPrice}
                      onChange={(e) => updateItem(item.key, "unitSellingPrice", parseFloat(e.target.value) || 0)}
                      className="h-8 text-xs" />
                  </div>
                  <div className="w-24">
                    <label className="text-[10px] text-muted-foreground">কেনা মূল্য</label>
                    <Input type="number" min={0} step={0.01} value={item.unitCostBasis}
                      onChange={(e) => updateItem(item.key, "unitCostBasis", parseFloat(e.target.value) || 0)}
                      className="h-8 text-xs" />
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap pt-4">
                    = {formatBdt(item.unitSellingPrice * item.quantity)}
                  </div>
                  <button type="button" onClick={() => removeItem(item.key)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-md pt-4">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card className="border-border/50 bg-card">
            <CardHeader><CardTitle className="text-sm font-semibold">প্রাইসিং সারাংশ</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">ডিসকাউন্ট (BDT)</label>
                <Input type="number" min={0} step={0.01} value={discountTotal}
                  onChange={(e) => setDiscountTotal(parseFloat(e.target.value) || 0)} className="h-9" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">ট্যাক্স (BDT)</label>
                <Input type="number" min={0} step={0.01} value={taxTotal}
                  onChange={(e) => setTaxTotal(parseFloat(e.target.value) || 0)} className="h-9" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">শিপিং খরচ (BDT)</label>
                <Input type="number" min={0} step={0.01} value={shippingCost}
                  onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)} className="h-9" />
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-primary">গ্র্যান্ড টোটাল</p>
                <p className="text-xl font-bold text-primary">{formatBdt(totals.grandTotal)}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-400">আনুমানিক লাভ</p>
                <p className="text-lg font-bold text-emerald-400">{formatBdt(totals.profit)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          <Card className="border-border/50 bg-card">
            <CardHeader><CardTitle className="text-sm font-semibold">নোট (ঐচ্ছিক)</CardTitle></CardHeader>
            <CardContent>
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="অর্ডার সম্পর্কে নোট..."
                className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "সংরক্ষণ করা হচ্ছে..." : "অর্ডার তৈরি করুন"}
            </Button>
            <Link href="/dashboard/orders">
              <Button type="button" variant="outline">বাতিল</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
