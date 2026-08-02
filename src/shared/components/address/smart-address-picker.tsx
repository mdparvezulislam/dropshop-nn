"use client";

import * as React from "react";
import { DistrictCombobox } from "./district-combobox";
import { UpazilaCombobox } from "./upazila-combobox";
import type { SteadfastDistrictEntity } from "@/features/address/domain/address-entity";
import { cn } from "@/lib/utils/cn";

interface SmartAddressPickerProps {
  districtValue: string;
  upazilaValue: string;
  onDistrictChange: (districtName: string, isDhaka: boolean, deliveryFeeTaka: number) => void;
  onUpazilaChange: (upazilaName: string) => void;
  onFinishAddressFocus?: () => void;
  disabled?: boolean;
  className?: string;
}

export function SmartAddressPicker({
  districtValue,
  upazilaValue,
  onDistrictChange,
  onUpazilaChange,
  onFinishAddressFocus,
  disabled = false,
  className,
}: SmartAddressPickerProps): React.ReactElement {
  const upazilaInputRef = React.useRef<HTMLSelectElement>(null);

  const handleDistrictSelect = (districtName: string, entity?: SteadfastDistrictEntity) => {
    const isDhaka = entity?.isDhaka ?? districtName.toLowerCase().includes("dhaka");
    const deliveryFee = isDhaka ? 60 : 120;
    onDistrictChange(districtName, isDhaka, deliveryFee);
    onUpazilaChange("");

    // Auto-focus Upazila select on district change
    setTimeout(() => {
      if (upazilaInputRef.current) {
        upazilaInputRef.current.focus();
      }
    }, 100);
  };

  const handleUpazilaSelect = (upazilaName: string) => {
    onUpazilaChange(upazilaName);
    if (onFinishAddressFocus) {
      setTimeout(() => {
        onFinishAddressFocus();
      }, 100);
    }
  };

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
      <DistrictCombobox
        value={districtValue}
        onChange={handleDistrictSelect}
        disabled={disabled}
        required
      />

      <UpazilaCombobox
        ref={upazilaInputRef}
        districtName={districtValue}
        value={upazilaValue}
        onChange={handleUpazilaSelect}
        disabled={disabled}
      />
    </div>
  );
}
