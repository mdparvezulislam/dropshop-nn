"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Printer,
  Download,
  Copy,
  Share2,
  Plus,
  ShoppingCart,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface CreatedOrderDetails {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  grandTotal: number;
  expectedProfit: number;
}

export interface QuickOrderSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderDetails: CreatedOrderDetails | null;
  onCreateAnother: () => void;
  onPrintInvoice?: (orderId: string) => void;
}

export function QuickOrderSuccessModal({
  open,
  onOpenChange,
  orderDetails,
  onCreateAnother,
  onPrintInvoice,
}: QuickOrderSuccessModalProps): React.ReactElement {
  if (!orderDetails) return <></>;

  const orderSummaryText = `🎉 অর্ডার নম্বর: ${orderDetails.orderNumber}
👤 কাস্টমার: ${orderDetails.customerName} (${orderDetails.customerPhone})
💰 মোট বিল: ৳${orderDetails.grandTotal}
📈 আনুমানিক প্রফিট: ৳${orderDetails.expectedProfit}
সহযোগিতার জন্য ধন্যবাদ!`;

  const handleCopyOrder = () => {
    navigator.clipboard.writeText(orderSummaryText);
    toast.success("অর্ডার সামারি কপি করা হয়েছে!");
  };

  const handlePrint = () => {
    if (onPrintInvoice && orderDetails.orderId) {
      onPrintInvoice(orderDetails.orderId);
    } else {
      window.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 gap-0 overflow-hidden bg-card border-border shadow-2xl animate-fade-in">
        <DialogTitle className="sr-only">Order Created Successfully</DialogTitle>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success border border-success/30 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-success bg-success/15 px-2.5 py-0.5 rounded-full">
              Order Confirmed
            </span>
            <h2 className="text-2xl font-black text-foreground pt-1">
              অর্ডারটি সফলভাবে তৈরি হয়েছে!
            </h2>
            <p className="text-xs font-mono font-bold text-primary text-base">
              #{orderDetails.orderNumber}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-semibold">কাস্টমার:</span>
              <span className="font-bold text-foreground">{orderDetails.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-semibold">মোবাইল:</span>
              <span className="font-bold text-foreground">{orderDetails.customerPhone}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border/40 font-bold">
              <span className="text-foreground">মোট বিল (Grand Total):</span>
              <span className="text-primary font-black">৳{orderDetails.grandTotal}</span>
            </div>
            <div className="flex justify-between font-bold text-success">
              <span>আপনার প্রফিট (Estimated Profit):</span>
              <span className="font-black">+৳{orderDetails.expectedProfit}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button onClick={handleCopyOrder} variant="outline" size="sm" className="gap-1.5 font-bold text-xs">
              <Copy className="w-4 h-4" /> Copy Order
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="gap-1.5 font-bold text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 border-rose-200 dark:border-rose-900"
            >
              <Download className="w-4 h-4" /> Print / Download Invoice
            </Button>
          </div>

          <div className="pt-2 space-y-2">
            <Button onClick={onCreateAnother} className="w-full font-black text-xs gap-1.5 shadow-md">
              <Plus className="w-4 h-4 stroke-[3]" /> নতুন অর্ডার তৈরি করুন (Create Another)
            </Button>
            <Link href="/reseller/orders" className="block w-full">
              <Button variant="ghost" className="w-full text-xs font-bold gap-1 text-muted-foreground hover:text-foreground">
                সকল অর্ডার দেখুন <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
