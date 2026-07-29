"use client";

import * as React from "react";
import { Check, ChevronDown, Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getUpazilasByDistrict } from "@/config/bd-upazilas";

export interface ThanaSelectProps {
  districtId: string;
  value: string;
  onChange: (thana: string) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function ThanaSelect({
  districtId,
  value,
  onChange,
  id = "thana",
  disabled = false,
  placeholder = "Select Thana (Optional)",
}: ThanaSelectProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const availableThanas = React.useMemo(
    () => getUpazilasByDistrict(districtId),
    [districtId],
  );

  const filtered = React.useMemo(() => {
    if (!query.trim()) return availableThanas;
    const q = query.toLowerCase().trim();
    return availableThanas.filter((item) => item.toLowerCase().includes(q));
  }, [availableThanas, query]);

  // Close when clicking outside
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const selectThana = (item: string) => {
    onChange(item);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        id={id}
        disabled={disabled || !districtId}
        onClick={() => {
          if (!disabled && districtId) {
            setOpen((prev) => !prev);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={cn(
          "w-full h-12 px-3.5 rounded-xl border bg-white text-sm font-semibold text-slate-900 flex items-center justify-between transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-amber-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed",
          value ? "text-slate-900 border-slate-300" : "text-slate-400 border-slate-300",
        )}
      >
        <span className="truncate">
          {value || (districtId ? placeholder : "প্রথমে জেলা নির্বাচন করুন")}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && districtId && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-2xl border border-slate-300 bg-white shadow-xl overflow-hidden text-slate-900 max-h-64 flex flex-col">
          <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="থানা / উপজেলা লিখুন..."
              className="w-full text-xs font-semibold bg-transparent focus:outline-none placeholder:text-slate-400 text-slate-900"
            />
          </div>

          <ul className="overflow-y-auto p-1.5 space-y-0.5 max-h-48 text-xs font-semibold">
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const isSelected = value === item;
                return (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => selectThana(item)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors",
                        isSelected ? "bg-amber-50 text-amber-900 font-extrabold" : "hover:bg-slate-100 text-slate-700",
                      )}
                    >
                      <span>{item}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-amber-600 shrink-0" />}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-3 text-center text-slate-500">
                <p>কোনো মিল পাওয়া যায়নি</p>
                {query.trim() && (
                  <button
                    type="button"
                    onClick={() => selectThana(query.trim())}
                    className="mt-1 px-3 py-1 bg-amber-500 text-slate-950 rounded-lg text-xs font-extrabold hover:bg-amber-600 transition-colors"
                  >
                    "{query.trim()}" হিসেবে যোগ করুন
                  </button>
                )}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
