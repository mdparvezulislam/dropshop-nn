"use client";

import * as React from "react";
import { STEADFAST_LOCATIONS } from "@/shared/config/steadfast-locations";
import type { SteadfastDistrictEntity } from "@/features/address/domain/address-entity";

interface DistrictComboboxProps {
  value: string;
  onChange: (districtName: string, districtEntity?: SteadfastDistrictEntity) => void;
  disabled?: boolean;
  required?: boolean;
  inputRef?: React.Ref<HTMLSelectElement>;
  className?: string;
}

export const DistrictCombobox = React.forwardRef<HTMLSelectElement, DistrictComboboxProps>(
  (
    {
      value,
      onChange,
      disabled = false,
      required = false,
      inputRef,
      className = "",
    },
    ref,
  ) => {
    // Sort all districts A-Z alphabetically by English name
    const sortedDistricts = React.useMemo(() => {
      return [...STEADFAST_LOCATIONS].sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedVal = e.target.value;
      const found = sortedDistricts.find(
        (d) =>
          d.name.toLowerCase() === selectedVal.toLowerCase() ||
          d.id.toLowerCase() === selectedVal.toLowerCase() ||
          d.bnName === selectedVal,
      );

      const entity: SteadfastDistrictEntity | undefined = found
        ? {
            districtId: found.id,
            districtNameEn: found.name,
            districtNameBn: found.bnName,
            isDhaka: found.isDhaka,
          }
        : undefined;

      const finalName = found ? found.name : selectedVal;
      onChange(finalName, entity);
    };

    // Normalize value to match option
    const selectedValue = React.useMemo(() => {
      if (!value) return "";
      const valLower = value.toLowerCase().trim();
      const matched = sortedDistricts.find(
        (d) =>
          d.name.toLowerCase() === valLower ||
          d.id.toLowerCase() === valLower ||
          d.bnName.toLowerCase() === valLower ||
          valLower.includes(d.name.toLowerCase()),
      );
      return matched ? matched.name : value;
    }, [value, sortedDistricts]);

    return (
      <div className={`space-y-1 relative ${className}`}>
        <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
          জেলা {required && <span className="text-rose-500">*</span>}
        </label>
        <select
          ref={ref || inputRef}
          value={selectedValue}
          onChange={handleChange}
          disabled={disabled}
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
            জেলা নির্বাচন করুন...
          </option>
          {sortedDistricts.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name} ({d.bnName})
            </option>
          ))}
        </select>
      </div>
    );
  },
);

DistrictCombobox.displayName = "DistrictCombobox";
