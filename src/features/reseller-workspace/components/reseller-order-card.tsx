"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  Phone,
  MessageSquare,
  Printer,
  Copy,
  ExternalLink,
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  ChevronRight,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export interface ResellerOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  district: string;
  productName: string;
  quantity: number;
  imageUrl?: string;
  sellingPrice: number; // in cents
  profit: number; // in cents
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "packed"
    | "courier_assigned"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "returned"
    | "cancelled"
    | string;
  courierName?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ResellerOrderCardProps {
  order: ResellerOrderItem;
  onDuplicate?: (order: ResellerOrderItem) => void;
  onRequestReturn?: (orderId: string) => void;
}

export function ResellerOrderCard({
  order,
  onDuplicate,
  onRequestReturn,
}: ResellerOrderCardProps): React.ReactElement {
  const sellingPriceTaka = Math.round(order.sellingPrice / 100);
  const profitTaka = Math.round(order.profit / 100);

  const cleanPhone = order.customerPhone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone}`}`;

  const handleCopyOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const summary = `📦 অর্ডার #${order.orderNumber}
👤 কাস্টমার: ${order.customerName} (${order.customerPhone})
📍 ঠিকানা/জেলা: ${order.district}
🛒 পণ্য: ${order.productName} (${order.quantity} টি)
💰 বিক্রয় মূল্য: ৳${sellingPriceTaka}
🚚 স্ট্যাটাস: ${order.status}`;
    navigator.clipboard.writeText(summary);
    toast.success("অর্ডার সামারি কপি করা হয়েছে!");
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.print();
  };

  return (
    <Card className="overflow-hidden border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs group">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/reseller/orders/${order.id}`}>
              <span className="text-sm font-black text-foreground hover:text-primary transition-colors font-mono">
                #{order.orderNumber}
              </span>
            </Link>
            <StatusChip label={order.status.replace(/_/g, " ")} tone={statusToneFromValue(order.status)} />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Body Grid: Customer Info & Product Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Customer & Location Box */}
          <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between">
              <span className="font-black text-foreground text-sm">{order.customerName}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" /> {order.district}
              </span>
            </div>
            <p className="font-mono text-muted-foreground font-bold">{order.customerPhone}</p>

            {/* Quick Contact Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`tel:${order.customerPhone}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] font-bold text-foreground hover:bg-muted transition-colors"
                title="Call Customer"
              >
                <Phone className="w-3 h-3 text-primary" /> কল দিন
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                title="WhatsApp Message"
              >
                <MessageSquare className="w-3 h-3" /> হোয়াটসঅ্যাপ
              </a>
            </div>
          </div>

          {/* Product & Earnings Box */}
          <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-card overflow-hidden shrink-0 border border-border/80">
                {order.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={order.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-6 h-6 text-muted-foreground m-auto" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-black text-foreground truncate">{order.productName}</p>
                <p className="text-[11px] font-bold text-muted-foreground">পরিমাণ: {order.quantity} টি</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs font-bold text-muted-foreground">বিল: <span className="text-foreground font-black">৳{sellingPriceTaka}</span></p>
              <p className="text-xs font-black text-success">প্রফিট: +৳{profitTaka}</p>
            </div>
          </div>
        </div>

        {/* Courier & Tracking Footer Row */}
        {order.courierName && (
          <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Truck className="w-4 h-4" />
              <span>কুরিয়ার: {order.courierName}</span>
              {order.trackingNumber && (
                <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                  (Trk: {order.trackingNumber})
                </span>
              )}
            </div>
            <Link
              href={`/reseller/orders/${order.id}`}
              className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-0.5"
            >
              ট্র্যাকিং দেখুন <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Actions Footer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyOrder}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-bold inline-flex items-center gap-1"
              title="Copy Summary"
            >
              <Copy className="w-3.5 h-3.5" /> কপি
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-bold inline-flex items-center gap-1"
              title="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5" /> প্রিন্ট
            </button>
          </div>

          <div className="flex items-center gap-2">
            {order.status === "delivered" && onRequestReturn && (
              <Button
                onClick={() => onRequestReturn(order.id)}
                variant="outline"
                size="sm"
                className="text-xs font-bold text-amber-500 border-amber-500/30 hover:bg-amber-500/10 gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> রিটার্ন রিকুয়েস্ট
              </Button>
            )}
            <Link href={`/reseller/orders/${order.id}`}>
              <Button size="sm" className="text-xs font-black gap-1 shadow-2xs">
                <Eye className="w-3.5 h-3.5" /> বিস্তারিত
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
