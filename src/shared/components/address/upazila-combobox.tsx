"use client";

import * as React from "react";
import { getDistrictByName } from "@/shared/config/steadfast-locations";

interface UpazilaComboboxProps {
  districtName: string;
  value: string;
  onChange: (upazilaName: string) => void;
  disabled?: boolean;
  required?: boolean;
  inputRef?: React.Ref<HTMLSelectElement>;
  className?: string;
}

export const UpazilaCombobox = React.forwardRef<HTMLSelectElement, UpazilaComboboxProps>(
  (
    {
      districtName,
      value,
      onChange,
      disabled = false,
      required = false,
      inputRef,
      className = "",
    },
    ref,
  ) => {
    // Synchronously resolve upazilas for selected district
    const upazilaList = React.useMemo(() => {
      if (!districtName || !districtName.trim()) return [];
      const dist = getDistrictByName(districtName);
      if (!dist || !dist.upazilas) return [];
      return dist.upazilas;
    }, [districtName]);

    const isDisabled = disabled || !districtName || upazilaList.length === 0;

    return (
      <div className={`space-y-1 relative ${className}`}>
        <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
          উপজেলা / থানা {required && <span className="text-rose-500">*</span>}
        </label>
        <select
          ref={ref || inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled}
          required={required}
          className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold outline-none focus:border-amber-500 transition-all cursor-pointer disabled:opacity-50 shadow-2xs appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%6b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: `right 0.75rem center`,
            backgroundRepeat: `no-repeat`,
            backgroundSize: `1.25em 1.25em`,
          }}
        >
          <option value="" disabled>
            {districtName ? "উপজেলা / থানা নির্বাচন করুন..." : "প্রথমে জেলা নির্বাচন করুন"}
          </option>
          {upazilaList.map((uName) => (
            <option key={uName} value={uName}>
              {uName}
            </option>
          ))}
        </select>
      </div>
    );
  },
);

UpazilaCombobox.displayName = "UpazilaCombobox";
