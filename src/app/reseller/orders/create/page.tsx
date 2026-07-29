"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  ArrowLeft,
  Store,
  Sparkles,
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

const DEFAULT_CUSTOMER: CustomerFormData = {
  phone: "",
  name: "",
  district: "Dhaka",
  fullAddress: "",
  email: "",
  note: "",
};

export default function ResellerQuickOrderPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlProductId = searchParams.get("productId");
  const urlPrice = searchParams.get("price");

  const [selectedProduct, setSelectedProduct] = React.useState<SelectedOrderProduct | null>(null);
  const [customer, setCustomer] = React.useState<CustomerFormData>(DEFAULT_CUSTOMER);
  const [submitting, setSubmitting] = React.useState(false);
  const [resellerStatus, setResellerStatus] = React.useState("active");
  const [createdOrder, setCreatedOrder] = React.useState<CreatedOrderDetails | null>(null);
  const [successModalOpen, setSuccessModalOpen] = React.useState(false);

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
            const wholesaleCost = found.pricing?.costBasis ?? 150000;
            const minPrice = found.pricing?.minPrice ?? Math.round(wholesaleCost * 1.05);
            const suggestedPrice = found.pricing?.sellingPrice ?? Math.round(wholesaleCost * 1.25);
            const customSellingPrice = urlPrice ? Math.round(parseFloat(urlPrice) * 100) : suggestedPrice;

            setSelectedProduct({
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
            });
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

  const handleResetForm = () => {
    setSelectedProduct(null);
    setCustomer(DEFAULT_CUSTOMER);
    localStorage.removeItem("reseller_quick_order_draft");
    toast.info("ফাঁকা ফর্মে রিসেট করা হয়েছে");
  };

  const handleSubmitOrder = async () => {
    if (!selectedProduct) {
      toast.error("অনুগ্রহ করে একটি পণ্য নির্বাচন করুন।");
      return;
    }

    if (selectedProduct.customSellingPrice < selectedProduct.minPrice) {
      toast.error("নূন্যতম বিক্রয় মূল্য (রিসেলার মূল্যের চেয়ে কম দামে বিক্রি করা সম্ভব নয়)");
      return;
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
      const deliveryChargeCents = isDhaka ? 8000 : 15000;

      const payload = {
        type: "reseller",
        items: [
          {
            productId: selectedProduct.id,
            quantity: selectedProduct.quantity,
            unitPriceOverride: selectedProduct.customSellingPrice,
          },
        ],
        customer: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email || undefined,
          addressLine1: customer.fullAddress,
          city: customer.district || "Dhaka",
          district: customer.district || "Dhaka",
          country: "Bangladesh",
        },
        shippingAddress: {
          name: customer.name,
          phone: customer.phone,
          addressLine1: customer.fullAddress,
          city: customer.district || "Dhaka",
          district: customer.district || "Dhaka",
          country: "Bangladesh",
        },
        paymentMethod: "cod",
        deliveryFee: deliveryChargeCents,
        notes: customer.note || undefined,
      };

      const res = await completeRoleCheckoutAction(payload);

      if (!res.success || !res.data) {
        toast.error(res.error || "অর্ডার তৈরি ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
        return;
      }

      const created = res.data as any;
      const orderNumber = created.orderNumber || created.id?.slice(0, 8) || "RSL-9999";
      const unitPriceTaka = Math.round(selectedProduct.customSellingPrice / 100);
      const unitCostTaka = Math.round(selectedProduct.wholesaleCost / 100);
      const subtotalTaka = unitPriceTaka * selectedProduct.quantity;
      const deliveryTaka = isDhaka ? 80 : 150;
      const grandTotalTaka = subtotalTaka + deliveryTaka;
      const profitTaka = (unitPriceTaka - unitCostTaka) * selectedProduct.quantity;

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
    setSelectedProduct(null);
    setCustomer(DEFAULT_CUSTOMER);
    localStorage.removeItem("reseller_quick_order_draft");
  };

  return (
    <ResellerStatusGuard status={resellerStatus}>
      <div className="space-y-6 animate-fade-in pb-24 lg:pb-8">
        {/* Workspace Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                Fast Sales Desk
              </span>
              <span className="text-xs font-bold text-success flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" /> 30-Sec Order Entry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
              Quick Order Workspace
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
              কাস্টমার তথ্য ও নির্ধারিত বিক্রয় মূল্যে ৩০ সেকেন্ডের মধ্যে দ্রুত অর্ডার প্লেস করুন।
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleResetForm}
              variant="outline"
              size="sm"
              className="gap-1.5 font-bold text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> ফাঁকা ফর্ম
            </Button>
            <Link href="/reseller/orders">
              <Button variant="ghost" size="sm" className="gap-1.5 font-bold text-xs">
                <ShoppingCart className="w-4 h-4" /> সকল অর্ডার
              </Button>
            </Link>
          </div>
        </div>

        {/* Sales Desk 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Search & Customer Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <QuickOrderProductSearch
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              onUpdateProduct={setSelectedProduct}
            />

            <QuickOrderCustomerForm value={customer} onChange={setCustomer} />
          </div>

          {/* Right Column: Live Order Summary & Profit Card (5 Cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20">
            <QuickOrderLiveSummary
              product={selectedProduct}
              customer={customer}
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
        />
      </div>
    </ResellerStatusGuard>
  );
}
