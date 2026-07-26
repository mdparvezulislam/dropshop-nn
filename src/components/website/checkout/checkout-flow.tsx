"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Truck,
  Wallet,
  ClipboardCheck,
  ChevronLeft,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { useLocalCart } from "@/features/checkout/store/local-cart";
import {
  quoteStorefrontCheckoutAction,
  placeStorefrontOrderAction,
} from "@/features/checkout/actions/storefront-checkout-actions";
import type { StorefrontQuote } from "@/features/checkout/services/storefront-checkout-service";
import { PAYMENT_METHODS, SHIPPING_METHODS, PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";
import { EmptyCart } from "@/components/website/empty-cart";

const BD_DIVISIONS = [
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "রংপুর",
  "ময়মনসিংহ",
] as const;

const STEPS = [
  { id: "address", label: "ঠিকানা", icon: MapPin },
  { id: "shipping", label: "ডেলিভারি", icon: Truck },
  { id: "payment", label: "পেমেন্ট", icon: Wallet },
  { id: "review", label: "রিভিউ", icon: ClipboardCheck },
] as const;

type StepId = (typeof STEPS)[number]["id"];

interface AddressForm {
  receiverName: string;
  phone: string;
  email: string;
  division: string;
  district: string;
  upazila: string;
  postalCode: string;
  address: string;
  landmark: string;
  addressLabel: "home" | "office";
  deliveryNote: string;
}

const EMPTY_ADDRESS: AddressForm = {
  receiverName: "",
  phone: "",
  email: "",
  division: "",
  district: "",
  upazila: "",
  postalCode: "",
  address: "",
  landmark: "",
  addressLabel: "home",
  deliveryNote: "",
};

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

function validateAddress(form: AddressForm): Partial<Record<keyof AddressForm, string>> {
  const errors: Partial<Record<keyof AddressForm, string>> = {};
  if (form.receiverName.trim().length < 3) errors.receiverName = "পুরো নাম লিখুন";
  const phone = form.phone.replace(/[\s-]/g, "").replace(/^\+?880/, "0");
  if (!/^01[3-9]\d{8}$/.test(phone)) errors.phone = "সঠিক মোবাইল নম্বর দিন (যেমন: 01712345678)";
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "সঠিক ইমেইল দিন";
  if (!form.division) errors.division = "বিভাগ নির্বাচন করুন";
  if (form.district.trim().length < 2) errors.district = "জেলা লিখুন";
  if (form.upazila.trim().length < 2) errors.upazila = "উপজেলা/এলাকা লিখুন";
  if (form.postalCode.trim() && !/^\d{4}$/.test(form.postalCode.trim()))
    errors.postalCode = "৪ সংখ্যার পোস্ট কোড দিন";
  if (form.address.trim().length < 8) errors.address = "সম্পূর্ণ ঠিকানা লিখুন";
  return errors;
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-black text-slate-800">
        {label}
        {required && (
          <span className="text-red-600 ml-0.5" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-[11px] font-bold text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus-visible:outline-2 focus-visible:outline-amber-500";

export function CheckoutFlow() {
  const cart = useLocalCart();
  const router = useRouter();

  const [step, setStep] = React.useState<StepId>("address");
  const [addressForm, setAddressForm] = React.useState<AddressForm>(EMPTY_ADDRESS);
  const [addressErrors, setAddressErrors] = React.useState<
    Partial<Record<keyof AddressForm, string>>
  >({});
  const [shippingMethodId, setShippingMethodId] = React.useState("standard");
  const [paymentMethod, setPaymentMethod] = React.useState("cod");
  const [quote, setQuote] = React.useState<StorefrontQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = React.useState(false);
  const [placing, setPlacing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const cartLines = React.useMemo(
    () =>
      cart.items.map((line) => ({
        productId: line.productId,
        variantSku: line.variantSku,
        quantity: line.quantity,
      })),
    [cart.items],
  );

  // Server revalidation: on entry and whenever the cart changes.
  const refreshQuote = React.useCallback(async () => {
    if (cartLines.length === 0) {
      setQuote(null);
      return;
    }
    setQuoteLoading(true);
    setError(null);
    const result = await quoteStorefrontCheckoutAction(cartLines);
    setQuoteLoading(false);
    if (result.success) {
      setQuote(result.data);
    } else {
      setQuote(null);
      setError(result.error);
    }
  }, [cartLines]);

  React.useEffect(() => {
    if (cart.hydrated) void refreshQuote();
  }, [cart.hydrated, refreshQuote]);

  // Move focus to the step heading on step change (screen-reader orientation).
  React.useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const shippingMethod =
    quote?.shippingMethods.find((m) => m.id === shippingMethodId) ?? quote?.shippingMethods[0];
  const subtotal = quote?.subtotal ?? 0;
  const shippingCost = shippingMethod?.cost ?? 0;
  const grandTotal = subtotal + shippingCost;

  const goNext = () => {
    if (step === "address") {
      const errors = validateAddress(addressForm);
      setAddressErrors(errors);
      if (Object.keys(errors).length > 0) return;
      setStep("shipping");
    } else if (step === "shipping") {
      setStep("payment");
    } else if (step === "payment") {
      void refreshQuote(); // fresh server numbers for the review step
      setStep("review");
    }
  };

  const goBack = () => {
    const prev = STEPS[Math.max(0, stepIndex - 1)];
    setStep(prev.id);
  };

  const placeOrder = async () => {
    setPlacing(true);
    setError(null);
    const result = await placeStorefrontOrderAction({
      items: cartLines,
      shipping: {
        receiverName: addressForm.receiverName,
        phone: addressForm.phone,
        email: addressForm.email || undefined,
        division: addressForm.division,
        district: addressForm.district,
        upazila: addressForm.upazila,
        area: addressForm.upazila,
        postalCode: addressForm.postalCode || undefined,
        address: addressForm.address,
        landmark: addressForm.landmark || undefined,
        addressLabel: addressForm.addressLabel,
        deliveryNote: addressForm.deliveryNote || undefined,
      },
      shippingMethodId,
      paymentMethod,
    });
    setPlacing(false);

    if (!result.success) {
      setError(result.error);
      void refreshQuote();
      return;
    }

    cart.clear();
    const params = new URLSearchParams({
      n: result.data.orderNumber,
      k: result.data.accessToken,
    });
    router.push(`/order/success?${params.toString()}`);
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

  return (
    <div className="space-y-6">
      {/* Progress */}
      <nav aria-label="চেকআউট ধাপ" className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isDone = i < stepIndex;
          const isCurrent = i === stepIndex;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-initial">
              <div
                className="flex flex-col sm:flex-row items-center gap-1.5"
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 shrink-0",
                    isCurrent
                      ? "border-amber-500 bg-amber-500 text-slate-950"
                      : isDone
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-white text-slate-400",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span
                  className={cn(
                    "text-[11px] sm:text-xs font-black",
                    isCurrent ? "text-slate-900" : "text-slate-500",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className={cn(
                    "h-0.5 flex-1 mx-2 rounded",
                    i < stepIndex ? "bg-emerald-400" : "bg-slate-200",
                  )}
                />
              )}
            </div>
          );
        })}
      </nav>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-bold text-red-800"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {quote && quote.rejected.length > 0 && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-900 space-y-1"
        >
          <p className="font-black">কিছু প্রোডাক্ট অর্ডার করা যাচ্ছে না:</p>
          {quote.rejected.map((r) => (
            <p key={`${r.productId}-${r.variantSku ?? ""}`}>
              • {r.name ?? "প্রোডাক্ট"} — {r.reason}
            </p>
          ))}
          <p className="pt-1">
            <Link href="/cart" className="underline">
              কার্টে ফিরে গিয়ে আইটেমগুলো সরিয়ে দিন
            </Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left: form steps */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-lg font-black text-slate-900 outline-none"
          >
            {step === "address" && "ডেলিভারি ঠিকানা"}
            {step === "shipping" && "ডেলিভারি পদ্ধতি"}
            {step === "payment" && "পেমেন্ট পদ্ধতি"}
            {step === "review" && "অর্ডার রিভিউ"}
          </h1>

          {step === "address" && (
            <form
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                goNext();
              }}
              noValidate
            >
              <Field id="co-name" label="পুরো নাম" required error={addressErrors.receiverName}>
                <input
                  id="co-name"
                  className={inputClass}
                  autoComplete="name"
                  value={addressForm.receiverName}
                  onChange={(e) => setAddressForm((f) => ({ ...f, receiverName: e.target.value }))}
                />
              </Field>
              <Field id="co-phone" label="মোবাইল নম্বর" required error={addressErrors.phone}>
                <input
                  id="co-phone"
                  className={inputClass}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </Field>
              <Field id="co-email" label="ইমেইল (ঐচ্ছিক)" error={addressErrors.email}>
                <input
                  id="co-email"
                  className={inputClass}
                  type="email"
                  autoComplete="email"
                  value={addressForm.email}
                  onChange={(e) => setAddressForm((f) => ({ ...f, email: e.target.value }))}
                />
              </Field>
              <Field id="co-division" label="বিভাগ" required error={addressErrors.division}>
                <select
                  id="co-division"
                  className={inputClass}
                  value={addressForm.division}
                  onChange={(e) => setAddressForm((f) => ({ ...f, division: e.target.value }))}
                >
                  <option value="">বিভাগ নির্বাচন করুন</option>
                  {BD_DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="co-district" label="জেলা" required error={addressErrors.district}>
                <input
                  id="co-district"
                  className={inputClass}
                  autoComplete="address-level2"
                  value={addressForm.district}
                  onChange={(e) => setAddressForm((f) => ({ ...f, district: e.target.value }))}
                />
              </Field>
              <Field id="co-upazila" label="উপজেলা / এলাকা" required error={addressErrors.upazila}>
                <input
                  id="co-upazila"
                  className={inputClass}
                  value={addressForm.upazila}
                  onChange={(e) => setAddressForm((f) => ({ ...f, upazila: e.target.value }))}
                />
              </Field>
              <Field id="co-postal" label="পোস্ট কোড (ঐচ্ছিক)" error={addressErrors.postalCode}>
                <input
                  id="co-postal"
                  className={inputClass}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm((f) => ({ ...f, postalCode: e.target.value }))}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  id="co-address"
                  label="সম্পূর্ণ ঠিকানা"
                  required
                  error={addressErrors.address}
                >
                  <textarea
                    id="co-address"
                    className={cn(inputClass, "h-20 py-2.5 resize-none")}
                    autoComplete="street-address"
                    placeholder="বাসা/হোল্ডিং নম্বর, রোড, এলাকা"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </Field>
              </div>
              <Field id="co-landmark" label="ল্যান্ডমার্ক (ঐচ্ছিক)">
                <input
                  id="co-landmark"
                  className={inputClass}
                  placeholder="কাছের পরিচিত স্থান"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm((f) => ({ ...f, landmark: e.target.value }))}
                />
              </Field>
              <fieldset>
                <legend className="block text-xs font-black text-slate-800 mb-1.5">
                  ঠিকানার ধরন
                </legend>
                <div className="flex gap-2">
                  {(
                    [
                      ["home", "বাসা"],
                      ["office", "অফিস"],
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      key={value}
                      className={cn(
                        "flex-1 flex items-center justify-center h-11 rounded-xl border text-xs font-black cursor-pointer transition-colors",
                        addressForm.addressLabel === value
                          ? "border-amber-500 bg-amber-50 text-amber-800"
                          : "border-slate-300 text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      <input
                        type="radio"
                        name="addressLabel"
                        value={value}
                        checked={addressForm.addressLabel === value}
                        onChange={() => setAddressForm((f) => ({ ...f, addressLabel: value }))}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="sm:col-span-2">
                <Field id="co-note" label="ডেলিভারি নোট (ঐচ্ছিক)">
                  <input
                    id="co-note"
                    className={inputClass}
                    value={addressForm.deliveryNote}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, deliveryNote: e.target.value }))
                    }
                  />
                </Field>
              </div>
            </form>
          )}

          {step === "shipping" && (
            <fieldset className="space-y-3">
              <legend className="sr-only">ডেলিভারি পদ্ধতি নির্বাচন করুন</legend>
              {(quote?.shippingMethods ?? SHIPPING_METHODS.filter((m) => m.enabled)).map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    "flex items-center justify-between gap-3 p-4 rounded-2xl border cursor-pointer transition-colors",
                    shippingMethodId === m.id
                      ? "border-amber-500 bg-amber-50/60"
                      : "border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={m.id}
                      checked={shippingMethodId === m.id}
                      onChange={() => setShippingMethodId(m.id)}
                      className="h-4 w-4 accent-amber-500"
                    />
                    <span>
                      <span className="block text-sm font-black text-slate-900">{m.label}</span>
                      <span className="block text-[11px] font-bold text-slate-500">
                        আনুমানিক: {m.eta}
                      </span>
                    </span>
                  </span>
                  <span className="text-sm font-black text-slate-900 tabular-nums">
                    {m.cost === 0 ? "ফ্রি" : formatBdt(m.cost)}
                  </span>
                </label>
              ))}
              {SHIPPING_METHODS.filter((m) => !m.enabled).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-dashed border-slate-200 opacity-60"
                  aria-disabled="true"
                >
                  <span>
                    <span className="block text-sm font-black text-slate-500">{m.label}</span>
                    <span className="block text-[11px] font-bold text-slate-400">শীঘ্রই আসছে</span>
                  </span>
                </div>
              ))}
            </fieldset>
          )}

          {step === "payment" && (
            <fieldset className="space-y-3">
              <legend className="sr-only">পেমেন্ট পদ্ধতি নির্বাচন করুন</legend>
              {PAYMENT_METHODS.map((m) =>
                m.enabled ? (
                  <label
                    key={m.id}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-colors",
                      paymentMethod === m.id
                        ? "border-amber-500 bg-amber-50/60"
                        : "border-slate-200 hover:bg-slate-50",
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="h-4 w-4 accent-amber-500"
                    />
                    <span>
                      <span className="block text-sm font-black text-slate-900">{m.label}</span>
                      {m.hint && (
                        <span className="block text-[11px] font-bold text-slate-500">{m.hint}</span>
                      )}
                    </span>
                  </label>
                ) : (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-slate-200 opacity-60"
                    aria-disabled="true"
                  >
                    <span>
                      <span className="block text-sm font-black text-slate-500">{m.label}</span>
                      <span className="block text-[11px] font-bold text-slate-400">
                        শীঘ্রই আসছে
                      </span>
                    </span>
                  </div>
                ),
              )}
            </fieldset>
          )}

          {step === "review" && (
            <div className="space-y-4">
              {quoteLoading ? (
                <div className="py-10 flex justify-center" aria-busy="true">
                  <Loader2
                    className="h-6 w-6 animate-spin text-amber-500"
                    aria-label="সর্বশেষ মূল্য যাচাই হচ্ছে"
                  />
                </div>
              ) : quote && quote.lines.length > 0 ? (
                <>
                  <ul className="divide-y divide-slate-100">
                    {quote.lines.map((line) => (
                      <li
                        key={`${line.productId}-${line.variantSku ?? ""}`}
                        className="flex items-center gap-3 py-3"
                      >
                        <div className="relative h-14 w-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          <Image
                            src={line.image || PRODUCT_IMAGE_PLACEHOLDER}
                            alt={line.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-900 line-clamp-1">
                            {line.name}
                          </p>
                          <p className="text-[11px] font-bold text-slate-500">
                            {line.variantSku ? `${line.variantSku} • ` : ""}
                            {line.quantity} × {formatBdt(line.unitPrice)}
                          </p>
                        </div>
                        <span className="text-xs font-black text-slate-900 tabular-nums">
                          {formatBdt(line.totalPrice)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 space-y-1">
                    <p className="font-black text-slate-900">
                      {addressForm.receiverName} — {addressForm.phone}
                    </p>
                    <p>
                      {addressForm.address}, {addressForm.upazila}, {addressForm.district},{" "}
                      {addressForm.division}
                    </p>
                    <p>
                      {shippingMethod?.label} ({shippingMethod?.eta}) •{" "}
                      {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                    </p>
                  </div>

                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                    সব মূল্য ও স্টক সার্ভারে যাচাই করা হয়েছে — অর্ডারের আগে আবারও যাচাই হবে।
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold text-slate-500 py-6 text-center">
                  অর্ডারযোগ্য কোনো আইটেম নেই।
                </p>
              )}
            </div>
          )}

          {/* Step controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {stepIndex > 0 ? (
              <Button
                variant="ghost"
                onClick={goBack}
                disabled={placing}
                className="text-xs font-black text-slate-600"
              >
                <ChevronLeft className="h-4 w-4 mr-1" aria-hidden />
                পেছনে
              </Button>
            ) : (
              <Link
                href="/cart"
                className="inline-flex items-center text-xs font-black text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
              >
                <ChevronLeft className="h-4 w-4 mr-1" aria-hidden />
                কার্টে ফিরুন
              </Link>
            )}

            {step !== "review" ? (
              <Button
                onClick={goNext}
                className="min-h-11 px-6 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                পরবর্তী ধাপ
              </Button>
            ) : (
              <Button
                onClick={placeOrder}
                disabled={placing || quoteLoading || !quote || quote.lines.length === 0}
                className="min-h-11 px-6 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                {placing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
                    অর্ডার হচ্ছে...
                  </>
                ) : (
                  `অর্ডার নিশ্চিত করুন (${formatBdt(grandTotal)})`
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Right: server-validated summary */}
        <aside
          className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3 lg:sticky lg:top-24"
          aria-label="অর্ডার সামারি"
        >
          <h2 className="text-sm font-black text-slate-900">অর্ডার সামারি</h2>
          {quoteLoading && !quote ? (
            <div className="space-y-2" aria-busy="true">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <dl className="space-y-2 text-xs font-bold text-slate-600">
              <div className="flex justify-between">
                <dt>সাবটোটাল ({quote?.lines.reduce((s, l) => s + l.quantity, 0) ?? 0} টি)</dt>
                <dd className="tabular-nums text-slate-900">{formatBdt(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>ডেলিভারি চার্জ</dt>
                <dd className="tabular-nums text-slate-900">
                  {shippingCost === 0 ? "ফ্রি" : formatBdt(shippingCost)}
                </dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm">
                <dt className="font-black text-slate-900">মোট</dt>
                <dd className="font-black text-slate-900 tabular-nums">{formatBdt(grandTotal)}</dd>
              </div>
            </dl>
          )}
          <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
            মূল্যগুলো সার্ভার থেকে যাচাইকৃত। অর্ডার নিশ্চিত করার মুহূর্তে চূড়ান্ত যাচাই হবে।
          </p>
        </aside>
      </div>
    </div>
  );
}
