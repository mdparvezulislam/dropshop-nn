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

/**
 * Single-screen checkout.
 *
 * Four questions — name, phone, district, full address — plus an optional
 * email and note. There is no payment step: cash on delivery is the only
 * settlement method the platform supports, so offering a choice of one is a
 * step that exists purely to be clicked through.
 *
 * The client still sends only ids, SKUs and quantities. Every price and the
 * final total come from `quoteStorefrontCheckoutAction`, and the order is
 * re-quoted server-side at placement — the summary below is display of the
 * server's numbers, never a client calculation.
 */

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
  if (!form.districtId) errors.districtId = "জেলা নির্বাচন করুন";
  if (form.address.trim().length < 8) {
    errors.address = "সম্পূর্ণ ঠিকানা লিখুন (বাসা/রোড/এলাকা)";
  }
  return errors;
}

const inputBase =
  "w-full h-12 rounded-xl border bg-white text-sm font-semibold text-slate-900 " +
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
      <label htmlFor={id} className="block text-xs font-black text-slate-800">
        {label}
        {required && (
          <span className="text-red-600 ml-0.5" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] font-semibold text-slate-500">{hint}</p>}
      {error && (
        <p className="text-[11px] font-bold text-red-600" role="alert">
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
        className={cn(inputBase, "pl-10 pr-3.5", error ? "border-red-400" : "border-slate-300")}
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
  const subtotal = quote?.subtotal ?? 0;
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

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-5">
      {/* ── Left: the form ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="bg-white -mx-3 sm:mx-0 border-y sm:border border-slate-200 rounded-none sm:rounded-3xl px-4 py-5 sm:p-7 sm:shadow-xs space-y-4">
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900">অর্ডার কনফার্ম করুন</h1>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              নাম, মোবাইল নম্বর ও ঠিকানা দিন — আমরা ফোনে কনফার্ম করে পণ্য পাঠিয়ে দেব।
            </p>
          </div>

          {error && (
            <div
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 outline-none"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          {quote && quote.rejected.length > 0 && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-900 space-y-1"
            >
              <p className="font-black">কিছু প্রোডাক্ট অর্ডার করা যাচ্ছে না:</p>
              {quote.rejected.map((r) => (
                <p key={`${r.productId}-${r.variantSku ?? ""}`}>
                  • {r.name ?? "প্রোডাক্ট"} — {r.reason}
                </p>
              ))}
            </div>
          )}

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

          <Field
            id="email"
            label="ইমেইল (ঐচ্ছিক)"
            error={errors.email}
            hint="দিলে অর্ডারটি আপনার অ্যাকাউন্টের অর্ডার হিস্টোরিতে যুক্ত হবে।"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Field id="district" label="জেলা" required error={errors.districtId}>
              <DistrictSelect
                id="district"
                value={form.districtId}
                onChange={onDistrictChange}
                error={Boolean(errors.districtId)}
              />
            </Field>

            <Field id="thana" label="থানা / উপজেলা (ঐচ্ছিক)">
              <ThanaSelect
                id="thana"
                districtId={form.districtId}
                value={form.upazila}
                onChange={(thana) => set("upazila", thana)}
              />
            </Field>
          </div>

          <Field
            id="address"
            label="সম্পূর্ণ ঠিকানা"
            required
            error={errors.address}
            hint="বাসা/হোল্ডিং নম্বর, রোড, এলাকা ও থানা লিখুন।"
          >
            <textarea
              id="address"
              rows={3}
              autoComplete="street-address"
              placeholder="যেমন: বাসা ১২, রোড ৫, ধানমন্ডি, ধানমন্ডি থানা"
              value={form.address}
              aria-invalid={Boolean(errors.address) || undefined}
              onChange={(e) => set("address", e.target.value)}
              className={cn(
                inputBase,
                "h-auto py-3 px-3.5 resize-y leading-relaxed",
                errors.address ? "border-red-400" : "border-slate-300",
              )}
            />
          </Field>

          {/* Delivery zone */}
          <fieldset className="space-y-1.5">
            <legend className="text-xs font-black text-slate-800 mb-1.5">
              ডেলিভারি এরিয়া
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
                      "flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 cursor-pointer transition-colors",
                      active
                        ? "border-amber-500 bg-amber-50"
                        : "border-slate-200 bg-white hover:border-slate-300",
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
                      <span className="block text-xs font-black text-slate-900 truncate">
                        {method.label}
                      </span>
                      <span className="block text-[11px] font-bold text-slate-500">
                        {formatBdt(method.cost)} • {method.eta}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <Field id="deliveryNote" label="বিশেষ নির্দেশনা (ঐচ্ছিক)">
            <textarea
              id="deliveryNote"
              rows={2}
              maxLength={300}
              placeholder="যেমন: ডেলিভারির আগে ফোন করবেন"
              value={form.deliveryNote}
              onChange={(e) => set("deliveryNote", e.target.value)}
              className={cn(inputBase, "h-auto py-3 px-3.5 resize-y border-slate-300")}
            />
          </Field>

          {/* Payment — COD only, stated rather than selected */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <Wallet className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden />
            <div className="text-xs">
              <p className="font-black text-emerald-900">ক্যাশ অন ডেলিভারি</p>
              <p className="font-bold text-emerald-800/80 mt-0.5">
                পণ্য হাতে পাওয়ার পর ডেলিভারি ম্যানকে মূল্য পরিশোধ করবেন। এখন কোনো অগ্রিম পেমেন্ট
                লাগবে না।
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/cart"
          className="inline-flex items-center text-xs font-black text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
        >
          <ChevronLeft className="h-4 w-4 mr-1" aria-hidden />
          কার্টে ফিরুন
        </Link>
      </div>

      {/* ── Right: server-quoted summary ───────────────────────────── */}
      <aside
        className="bg-white -mx-3 sm:mx-0 border-y sm:border border-slate-200 rounded-none sm:rounded-3xl px-4 py-5 sm:p-6 sm:shadow-xs space-y-4 lg:sticky lg:top-24 h-fit"
        aria-label="অর্ডার সামারি"
      >
        <h2 className="text-sm font-black text-slate-900">অর্ডার সামারি</h2>

        <ul className="divide-y divide-slate-100">
          {cart.items.map((line) => (
            <li
              key={`${line.productId}-${line.variantSku ?? ""}`}
              className="flex items-center gap-3 py-2.5"
            >
              <div className="relative h-12 w-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                <Image
                  src={line.image || PRODUCT_IMAGE_PLACEHOLDER}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-slate-900 line-clamp-2 leading-snug">
                  {line.name}
                </p>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                  {line.variantLabel ? `${line.variantLabel} • ` : ""}
                  {line.quantity} × {formatBdt(line.unitPrice)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {quoteLoading && !quote ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <dl className="space-y-2 text-xs font-bold text-slate-600 pt-1 border-t border-slate-100">
            <div className="flex justify-between">
              <dt>সাবটোটাল {itemCount > 0 ? `(${itemCount} টি)` : ""}</dt>
              <dd className="tabular-nums text-slate-900">{formatBdt(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                ডেলিভারি চার্জ
              </dt>
              <dd className="tabular-nums text-slate-900">
                {shippingCost === 0 ? "ফ্রি" : formatBdt(shippingCost)}
              </dd>
            </div>
            <div className="flex justify-between pt-2.5 border-t border-slate-100 text-base">
              <dt className="font-black text-slate-900">সর্বমোট</dt>
              <dd className="font-black text-slate-900 tabular-nums">{formatBdt(grandTotal)}</dd>
            </div>
          </dl>
        )}

        <Button
          type="submit"
          disabled={placing || quoteLoading || !quote || quote.lines.length === 0}
          className="w-full h-13 min-h-12 text-sm font-black bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 rounded-xl shadow-md transition-transform disabled:opacity-50"
        >
          {placing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
              অর্ডার হচ্ছে...
            </>
          ) : (
            `অর্ডার কনফার্ম করুন — ${formatBdt(grandTotal)}`
          )}
        </Button>

        <p className="flex items-start gap-1.5 text-[11px] font-bold text-slate-500 leading-relaxed">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-px text-emerald-600" aria-hidden />
          মূল্য ও স্টক অর্ডার নিশ্চিত করার মুহূর্তে সার্ভারে আবার যাচাই করা হয়।
        </p>
      </aside>
    </form>
  );
}

export default CheckoutFlow;
