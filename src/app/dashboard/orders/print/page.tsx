"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrderAction } from "@/features/order/actions/order-actions";
import { toast } from "sonner";
import { ArrowLeft, Printer, Download, FileText, Package, Truck } from "lucide-react";

function PrintCenterContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(!!orderId);

  React.useEffect(() => {
    if (orderId) {
      getOrderAction({ orderId }).then((res) => {
        if (res.success && res.data) setOrder(res.data);
        else toast.error("অর্ডার পাওয়া যায়নি");
        setLoading(false);
      });
    }
  }, [orderId]);

  const handlePrint = (type: string) => {
    toast.success(`${type} প্রিন্ট শুরু হয়েছে`);
    window.print();
  };

  const formatCurrency = (amount: number) =>
    `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const PRINT_OPTIONS = [
    { id: "invoice", label: "ইনভয়েস", labelEn: "Invoice", icon: FileText, color: "text-blue-400" },
    {
      id: "packing_slip",
      label: "প্যাকিং স্লিপ",
      labelEn: "Packing Slip",
      icon: Package,
      color: "text-emerald-400",
    },
    {
      id: "courier_label",
      label: "কুরিয়ার লেবেল",
      labelEn: "Courier Label",
      icon: Truck,
      color: "text-violet-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/orders"
          className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">প্রিন্ট সেন্টার</h1>
          <p className="text-sm text-muted-foreground">
            Print Center — Invoice, Packing Slip, Courier Label
          </p>
        </div>
      </div>

      {orderId && order && !loading && (
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">{order.orderNumber}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {PRINT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => handlePrint(opt.label)}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-accent transition-all"
                >
                  <Icon className={`h-10 w-10 ${opt.color}`} />
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.labelEn}</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      <Printer className="h-3 w-3" /> A4
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      <Printer className="h-3 w-3" /> Thermal
                    </span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Multi-order print */}
      {!orderId && (
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">একাধিক অর্ডার প্রিন্ট</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              একটি অর্ডার সিলেক্ট করে প্রিন্ট করতে অর্ডার ড্যাশবোর্ড থেকে অর্ডার সিলেক্ট করুন, অথবা
              নিচের লিংকে ক্লিক করুন।
            </p>
            <div className="flex gap-3">
              <Link href="/dashboard/orders">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-1" /> অর্ডার প্যানেলে যান
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center text-muted-foreground py-12">অর্ডার লোড হচ্ছে...</div>
      )}

      {/* Print-only invoice preview */}
      {order && !loading && (
        <div className="print-only p-8 bg-white text-black hidden print:block">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">INVOICE</h2>
            <p className="text-sm">{order.orderNumber}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="font-semibold">Customer</p>
              <p>{order.customer?.name}</p>
              <p>{order.customer?.phone}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Date</p>
              <p>{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.pricing?.items ?? []).map((item: any, i: number) => (
                <tr key={i} className="border-b border-gray-300">
                  <td className="py-2">{item.productName}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">{formatCurrency(item.unitSellingPrice)}</td>
                  <td className="text-right py-2">{formatCurrency(item.totalSellingPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right text-sm font-bold">
            Grand Total: {formatCurrency(order.pricing?.grandTotal ?? 0)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PrintCenterPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <PrintCenterContent />
    </Suspense>
  );
}
