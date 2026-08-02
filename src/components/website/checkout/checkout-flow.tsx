"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronLeft,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Truck,
  User,
  Wallet,
  Minus,
  Plus,
  Trash2,
  Tag,
  CreditCard,
  Smartphone,
  CheckCircle2,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { useLocalCart } from "@/features/checkout/store/local-cart";
import { toast } from "sonner";
import {
  quoteStorefrontCheckoutAction,
  placeStorefrontOrderAction,
} from "@/features/checkout/actions/storefront-checkout-actions";
import type { StorefrontQuote } from "@/features/checkout/services/storefront-checkout-service";
import { SHIPPING_METHODS, PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";
import type { BdDistrict } from "@/config/bd-districts";
import { EmptyCart } from "@/components/website/empty-cart";
import { DistrictSelect } from "./district-select";
import { ThanaSelect } from "./thana-select";
import { CheckoutStepIndicator } from "./checkout-step-indicator";

interface CheckoutForm {
  receiverName: string;
  phone: string;
  email: string;
  districtId: string;
  district: string;
  upazila: string;
  division: string;
  address: string;
  deliveryNote: string;
}

const EMPTY_FORM: CheckoutForm = {
  receiverName: "",
  phone: "",
  email: "",
  districtId: "",
  district: "",
  upazila: "",
  division: "",
  address: "",
  deliveryNote: "",
};

type FieldErrors = Partial<Record<keyof CheckoutForm, string>>;

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

function validate(form: CheckoutForm): FieldErrors {
  const errors: FieldErrors = {};
  if (form.receiverName.trim().length < 3) errors.receiverName = "আপনার পুরো নাম লিখুন";

  const phone = form.phone.replace(/[\s-]/g, "").replace(/^\+?880/, "0");
  if (!/^01[3-9]\d{8}$/.test(phone)) errors.phone = "সঠিক মোবাইল নম্বর দিন (যেমন: 01712345678)";

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "সঠিক ইমেইল দিন";
  }
  if (form.address.trim().length < 8) {
    errors.address = "সম্পূর্ণ ঠিকানা লিখুন (বাসা/রোড/এলাকা)";
  }
  return errors;
}

const inputBase =
  "w-full h-12 rounded-xl border bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 " +
  "placeholder:text-slate-400 placeholder:font-medium " +
  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-amber-500";

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-black text-slate-800 dark:text-slate-200">
        {label}
        {required && (
          <span className="text-red-600 ml-0.5" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{hint}</p>}
      {error && (
        <p className="text-[11px] font-bold text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Text input with a leading icon — the icon column is what makes the form scan. */
function IconInput({
  id,
  icon: Icon,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  icon: React.ElementType;
  error?: boolean;
}) {
  return (
    <div className="relative">
      <Icon
        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
        aria-hidden
      />
      <input
        id={id}
        aria-invalid={error || undefined}
        className={cn(inputBase, "pl-10 pr-3.5", error ? "border-red-400" : "border-slate-300 dark:border-slate-700")}
        {...props}
      />
    </div>
  );
}

export function CheckoutFlow() {
  const cart = useLocalCart();
  const router = useRouter();

  const [form, setForm] = React.useState<CheckoutForm>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [shippingMethodId, setShippingMethodId] = React.useState(SHIPPING_METHODS[0]!.id);
  const [paymentMethod, setPaymentMethod] = React.useState<"cod" | "mfs" | "card">("cod");
  const [couponOpen, setCouponOpen] = React.useState(false);
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<{ code: string; amount: number } | null>(null);

  const [quote, setQuote] = React.useState<StorefrontQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = React.useState(false);
  const [placing, setPlacing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement>(null);

  const set = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const cartLines = React.useMemo(
    () =>
      cart.items.map((line) => ({
        productId: line.productId,
        variantSku: line.variantSku,
        quantity: line.quantity,
        customSellingPriceBdt: line.customSellingPrice ?? line.unitPrice,
      })),
    [cart.items],
  );

  const refreshQuote = React.useCallback(async () => {
    if (cartLines.length === 0) {
      setQuote(null);
      return;
    }
    setQuoteLoading(true);
    setError(null);
    try {
      const result = await quoteStorefrontCheckoutAction(cartLines);
      if (result.success) setQuote(result.data);
      else {
        setQuote(null);
        setError(result.error);
      }
    } catch {
      setQuote(null);
      setError("কার্ট যাচাই করতে সমস্যা হয়েছে। অনুগ্রহ করে পেজ রিফ্রেশ করুন।");
    } finally {
      setQuoteLoading(false);
    }
  }, [cartLines]);

  React.useEffect(() => {
    if (cart.hydrated) void refreshQuote();
  }, [cart.hydrated, refreshQuote]);

  const shippingMethod =
    SHIPPING_METHODS.find((m) => m.id === shippingMethodId) ?? SHIPPING_METHODS[0]!;
  const rawSubtotal = quote?.subtotal ?? 0;
  const discountAmount = appliedCoupon ? appliedCoupon.amount : 0;
  const subtotal = Math.max(0, rawSubtotal - discountAmount);
  const shippingCost = shippingMethod.cost;
  const grandTotal = subtotal + shippingCost;
  const itemCount = quote?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0;

  /** Picking a district seeds the delivery zone; the customer can still change it. */
  const onDistrictChange = (district: BdDistrict) => {
    setForm((prev) => ({
      ...prev,
      districtId: district.id,
      district: district.name,
      division: district.division,
    }));
    setErrors((prev) => ({ ...prev, districtId: undefined }));
    setShippingMethodId(district.insideDhakaCity ? "inside_dhaka" : "outside_dhaka");
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error("দয়া করে একটি সঠিক কুপন কোড লিখুন।");
      return;
    }

    try {
      const { validateCouponAction } = await import("@/features/pricing/actions/coupon-actions");
      const res = await validateCouponAction(code, rawSubtotal * 100);

      if (res.success && res.data) {
        const discountBDT = Math.round(res.data.discountCents / 100);
        setAppliedCoupon({ code, amount: discountBDT });
        toast.success(res.data.message);
      } else {
        toast.error(res.error || "অকার্যকর কুপন কোড।");
      }
    } catch {
      // Fallback preset demo support if database unavailable
      if (code === "WELCOME10") {
        const amt = Math.round((rawSubtotal * 10) / 100);
        setAppliedCoupon({ code, amount: amt });
        toast.success("১০% প্রমোশনাল কুপন প্রয়োগ হয়েছে!");
      } else {
        toast.error("কুপন যাচাইকরণে সমস্যা হয়েছে।");
      }
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0];
      const errorMessage = found[firstKey as keyof CheckoutForm];
      toast.error(errorMessage || "সকল প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন");
      document.getElementById(firstKey === "districtId" ? "district" : firstKey!)?.focus();
      return;
    }

    setPlacing(true);
    setError(null);
    try {
      const result = await placeStorefrontOrderAction({
        items: cartLines,
        shipping: {
          receiverName: form.receiverName,
          phone: form.phone,
          email: form.email || undefined,
          division: form.division,
          district: form.district,
          upazila: form.upazila || undefined,
          address: form.address,
          deliveryNote: form.deliveryNote || undefined,
        },
        shippingMethodId,
        paymentMethod: "cod",
      });
      setPlacing(false);

      if (!result.success) {
        setError(result.error);
        toast.error(result.error || "অর্ডার সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।");
        errorRef.current?.focus();
        void refreshQuote();
        return;
      }

      toast.success("অর্ডার সফলভাবে কনফার্ম হয়েছে!");
      cart.clear();
      const params = new URLSearchParams({
        n: result.data.orderNumber,
        k: result.data.accessToken,
      });
      router.push(`/order/success?${params.toString()}`);
    } catch (err) {
      setPlacing(false);
      const message = err instanceof Error ? err.message : "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে।";
      setError(message);
      toast.error(message);
    }
  };

  if (!cart.hydrated) {
    return (
      <div className="py-20 flex justify-center" aria-busy="true">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" aria-label="লোড হচ্ছে" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return <EmptyCart />;
  }

  const currentStep = form.receiverName && form.phone && form.address && form.districtId ? "payment" : "shipping";

  return (
    <div className="space-y-4 pb-28 md:pb-12">
      {/* Step Progress Bar */}
      <CheckoutStepIndicator currentStep={currentStep} />

      <form onSubmit={submit} noValidate className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-5 items-start">
        {/* ── Left Column: Shipping & Payment Details ──────────────── */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 -mx-3 sm:mx-0 border-y sm:border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl px-4 py-5 sm:p-7 sm:shadow-xs space-y-5">
            <div>
              <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-slate-100">
                অর্ডার কনফার্ম করুন
              </h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                নাম, মোবাইল নম্বর ও ডেলিভারি ঠিকানা দিন — আমরা ফোনে কনফার্ম করে ক্যাশ অন ডেলিভারিতে পণ্য পাঠাবো।
              </p>
            </div>

            {error && (
              <div
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-bold text-red-800 dark:text-red-300 outline-none"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <span>{error}</span>
              </div>
            )}

            {quote && quote.rejected.length > 0 && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-xs font-bold text-orange-900 dark:text-orange-300 space-y-1"
              >
                <p className="font-black">কিছু প্রোডাক্ট অর্ডার করা যাচ্ছে না:</p>
                {quote.rejected.map((r) => (
                  <p key={`${r.productId}-${r.variantSku ?? ""}`}>
                    • {r.name ?? "প্রোডাক্ট"} — {r.reason}
                  </p>
                ))}
              </div>
            )}

            {/* Recipient Name */}
            <Field id="receiverName" label="আপনার নাম" required error={errors.receiverName}>
              <IconInput
                id="receiverName"
                icon={User}
                autoComplete="name"
                placeholder="যেমন: মোহাম্মদ রহিম"
                value={form.receiverName}
                error={Boolean(errors.receiverName)}
                onChange={(e) => set("receiverName", e.target.value)}
              />
            </Field>

            {/* Mobile Phone */}
            <Field id="phone" label="মোবাইল নম্বর" required error={errors.phone}>
              <IconInput
                id="phone"
                icon={Phone}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                value={form.phone}
                error={Boolean(errors.phone)}
                onChange={(e) => set("phone", e.target.value)}
              />
            </Field>

            {/* Optional Email */}
            <Field
              id="email"
              label="ইমেইল (ঐচ্ছিক)"
              error={errors.email}
              hint="দিলে অর্ডারটি আপনার অ্যাকাউন্টের হিস্টোরিতে যুক্ত হবে।"
            >
              <IconInput
                id="email"
                icon={Mail}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                error={Boolean(errors.email)}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>

            {/* Full Street Address */}

            {/* Full Street Address */}
            <Field
              id="address"
              label="সম্পূর্ণ ঠিকানা"
              required
              error={errors.address}
              hint="বাসা/হোল্ডিং নম্বর, রোড, এলাকা ও বিস্তারিত ঠিকানা লিখুন।"
            >
              <textarea
                id="address"
                rows={3}
                autoComplete="street-address"
                placeholder="বাসা নং, রোড নং, এলাকা, উপজেলা/থানা, জেলা লিখুন (যেমন: বাসা ১২, রোড ৫, ধানমন্ডি, ধানমন্ডি থানা, ঢাকা)"
                value={form.address}
                aria-invalid={Boolean(errors.address) || undefined}
                onChange={(e) => set("address", e.target.value)}
                className={cn(
                  inputBase,
                  "h-auto py-3 px-3.5 resize-y leading-relaxed",
                  errors.address ? "border-red-400" : "border-slate-300 dark:border-slate-700",
                )}
              />
            </Field>

            {/* Delivery Method Selection */}
            <fieldset className="space-y-1.5 pt-1">
              <legend className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1.5">
                ডেলিভারি এরিয়া ও চার্জ
                <span className="text-red-600 ml-0.5" aria-hidden>
                  *
                </span>
              </legend>
              <div className="grid grid-cols-2 gap-2.5">
                {SHIPPING_METHODS.filter((m) => m.enabled).map((method) => {
                  const active = method.id === shippingMethodId;
                  return (
                    <label
                      key={method.id}
                      className={cn(
                        "flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 cursor-pointer transition-all active:scale-95 touch-manipulation",
                        active
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 font-bold shadow-2xs"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300",
                      )}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.id}
                        checked={active}
                        onChange={() => setShippingMethodId(method.id)}
                        className="h-4 w-4 accent-amber-500 shrink-0"
                      />
                      <span className="min-w-0">
                        <span className="block text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                          {method.label}
                        </span>
                        <span className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                          {formatBdt(method.cost)} • {method.eta}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Payment Method Cards */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                পেমেন্ট পদ্ধতি নির্বাচন করুন
              </label>

              <div className="space-y-2">
                {/* Cash on Delivery (COD) Option */}
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-98 touch-manipulation",
                    paymentMethod === "cod"
                      ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="h-4 w-4 accent-amber-500 shrink-0 mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden />
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                        ক্যাশ অন ডেলিভারি (Cash on Delivery)
                      </span>
                      <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        কোনো অগ্রিম চার্জ নেই
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      পণ্য হাতে পেয়ে ডেলিভারি ম্যানের কাছে ক্যাশে মূল্য পরিশোধ করুন।
                    </p>
                  </div>
                </label>

                {/* MFS (bKash/Nagad) Card */}
                <label
                  onClick={() => setPaymentMethod("mfs")}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-98 touch-manipulation opacity-85",
                    paymentMethod === "mfs"
                      ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "mfs"}
                    onChange={() => setPaymentMethod("mfs")}
                    className="h-4 w-4 accent-amber-500 shrink-0 mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-pink-600 dark:text-pink-400 shrink-0" aria-hidden />
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                        মোবাইল ব্যাংকিং (বিকাশ / নগদ / রকেট)
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      অর্ডার পরবর্তী ধাপে অনলাইন পেমেন্ট গেটওয়েতে রিডাইরেক্ট হবে।
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Collapsible Coupon Drawer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCouponOpen(!couponOpen)}
                className="flex items-center justify-between w-full py-2 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-amber-600 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                  <span>কুপন কোড যুক্ত করুন</span>
                  {appliedCoupon && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      প্রযুক্ত: {appliedCoupon.code}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", couponOpen && "rotate-180")}
                  aria-hidden
                />
              </button>

              {couponOpen && (
                <div className="flex gap-2 pt-2 animate-in slide-in-from-top-2 duration-200">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="যেমন: WELCOME10"
                    className="h-10 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="h-10 px-4 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-black transition-colors hover:bg-slate-800 active:scale-95"
                  >
                    প্রয়োগ
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Note */}
            <Field id="deliveryNote" label="বিশেষ নির্দেশনা (ঐচ্ছিক)">
              <textarea
                id="deliveryNote"
                rows={2}
                maxLength={300}
                placeholder="যেমন: ডেলিভারির আগে ফোন করবেন"
                value={form.deliveryNote}
                onChange={(e) => set("deliveryNote", e.target.value)}
                className={cn(inputBase, "h-auto py-3 px-3.5 resize-y border-slate-300 dark:border-slate-700")}
              />
            </Field>

            {/* In-Flow Mobile & Tablet Submit Button */}
            <div className="pt-2 lg:hidden">
              <Button
                type="submit"
                disabled={placing || quoteLoading || !quote || quote.lines.length === 0}
                className="w-full h-13 text-sm font-black bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 rounded-xl shadow-md transition-all disabled:opacity-50 touch-manipulation flex items-center justify-center gap-2"
              >
                {placing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    <span>অর্ডার তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4.5 w-4.5" aria-hidden />
                    <span>অর্ডার কনফার্ম করুন — {formatBdt(grandTotal)}</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <Link
            href="/cart"
            className="inline-flex items-center text-xs font-black text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-amber-500 rounded p-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" aria-hidden />
            <span>কার্টে ফিরুন</span>
          </Link>
        </div>

        {/* ── Right Column: Order Summary ─────────────────────────── */}
        <aside
          className="bg-white dark:bg-slate-900 -mx-3 sm:mx-0 border-y sm:border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl px-4 py-5 sm:p-6 sm:shadow-xs space-y-4 lg:sticky lg:top-24 h-fit"
          aria-label="অর্ডার সামারি"
        >
          <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            অর্ডার রিভিউ ({itemCount} টি)
          </h2>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1">
            {cart.items.map((line) => (
              <li
                key={`${line.productId}-${line.variantSku ?? ""}`}
                className="flex items-center justify-between gap-2.5 py-3"
              >
                {/* Product Thumbnail & Title */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                    <Image
                      src={line.image || PRODUCT_IMAGE_PLACEHOLDER}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {line.name}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {line.variantLabel ? `${line.variantLabel} • ` : ""}
                      {formatBdt(line.unitPrice)}/টি
                    </p>
                  </div>
                </div>

                {/* Interactive Quantity Controls & Delete Action */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (line.quantity <= 1) {
                          cart.removeItem(line.productId, line.variantSku);
                          toast.info(`"${line.name}" কার্ট থেকে সরানো হয়েছে`);
                        } else {
                          cart.setQuantity(line.productId, line.variantSku, line.quantity - 1);
                        }
                      }}
                      className="h-7 w-7 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 font-black transition-all active:scale-90 touch-manipulation"
                      title="পরিমাণ কমান"
                      aria-label="পরিমাণ কমান"
                    >
                      <Minus className="h-3 w-3" aria-hidden />
                    </button>

                    <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-slate-100 tabular-nums">
                      {line.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        cart.setQuantity(line.productId, line.variantSku, line.quantity + 1);
                      }}
                      className="h-7 w-7 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 font-black transition-all active:scale-90 touch-manipulation"
                      title="পরিমাণ বাড়ান"
                      aria-label="পরিমাণ বাড়ান"
                    >
                      <Plus className="h-3 w-3" aria-hidden />
                    </button>
                  </div>

                  {/* Delete Item Trash Button */}
                  <button
                    type="button"
                    onClick={() => {
                      cart.removeItem(line.productId, line.variantSku);
                      toast.info(`"${line.name}" কার্ট থেকে রিমুভ করা হয়েছে`);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors touch-manipulation active:scale-90"
                    title="প্রোডাক্টটি ডিলিট করুন"
                    aria-label={`কার্ট থেকে ${line.name} ডিলিট করুন`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {quoteLoading && !quote ? (
            <div className="space-y-2" aria-busy="true">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <dl className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <dt>সাবটোটাল</dt>
                <dd className="tabular-nums text-slate-900 dark:text-slate-100">{formatBdt(rawSubtotal)}</dd>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <dt>কুপন ছাড় ({appliedCoupon?.code})</dt>
                  <dd className="tabular-nums">-{formatBdt(discountAmount)}</dd>
                </div>
              )}

              <div className="flex justify-between">
                <dt className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  ডেলিভারি চার্জ
                </dt>
                <dd className="tabular-nums text-slate-900 dark:text-slate-100">
                  {shippingCost === 0 ? "ফ্রি" : formatBdt(shippingCost)}
                </dd>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-base font-black text-slate-900 dark:text-slate-100">
                <dt>সর্বমোট</dt>
                <dd className="text-amber-600 dark:text-amber-400 tabular-nums">{formatBdt(grandTotal)}</dd>
              </div>
            </dl>
          )}

          {/* Desktop Order Place Button */}
          <Button
            type="submit"
            disabled={placing || quoteLoading || !quote || quote.lines.length === 0}
            className="w-full h-12 text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 rounded-xl shadow-md transition-all disabled:opacity-50 touch-manipulation hidden lg:flex items-center justify-center gap-2"
          >
            {placing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span>অর্ডার তৈরি হচ্ছে...</span>
              </>
            ) : (
              <span>অর্ডার কনফার্ম করুন ({formatBdt(grandTotal)})</span>
            )}
          </Button>

          <p className="flex items-start gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-px text-emerald-600" aria-hidden />
            <span>অর্ডার প্লেস করার পর কোনো অগ্রিম পেমেন্ট ছাড়া আপনার অর্ডার প্রক্রিয়াকরণ শুরু হবে।</span>
          </p>
        </aside>
      </form>

      {/* Mobile Sticky Place Order Bar (fixed above 48px bottom nav) */}
      <div className="fixed bottom-12 inset-x-0 z-30 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-xl px-4 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              সর্বমোট ({itemCount} টি)
            </span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {formatBdt(grandTotal)}
            </span>
          </div>

          <Button
            type="button"
            onClick={(e) => submit(e as unknown as React.FormEvent)}
            disabled={placing || quoteLoading || !quote || quote.lines.length === 0}
            className="h-11 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-600 text-slate-950 font-black text-xs transition-all active:scale-95 shadow-md touch-manipulation"
          >
            {placing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" aria-hidden />
                <span>অর্ডার কনফার্ম করুন</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutFlow;
