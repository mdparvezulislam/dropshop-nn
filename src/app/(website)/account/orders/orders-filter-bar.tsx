"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "সব অর্ডার" },
  { value: "pending", label: "অপেক্ষমাণ" },
  { value: "confirmed", label: "নিশ্চিত" },
  { value: "shipped", label: "শিপড" },
  { value: "delivered", label: "ডেলিভারড" },
  { value: "cancelled", label: "বাতিল" },
  { value: "returned", label: "রিটার্ন" },
] as const;

const inputClass =
  "h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-500";

/** URL-driven filter bar — the list itself renders on the server. */
export function OrdersFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/account/orders?${params.toString()}`);
  };

  return (
    <form
      className="flex flex-wrap items-end gap-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setParam("q", String(form.get("q") ?? "").trim());
      }}
    >
      <div className="flex-1 min-w-44">
        <label htmlFor="orders-search" className="block text-[11px] font-black text-slate-700 mb-1">
          অর্ডার নম্বর খুঁজুন
        </label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
            aria-hidden
          />
          <input
            id="orders-search"
            name="q"
            defaultValue={searchParams.get("q") ?? ""}
            placeholder="ORD-..."
            className={`${inputClass} w-full pl-9`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="orders-status" className="block text-[11px] font-black text-slate-700 mb-1">
          স্ট্যাটাস
        </label>
        <select
          id="orders-status"
          value={searchParams.get("status") ?? ""}
          onChange={(e) => setParam("status", e.target.value)}
          className={inputClass}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="orders-from" className="block text-[11px] font-black text-slate-700 mb-1">
          তারিখ থেকে
        </label>
        <input
          id="orders-from"
          type="date"
          value={searchParams.get("from") ?? ""}
          onChange={(e) => setParam("from", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="orders-to" className="block text-[11px] font-black text-slate-700 mb-1">
          পর্যন্ত
        </label>
        <input
          id="orders-to"
          type="date"
          value={searchParams.get("to") ?? ""}
          onChange={(e) => setParam("to", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="orders-sort" className="block text-[11px] font-black text-slate-700 mb-1">
          সাজান
        </label>
        <select
          id="orders-sort"
          value={searchParams.get("sort") ?? "newest"}
          onChange={(e) => setParam("sort", e.target.value)}
          className={inputClass}
        >
          <option value="newest">নতুন আগে</option>
          <option value="oldest">পুরাতন আগে</option>
        </select>
      </div>

      <button
        type="submit"
        className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
      >
        খুঁজুন
      </button>
    </form>
  );
}
