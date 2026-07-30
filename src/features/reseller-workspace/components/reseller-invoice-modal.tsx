"use client";

import * as React from "react";
import { Printer, X, Download, CheckCircle2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResellerOrderDTO } from "@/features/reseller/actions/reseller-order-actions";

interface ResellerInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ResellerOrderDTO | null;
  shopName?: string;
  shopPhone?: string;
  shopAddress?: string;
  invoiceFooter?: string;
}

export function ResellerInvoiceModal({
  open,
  onOpenChange,
  order,
  shopName = "Unique Store Bd",
  shopPhone = "01700000000",
  shopAddress = "Dhaka, Bangladesh",
  invoiceFooter = "আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!",
}: ResellerInvoiceModalProps): React.ReactElement | null {
  if (!open || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const o: any = order;
  const actualShopName =
    o.resellerShopName ||
    o.resellerStoreName ||
    o.storeName ||
    o.shopName ||
    (o.resellerName ? `${o.resellerName} Store` : undefined) ||
    "Unique Store Bd";

  const actualShopPhone =
    o.resellerPhone ||
    o.resellerContact ||
    o.shopPhone ||
    shopPhone ||
    "01608257877";

  const actualShopAddress =
    o.resellerAddress ||
    o.shopAddress ||
    shopAddress ||
    "Dhanmondi, Dhaka, Bangladesh";

  const itemsSubtotalTaka =
    order.items && order.items.length > 0
      ? order.items.reduce(
          (sum, item) =>
            sum + Math.round((item.unitSellingPrice * item.quantity) / 100),
          0,
        )
      : Math.max(0, Math.round(order.sellingPriceCents / 100) - Math.round(order.deliveryChargeCents / 100));

  const deliveryTaka = Math.round(order.deliveryChargeCents / 100);
  const grandTotalTaka = itemsSubtotalTaka + deliveryTaka;
  const advancePaidTaka = Math.round((order.advancePaidCents || 0) / 100);
  const dueTaka = Math.max(0, grandTotalTaka - advancePaidTaka);

  const formattedDate = new Date(order.createdAt).toLocaleString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Actions (Screen only) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
              ইনভয়েস প্রিভিউ (#{order.orderNumber})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 text-xs shadow-sm"
            >
              <Download className="w-4 h-4" /> Download Invoice
            </Button>
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1 text-xs shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </Button>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div id="printable-invoice" className="p-6 sm:p-8 space-y-6 text-slate-900 dark:text-slate-100 bg-white font-sans">
          {/* Header & Store Logo Info */}
          <div className="flex flex-row justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-rose-600">
                <Store className="w-6 h-6 stroke-[2.5]" />
                <span className="text-xl font-black tracking-tight">{actualShopName}</span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                ফোন: {actualShopPhone} | ঠিকানা: {actualShopAddress}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-black uppercase tracking-wider">
                INVOICE / মেমো
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                আইডি: #{order.orderNumber}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold">
                তারিখ: {formattedDate}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                গ্রাহক তথ্য (BILL TO)
              </span>
              <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
              <p className="font-mono text-slate-700 font-bold">{order.customerPhone}</p>
              {order.customerEmail && <p className="text-slate-600">{order.customerEmail}</p>}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                ডেলিভারি ঠিকানা (SHIP TO)
              </span>
              <p className="font-bold text-slate-900">{order.fullAddress}</p>
              <p className="text-slate-700 font-semibold">
                {order.upazila ? `${order.upazila}, ` : ""}{order.district}
              </p>
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-900 font-black border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-12 border-r border-slate-200">#</th>
                  <th className="p-2.5 border-r border-slate-200">প্রোডাক্ট বিবরণ</th>
                  <th className="p-2.5 text-center w-16 border-r border-slate-200">পরিমাণ</th>
                  <th className="p-2.5 text-right w-24 border-r border-slate-200">একক মূল্য</th>
                  <th className="p-2.5 text-right w-28">মোট মূল্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="p-2.5 text-center border-r border-slate-200 font-mono">
                        {i + 1}
                      </td>
                      <td className="p-2.5 border-r border-slate-200">
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        {item.variantSku && (
                          <span className="text-[10px] text-slate-500">
                            SKU: {item.variantSku}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center border-r border-slate-200 font-mono font-bold">
                        {item.quantity}
                      </td>
                      <td className="p-2.5 text-right border-r border-slate-200 font-mono">
                        ৳{Math.round(item.unitSellingPrice / 100)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        ৳{Math.round((item.unitSellingPrice * item.quantity) / 100)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-2.5 text-center border-r border-slate-200 font-mono">1</td>
                    <td className="p-2.5 border-r border-slate-200">
                      <p className="font-bold text-slate-900">{order.productName}</p>
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200 font-mono font-bold">
                      {order.quantity}
                    </td>
                    <td className="p-2.5 text-right border-r border-slate-200 font-mono">
                      ৳{itemsSubtotalTaka}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      ৳{itemsSubtotalTaka}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="space-y-1 text-xs text-slate-600 max-w-xs">
              <span className="font-bold text-slate-900 block">কুরিয়ার ও পেমেন্ট তথ্য:</span>
              <p>কুরিয়ার: {order.courierName || "Steadfast Courier"}</p>
              {order.trackingNumber && <p className="font-mono">ট্র্যাকিং ID: {order.trackingNumber}</p>}
              <p className="pt-1 text-[11px] text-slate-500">
                পেমেন্ট মেথড: ক্যাশ অন ডেলিভারি (COD)
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs font-semibold p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-slate-700">
                <span>পণ্য বিক্রয় মূল্য (Subtotal):</span>
                <span className="font-mono font-bold">৳{itemsSubtotalTaka}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-mono font-bold">+৳{deliveryTaka}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                <span>সর্বমোট বিল (Total Bill):</span>
                <span className="font-mono font-bold">৳{grandTotalTaka}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>অগ্রিম পরিশোধ (Paid):</span>
                <span className="font-mono text-emerald-600 font-bold">৳{advancePaidTaka}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-200">
                <span>কলেকশন / বকেয়া (Amount Due):</span>
                <span className="font-mono text-rose-600 text-base">৳{dueTaka}</span>
              </div>
            </div>
          </div>

          {/* Footer Note & Signature */}
          <div className="pt-6 border-t border-slate-200 flex flex-row justify-between items-center text-[11px] text-slate-500">
            <div>
              <p className="font-bold text-slate-700">{invoiceFooter}</p>
              <p>এটি একটি ডিজিটাল জেনারেটেড ইনভয়েস।</p>
            </div>
            <div className="text-right">
              <div className="h-8 border-b border-slate-400 w-28 mb-1"></div>
              <p className="font-bold text-slate-700">অনুমোদিত স্বাক্ষর</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
