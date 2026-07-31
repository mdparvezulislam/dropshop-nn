"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShoppingCart,
  RotateCcw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResellerStatusGuard } from "@/features/reseller-workspace/components/reseller-status-guard";
import {
  QuickOrderProductSearch,
  SelectedOrderProduct,
} from "@/features/reseller-workspace/components/quick-order-product-search";
import {
  QuickOrderCustomerForm,
  CustomerFormData,
} from "@/features/reseller-workspace/components/quick-order-customer-form";
import { QuickOrderLiveSummary } from "@/features/reseller-workspace/components/quick-order-live-summary";
import {
  QuickOrderSuccessModal,
  CreatedOrderDetails,
} from "@/features/reseller-workspace/components/quick-order-success-modal";
import { toast } from "sonner";

import { ResellerInvoiceModal } from "@/features/reseller-workspace/components/reseller-invoice-modal";
import type { ResellerOrderDTO } from "@/features/reseller/actions/reseller-order-actions";

const DEFAULT_CUSTOMER: CustomerFormData = {
  phone: "",
  name: "",
  districtId: "dhaka",
  district: "Dhaka",
  division: "Dhaka",
  upazila: "",
  fullAddress: "",
  email: "",
  note: "",
};

export default function ResellerQuickOrderPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlProductId = searchParams.get("productId");
  const urlPrice = searchParams.get("price");

  const [selectedProducts, setSelectedProducts] = React.useState<SelectedOrderProduct[]>([]);
  const [customer, setCustomer] = React.useState<CustomerFormData>(DEFAULT_CUSTOMER);
  const [deliveryChargeTaka, setDeliveryChargeTaka] = React.useState(60);
  const [advancePaidTaka, setAdvancePaidTaka] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [resellerStatus, setResellerStatus] = React.useState("active");
  const [createdOrder, setCreatedOrder] = React.useState<CreatedOrderDetails | null>(null);
  const [successModalOpen, setSuccessModalOpen] = React.useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = React.useState<ResellerOrderDTO | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = React.useState(false);

  const handlePrintInvoice = async (orderId: string) => {
    try {
      const { getResellerOrderDetailAction } = await import(
        "@/features/reseller/actions/reseller-order-actions"
      );
      const res = await getResellerOrderDetailAction(orderId);
      if (res.success && res.data) {
        setSelectedOrderForInvoice(res.data);
        setInvoiceModalOpen(true);
      } else {
        toast.error("ইনভয়েস তথ্য লোড করা যায়নি");
      }
    } catch {
      toast.error("ইনভয়েস লোড করতে সমস্যা হয়েছে");
    }
  };

  // Auto-update delivery charge when customer district changes
  React.useEffect(() => {
    const isDhaka = (customer.district || "Dhaka").toLowerCase().includes("dhaka");
    setDeliveryChargeTaka(isDhaka ? 60 : 120);
  }, [customer.district]);

  // Auto-load URL Product ID if provided
  React.useEffect(() => {
    async function loadFromUrl() {
      if (!urlProductId) return;
      try {
        const { searchResellerProductsAction } = await import(
          "@/features/reseller/actions/reseller-actions"
        );
        const res = await searchResellerProductsAction({ resellerId: "me", limit: 20 });
        if (res.success && res.data) {
          const items = (res.data as any).items || [];
          const found = items.find((p: any) => (p.id || p._id) === urlProductId);
          if (found) {
            const wholesaleCost = found.pricing?.costBasis ?? 90000;
            const minPrice = found.pricing?.minPrice ?? wholesaleCost;
            const suggestedPrice = found.pricing?.sellingPrice ?? Math.round(wholesaleCost * 1.1667);
            const customSellingPrice = urlPrice ? Math.round(parseFloat(urlPrice) * 100) : suggestedPrice;

            setSelectedProducts([
              {
                id: found.id || found._id,
                name: found.customTitle ?? found.product?.name ?? "Reseller Product",
                sku: found.variantSku ?? found.product?.sku ?? "RSL-9988",
                imageUrl: found.product?.primaryImage?.url || found.imageUrl,
                wholesaleCost,
                minPrice,
                suggestedPrice,
                customSellingPrice: Math.max(minPrice, customSellingPrice),
                quantity: 1,
                availableStock: found.availableStock ?? 15,
              },
            ]);
          }
        }
      } catch {
        // silent fallback
      }
    }
    loadFromUrl();
  }, [urlProductId, urlPrice]);

  // Restore Draft from localStorage
  React.useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("reseller_quick_order_draft");
      if (savedDraft && !urlProductId) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.customer) setCustomer(parsed.customer);
      }
    } catch {
      // silent fallback
    }
  }, [urlProductId]);

  // Save Draft to localStorage as user types
  React.useEffect(() => {
    try {
      localStorage.setItem("reseller_quick_order_draft", JSON.stringify({ customer }));
    } catch {
      // silent fallback
    }
  }, [customer]);

  const handleAddProduct = (product: SelectedOrderProduct) => {
    setSelectedProducts((prev) => [...prev, product]);
  };

  const handleUpdateProduct = (index: number, updated: SelectedOrderProduct) => {
    setSelectedProducts((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
    toast.info("প্রোডাক্ট রিমুভ করা হয়েছে");
  };

  const handleResetForm = () => {
    setSelectedProducts([]);
    setCustomer(DEFAULT_CUSTOMER);
    localStorage.removeItem("reseller_quick_order_draft");
    toast.info("ফাঁকা ফর্মে রিসেট করা হয়েছে");
  };

  const handleSubmitOrder = async () => {
    if (selectedProducts.length === 0) {
      toast.error("অনুগ্রহ করে অন্তত ১টি পণ্য যোগ করুন।");
      return;
    }

    for (const p of selectedProducts) {
      if (p.customSellingPrice < p.minPrice) {
        toast.error(`"${p.name}" পণ্যের বিক্রয় মূল্য নূন্যতম খরচের চেয়ে কম রাখা যাবে না!`);
        return;
      }
    }

    if (!customer.name.trim() || !customer.phone.trim() || !customer.fullAddress.trim()) {
      toast.error("অনুগ্রহ করে কাস্টমারের নাম, ফোন ও ঠিকানা পূরণ করুন।");
      return;
    }

    setSubmitting(true);

    try {
      const { completeRoleCheckoutAction } = await import(
        "@/features/checkout/actions/checkout-actions"
      );

      const isDhaka = (customer.district || "Dhaka").toLowerCase().includes("dhaka");
      const deliveryChargeCents = Math.round(deliveryChargeTaka * 100);
      const advancePaidCents = Math.round(advancePaidTaka * 100);

      const payload = {
        type: "reseller",
        items: selectedProducts.map((p) => ({
          productId: p.id,
          quantity: p.quantity,
          unitPriceOverride: p.customSellingPrice,
        })),
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          email: customer.email ? customer.email.trim() : undefined,
          address: customer.fullAddress.trim(),
          district: customer.district || "Dhaka",
          division: customer.division || customer.district || "Dhaka",
          upazila: customer.upazila || undefined,
        },
        paymentMethod: "cod",
        deliveryCharge: deliveryChargeCents,
        advancePaid: advancePaidCents,
        notes: customer.note || undefined,
      };

      const res = await completeRoleCheckoutAction(payload);

      if (!res.success || !res.data) {
        toast.error(res.error || "অর্ডার তৈরি ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
        return;
      }

      const created = res.data as any;
      const orderNumber = created.orderNumber || created.id?.slice(0, 8) || "RSL-9999";
      let subtotalTaka = 0;
      let costSubtotalTaka = 0;

      for (const p of selectedProducts) {
        const unitSelling = Math.round(p.customSellingPrice / 100);
        const unitCost = Math.round(p.wholesaleCost / 100);
        subtotalTaka += unitSelling * p.quantity;
        costSubtotalTaka += unitCost * p.quantity;
      }

      const standardCourierCostTaka = isDhaka ? 60 : 120;
      const grandTotalTaka = subtotalTaka + deliveryChargeTaka;
      const profitTaka = (subtotalTaka - costSubtotalTaka) + (deliveryChargeTaka - standardCourierCostTaka);

      setCreatedOrder({
        orderId: created.id || created._id,
        orderNumber,
        customerName: customer.name,
        customerPhone: customer.phone,
        grandTotal: grandTotalTaka,
        expectedProfit: profitTaka,
      });

      setSuccessModalOpen(true);
      toast.success(`অর্ডার #${orderNumber} সফলভাবে সম্পন্ন হয়েছে!`);

      // Clear draft
      localStorage.removeItem("reseller_quick_order_draft");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "অর্ডার তৈরিতে সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setSuccessModalOpen(false);
    setCreatedOrder(null);
    setSelectedProducts([]);
    setCustomer(DEFAULT_CUSTOMER);
    localStorage.removeItem("reseller_quick_order_draft");
  };

  return (
    <ResellerStatusGuard status={resellerStatus}>
      <div className="space-y-3 sm:space-y-6 animate-fade-in pb-24 lg:pb-8 max-w-7xl mx-auto px-0 sm:px-4">
        {/* Compact Mobile Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                Fast Sales Desk
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> Quick Entry
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-foreground mt-0.5">
              Quick Order Workspace
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold line-clamp-1">
              কাস্টমারের তথ্য ও নির্ধারিত বিক্রয় মূল্যে দ্রুত অর্ডার সম্পন্ন করুন।
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleResetForm}
              variant="outline"
              size="sm"
              className="gap-1 font-bold text-xs h-8 px-2.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> রিসেট
            </Button>
            <Link href="/reseller/orders">
              <Button variant="ghost" size="sm" className="gap-1 font-bold text-xs h-8 px-2.5">
                <ShoppingCart className="w-3.5 h-3.5" /> সকল অর্ডার
              </Button>
            </Link>
          </div>
        </div>

        {/* Sales Desk 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Left Column: Multi-Product Search & Customer Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <QuickOrderProductSearch
              selectedProducts={selectedProducts}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onRemoveProduct={handleRemoveProduct}
            />

            <QuickOrderCustomerForm value={customer} onChange={setCustomer} />
          </div>

          {/* Right Column: Live Order Summary & Profit Card (5 Cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20">
            <QuickOrderLiveSummary
              products={selectedProducts}
              customer={customer}
              deliveryChargeTaka={deliveryChargeTaka}
              onDeliveryChargeChange={setDeliveryChargeTaka}
              advancePaidTaka={advancePaidTaka}
              onAdvancePaidChange={setAdvancePaidTaka}
              submitting={submitting}
              onSubmitOrder={handleSubmitOrder}
            />
          </div>
        </div>

        {/* Post-Order Success Modal */}
        <QuickOrderSuccessModal
          open={successModalOpen}
          onOpenChange={setSuccessModalOpen}
          orderDetails={createdOrder}
          onCreateAnother={handleCreateAnother}
          onPrintInvoice={handlePrintInvoice}
        />

        {/* Printable/Downloadable Invoice Modal */}
        <ResellerInvoiceModal
          open={invoiceModalOpen}
          onOpenChange={setInvoiceModalOpen}
          order={selectedOrderForInvoice}
        />
      </div>
    </ResellerStatusGuard>
  );
}
