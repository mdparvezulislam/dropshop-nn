"use client";

import * as React from "react";
import { ChevronDown, Check, Building2 } from "lucide-react";
import { STEADFAST_LOCATIONS, type SteadfastDistrict } from "@/shared/config/steadfast-locations";
import { cn } from "@/lib/utils/cn";

export interface CitySearchSelectProps {
  value: string;
  onChange: (cityName: string, isDhaka: boolean, deliveryFee: number) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function CitySearchSelect({
  value,
  onChange,
  disabled = false,
  required = false,
  className = "",
}: CitySearchSelectProps): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sorted districts A-Z
  const allDistricts = React.useMemo(() => {
    return [...STEADFAST_LOCATIONS].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Find selected district object
  const selectedDistrict = React.useMemo(() => {
    if (!value) return null;
    const v = value.toLowerCase().trim();
    return (
      allDistricts.find(
        (d) =>
          d.name.toLowerCase() === v ||
          d.id.toLowerCase() === v ||
          d.bnName.toLowerCase() === v ||
          v.includes(d.name.toLowerCase()),
      ) || null
    );
  }, [value, allDistricts]);

  // Display text when closed vs searching
  const displayValue = React.useMemo(() => {
    if (isOpen) return query;
    if (selectedDistrict) {
      return `${selectedDistrict.name} (${selectedDistrict.bnName})`;
    }
    return value || "";
  }, [isOpen, query, selectedDistrict, value]);

  // Filter items based on query
  const filteredDistricts = React.useMemo(() => {
    if (!query.trim()) return allDistricts;
    const q = query.toLowerCase().trim();
    return allDistricts.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.bnName.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q),
    );
  }, [allDistricts, query]);

  // Handle Outside Click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (dist: SteadfastDistrict) => {
    const isDhaka = dist.isDhaka;
    const deliveryFee = isDhaka ? 60 : 120;
    onChange(dist.name, isDhaka, deliveryFee);
    setQuery("");
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <div className={cn("space-y-1 relative", className)} ref={containerRef}>
      <label className="text-[11px] font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          সিটি {required && <span className="text-rose-500">*</span>}
        </span>
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={displayValue}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              setQuery("");
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="সিটি বা জেলা নির্বাচন/খুঁজুন (যেমন: Dhaka, Cumilla)..."
          className="w-full h-10 sm:h-11 pl-3.5 pr-9 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-text disabled:opacity-50"
        />

        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer flex items-center"
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
              setQuery("");
            }
          }}
        >
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-150">
          {filteredDistricts.length === 0 ? (
            <div className="p-3 text-center text-xs font-semibold text-slate-400">
              কোনো সিটি পাওয়া যায়নি
            </div>
          ) : (
            filteredDistricts.map((dist) => {
              const isSelected = selectedDistrict?.id === dist.id;
              return (
                <button
                  key={dist.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(dist);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(dist);
                  }}
                  className={cn(
                    "w-full min-h-[40px] px-3.5 py-2 text-left text-xs font-bold rounded-xl flex items-center justify-between transition-colors cursor-pointer select-none",
                    isSelected
                      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-black"
                      : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                  )}
                >
                  <span>
                    {dist.name}{" "}
                    <span className="text-slate-400 font-normal">({dist.bnName})</span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
