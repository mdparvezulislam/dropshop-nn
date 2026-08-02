"use client";

import * as React from "react";
import { STEADFAST_LOCATIONS, calculateSteadfastDeliveryCharge, getDistrictByName, type SteadfastDistrict } from "../config/steadfast-locations";
import { MapPin, Navigation, Search, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SteadfastLocationSelectProps {
  districtValue: string;
  upazilaValue: string;
  onDistrictChange: (district: string, isDhaka: boolean, deliveryFeeTaka: number) => void;
  onUpazilaChange: (upazila: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SteadfastLocationSelect({
  districtValue,
  upazilaValue,
  onDistrictChange,
  onUpazilaChange,
  disabled = false,
  className,
}: SteadfastLocationSelectProps): React.ReactElement {
  const [districtOpen, setDistrictOpen] = React.useState(false);
  const [districtSearch, setDistrictSearch] = React.useState("");

  const [upazilaOpen, setUpazilaOpen] = React.useState(false);
  const [upazilaSearch, setUpazilaSearch] = React.useState("");

  const currentDistrict = getDistrictByName(districtValue);
  const upazilaList = currentDistrict?.upazilas || [];

  const districtRef = React.useRef<HTMLDivElement>(null);
  const upazilaRef = React.useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (districtRef.current && !districtRef.current.contains(e.target as Node)) {
        setDistrictOpen(false);
      }
      if (upazilaRef.current && !upazilaRef.current.contains(e.target as Node)) {
        setUpazilaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered Districts
  const filteredDistricts = React.useMemo(() => {
    if (!districtSearch.trim()) return STEADFAST_LOCATIONS;
    const q = districtSearch.toLowerCase().trim();
    return STEADFAST_LOCATIONS.filter(
      (d) => d.name.toLowerCase().includes(q) || d.bnName.includes(q),
    );
  }, [districtSearch]);

  // Filtered Upazilas
  const filteredUpazilas = React.useMemo(() => {
    if (!upazilaSearch.trim()) return upazilaList;
    const q = upazilaSearch.toLowerCase().trim();
    return upazilaList.filter((u) => u.toLowerCase().includes(q));
  }, [upazilaList, upazilaSearch]);

  // When a District is selected -> Auto-select the 1st Upazila of that District!
  const handleSelectDistrict = (loc: SteadfastDistrict) => {
    const isDhaka = loc.isDhaka;
    const fee = calculateSteadfastDeliveryCharge(loc.name);
    onDistrictChange(loc.name, isDhaka, fee);

    // Auto-select 1st Upazila of the selected District
    const firstUpazila = loc.upazilas && loc.upazilas.length > 0 ? loc.upazilas[0] : "";
    onUpazilaChange(firstUpazila);

    setDistrictOpen(false);
    setDistrictSearch("");
  };

  const handleSelectUpazila = (uName: string) => {
    onUpazilaChange(uName);
    setUpazilaOpen(false);
    setUpazilaSearch("");
  };

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
      {/* 1. DISTRICT FIELD */}
      <div className="space-y-1 relative" ref={districtRef}>
        <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-amber-500" />
          <span>জেলা <span className="text-rose-500">*</span></span>
        </label>

        {/* Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setDistrictOpen((prev) => !prev);
              setUpazilaOpen(false);
            }
          }}
          className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold flex items-center justify-between outline-none focus:border-amber-500 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
        >
          <span className="truncate">
            {districtValue
              ? `${districtValue} (${currentDistrict?.bnName || districtValue})`
              : "জেলা নির্বাচন করুন"}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {/* Dropdown Popover */}
        {districtOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Search Bar inside Dropdown */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                placeholder="জেলা খুঁজুন..."
                className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400"
              />
              {districtSearch && (
                <button
                  type="button"
                  onClick={() => setDistrictSearch("")}
                  className="p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredDistricts.length === 0 ? (
                <div className="p-3 text-center text-xs font-semibold text-slate-400">
                  কোনো জেলা পাওয়া যায়নি
                </div>
              ) : (
                filteredDistricts.map((loc) => {
                  const isSelected = districtValue.toLowerCase() === loc.name.toLowerCase();
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectDistrict(loc)}
                      className={cn(
                        "w-full px-3 py-2.5 text-left text-xs font-bold rounded-xl flex items-center justify-between transition-colors cursor-pointer",
                        isSelected
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                          : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                      )}
                    >
                      <span>
                        {loc.name} ({loc.bnName})
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-amber-500" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. UPAZILA FIELD */}
      <div className="space-y-1 relative" ref={upazilaRef}>
        <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
          <Navigation className="w-3.5 h-3.5 text-amber-500" />
          <span>উপজেলা / থানা</span>
        </label>

        {upazilaList.length > 0 ? (
          <>
            {/* Trigger Button */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  setUpazilaOpen((prev) => !prev);
                  setDistrictOpen(false);
                }
              }}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold flex items-center justify-between outline-none focus:border-amber-500 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <span className="truncate">
                {upazilaValue || "উপজেলা / থানা নির্বাচন করুন"}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {/* Dropdown Popover */}
            {upazilaOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Search Bar inside Dropdown */}
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    value={upazilaSearch}
                    onChange={(e) => setUpazilaSearch(e.target.value)}
                    placeholder="উপজেলা / থানা খুঁজুন..."
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400"
                  />
                  {upazilaSearch && (
                    <button
                      type="button"
                      onClick={() => setUpazilaSearch("")}
                      className="p-0.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Options List */}
                <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredUpazilas.length === 0 ? (
                    <div className="p-3 text-center text-xs font-semibold text-slate-400">
                      কোনো থানা/উপজেলা পাওয়া যায়নি
                    </div>
                  ) : (
                    filteredUpazilas.map((u, idx) => {
                      const isSelected = upazilaValue.toLowerCase() === u.toLowerCase();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectUpazila(u)}
                          className={cn(
                            "w-full px-3 py-2.5 text-left text-xs font-bold rounded-xl flex items-center justify-between transition-colors cursor-pointer",
                            isSelected
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                              : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                          )}
                        >
                          <span>{u}</span>
                          {isSelected && <Check className="w-4 h-4 text-amber-500" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <input
            type="text"
            disabled={disabled}
            value={upazilaValue}
            onChange={(e) => onUpazilaChange(e.target.value)}
            placeholder="উপজেলা বা থানার নাম লিখুন..."
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold outline-none focus:border-amber-500 transition-all shadow-2xs"
          />
        )}
      </div>
    </div>
  );
}
