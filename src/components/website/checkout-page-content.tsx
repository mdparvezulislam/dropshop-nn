"use client";

import { useState, useEffect } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { CheckoutStepIndicator } from "@/components/website/checkout-step-indicator";
import { CheckoutCustomerForm, type CustomerFormData } from "@/components/website/checkout-customer-form";
import { CheckoutShippingForm, type ShippingFormData } from "@/components/website/checkout-shipping-form";
import { CheckoutPaymentForm, type PaymentMethod } from "@/components/website/checkout-payment-form";
import { CheckoutReview } from "@/components/website/checkout-review";
import { CheckoutSummary } from "@/components/website/checkout-summary";

const STEPS = [
  { id: "customer", label: "Customer" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

interface CheckoutItem {
  productId: string;
  name: string;
  quantity: number;
  resolvedPrice: number;
  variantSku?: string;
  image?: string;
}

interface CheckoutPageContentProps {
  checkoutId: string;
  initialItems: CheckoutItem[];
  subtotal: number;
  currency?: string;
  sessionId?: string;
  userId?: string;
}

export function CheckoutPageContent({
  checkoutId,
  initialItems,
  subtotal,
  currency = "BDT",
  sessionId,
  userId,
}: CheckoutPageContentProps) {
  const { userRole } = usePermissions();
  const [step, setStep] = useState("customer");
  const [items] = useState(initialItems);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState<CustomerFormData>({
    name: "",
    phone: "",
    email: "",
  });

  const [shipping, setShipping] = useState<ShippingFormData>({
    division: "",
    district: "",
    area: "",
    address: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const [shippingCost] = useState(120);

  const cartType =
    userRole === "wholesaler" ? "wholesaler" :
    userRole === "reseller" ? "reseller" : "guest";

  useEffect(() => {
    const saved = sessionStorage.getItem(`checkout_${checkoutId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.customer) setCustomer(parsed.customer);
        if (parsed.shipping) setShipping(parsed.shipping);
        if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
        if (parsed.step) setStep(parsed.step);
      } catch {}
    }
  }, [checkoutId]);

  useEffect(() => {
    sessionStorage.setItem(
      `checkout_${checkoutId}`,
      JSON.stringify({ customer, shipping, paymentMethod, step }),
    );
  }, [checkoutId, customer, shipping, paymentMethod, step]);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError("");

    try {
      const { completeRoleCheckoutAction } = await import(
        "@/features/checkout/actions/checkout-actions"
      );

      const result = await completeRoleCheckoutAction({
        type: cartType,
        sessionId,
        userId,
        paymentMethod,
        customer: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email || undefined,
          address: shipping.address,
          district: shipping.district,
          division: shipping.division,
          upazila: shipping.area,
          area: shipping.area,
        },
        items: items.map((item) => ({
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: item.quantity,
        })),
        deliveryCharge: shippingCost,
      });

      if (result.success && result.data) {
        sessionStorage.removeItem(`checkout_${checkoutId}`);
        window.location.href = `/order/${result.data.draft.id}`;
      } else {
        setError(result.error ?? "Checkout failed. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const total = subtotal + shippingCost;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2">
        <CheckoutStepIndicator steps={STEPS} currentStep={step} />

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === "customer" && (
          <CheckoutCustomerForm
            data={customer}
            onChange={setCustomer}
            onSubmit={() => setStep("shipping")}
          />
        )}

        {step === "shipping" && (
          <CheckoutShippingForm
            data={shipping}
            onChange={setShipping}
            onSubmit={() => setStep("payment")}
            onBack={() => setStep("customer")}
          />
        )}

        {step === "payment" && (
          <CheckoutPaymentForm
            selected={paymentMethod}
            onSelect={setPaymentMethod}
            onSubmit={() => setStep("review")}
            onBack={() => setStep("shipping")}
          />
        )}

        {step === "review" && (
          <CheckoutReview
            items={items}
            customer={customer}
            shipping={shipping}
            paymentMethod={paymentMethod}
            subtotal={subtotal}
            shippingCost={shippingCost}
            currency={currency}
            onBack={() => setStep("payment")}
            onSubmit={handlePlaceOrder}
            submitting={submitting}
          />
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24">
          <CheckoutSummary
            items={items}
            subtotal={subtotal}
            shippingCost={shippingCost}
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
}
